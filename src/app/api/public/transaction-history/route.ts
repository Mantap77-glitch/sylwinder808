import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

type ApiRecord = Record<string, unknown>;

type TransactionHistoryRow = {
  id: string;
  date: string;
  nominal: string;
  jenis: string;
  metode: string;
  status: string;
};

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTenantHost(req: Request) {
  return (
    process.env.PUBLIC_TENANT_HOST ||
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    ""
  ).trim();
}

function makePublicHeaders(tenantHost: string) {
  return {
    "x-tenant-host": tenantHost,
    "x-forwarded-host": tenantHost,
    "x-public-domain": tenantHost,
  };
}

function getBackendMessage(error: unknown, fallback: string) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as {
      error?: unknown;
      message?: unknown;
      errors?: unknown;
    } | null;

    if (typeof detail?.error === "string") return detail.error;
    if (typeof detail?.message === "string") return detail.message;

    if (
      Array.isArray(detail?.errors) &&
      typeof detail.errors[0] === "string"
    ) {
      return detail.errors[0];
    }

    return error.message || fallback;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

function getBackendStatus(error: unknown, fallback = 400) {
  if (error instanceof BackendApiError) {
    return error.status >= 400 ? error.status : fallback;
  }

  return fallback;
}

function getString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);

  return fallback;
}

function getAmount(item: ApiRecord) {
  return getString(item.amount ?? item.nominal ?? item.value ?? 0, "0");
}

function getDate(item: ApiRecord) {
  return getString(
    item.createdAt ?? item.date ?? item.updatedAt ?? new Date().toISOString(),
    new Date().toISOString()
  );
}

function normalizeJenis(value: unknown, fallback: string) {
  const jenis = getString(value || fallback).toUpperCase();

  if (jenis === "WITHDRAWAL") return "WITHDRAW";
  if (jenis === "WITHDRAW") return "WITHDRAW";
  if (jenis === "DEPOSIT") return "DEPOSIT";
  if (jenis === "ADJUSTMENT") return "ADJUSTMENT";

  return fallback;
}

function normalizeStatus(value: unknown) {
  const status = getString(value || "PENDING").toUpperCase();

  if (status === "SUCCESS") return "APPROVED";
  if (status === "APPROVE") return "APPROVED";
  if (status === "DECLINED") return "REJECTED";
  if (status === "REJECT") return "REJECTED";

  return status || "PENDING";
}

function normalizeMethod(value: unknown) {
  return getString(value || "-", "-").toUpperCase();
}

function normalizeRow(
  item: unknown,
  fallbackJenis: "DEPOSIT" | "WITHDRAW" | "ADJUSTMENT",
  index: number
): TransactionHistoryRow | null {
  if (!isRecord(item)) return null;

  const id = getString(item.id ?? `${fallbackJenis}-${index}`);
  const jenis = normalizeJenis(
    item.jenis ?? item.type ?? item.transactionType,
    fallbackJenis
  );

  return {
    id,
    date: getDate(item),
    nominal: getAmount(item),
    jenis,
    metode: normalizeMethod(item.metode ?? item.method ?? item.paymentMethod),
    status: normalizeStatus(item.status),
  };
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function normalizeTransactions(result: ApiRecord): TransactionHistoryRow[] {
  const direct =
    getArray(result.data).length > 0
      ? getArray(result.data)
      : getArray(result.transactions).length > 0
        ? getArray(result.transactions)
        : getArray(result.items);

  const directRows = direct
    .map((item, index) => normalizeRow(item, "DEPOSIT", index))
    .filter((item): item is TransactionHistoryRow => Boolean(item));

  const depositRows = getArray(result.deposits)
    .map((item, index) => normalizeRow(item, "DEPOSIT", index))
    .filter((item): item is TransactionHistoryRow => Boolean(item));

  const withdrawalRows = getArray(result.withdrawals)
    .map((item, index) => normalizeRow(item, "WITHDRAW", index))
    .filter((item): item is TransactionHistoryRow => Boolean(item));

  const adjustmentRows = getArray(result.adjustments)
    .map((item, index) => normalizeRow(item, "ADJUSTMENT", index))
    .filter((item): item is TransactionHistoryRow => Boolean(item));

  const rows =
    directRows.length > 0
      ? directRows
      : [...depositRows, ...withdrawalRows, ...adjustmentRows];

  return rows.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("player_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
          data: [],
        },
        { status: 401 }
      );
    }

    const tenantHost = getTenantHost(req);

    if (!tenantHost) {
      return NextResponse.json(
        {
          success: false,
          message: "Host public tidak ditemukan.",
          data: [],
        },
        { status: 400 }
      );
    }

    const result = await serverApi<ApiRecord>(
      API_ENDPOINTS.player.transactions,
      {
        method: "GET",
        token,
        headers: makePublicHeaders(tenantHost),
      }
    );

    const data = normalizeTransactions(result);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("PLAYER_TRANSACTION_HISTORY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil riwayat."),
        data: [],
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}