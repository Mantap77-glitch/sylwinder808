import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

type ApiRecord = Record<string, unknown>;

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

async function getTenantHost() {
  const headerStore = await headers();

  const requestHost =
    headerStore.get("x-forwarded-host") || headerStore.get("host") || "";

  return process.env.PUBLIC_TENANT_HOST || requestHost;
}

function makePublicHeaders(tenantHost: string) {
  return {
    host: tenantHost,
    "x-forwarded-host": tenantHost,
    "x-tenant-host": tenantHost,
    "x-public-domain": tenantHost,
  };
}

function getTargets(result: ApiRecord) {
  const data = result.data;
  const targets = result.targets;
  const paymentTargets = result.paymentTargets;
  const banks = result.banks;

  if (Array.isArray(data)) return data;
  if (Array.isArray(targets)) return targets;
  if (Array.isArray(paymentTargets)) return paymentTargets;
  if (Array.isArray(banks)) return banks;

  return [];
}

export async function GET() {
  try {
    const tenantHost = await getTenantHost();

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

    const result = await serverApi<ApiRecord>(API_ENDPOINTS.public.paymentTargets, {
      method: "GET",
      headers: makePublicHeaders(tenantHost),
    });

    const data = getTargets(result);

    return NextResponse.json({
      success: true,
      data,
      targets: data,
      paymentTargets: data,
    });
  } catch (error) {
    console.error("PUBLIC_PAYMENT_TARGETS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(
          error,
          "Gagal mengambil payment target."
        ),
        data: [],
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}