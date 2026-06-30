import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(1, "Jumlah penarikan wajib diisi."),
  bankAccount: z.string().optional().nullable(),
});

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

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("player_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
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
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = withdrawSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data withdraw tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.player.withdraw, {
      method: "POST",
      token,
      headers: makePublicHeaders(tenantHost),
      body: {
        amount: parsed.data.amount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Request withdraw berhasil dibuat.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_PLAYER_WITHDRAW_REQUEST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal membuat request withdraw."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}