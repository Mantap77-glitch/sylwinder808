import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

type PlayerMeResponse = {
  success?: boolean;
  user?: unknown;
  player?: unknown;
  data?: unknown;
};

function getBackendMessage(error: unknown, fallback: string) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

function getBackendStatus(error: unknown, fallback = 401) {
  if (error instanceof BackendApiError) {
    return error.status >= 400 ? error.status : fallback;
  }

  return fallback;
}

function makePublicHeaders(tenantHost: string) {
  return {
    "x-tenant-host": tenantHost,
    "x-forwarded-host": tenantHost,
    "x-public-domain": tenantHost,
  };
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("player_token")?.value;
    const tenantHost =
      cookieStore.get("player_tenant_host")?.value ||
      process.env.PUBLIC_TENANT_HOST ||
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login ulang.",
        },
        { status: 401 }
      );
    }

    const result = await serverApi<PlayerMeResponse>(API_ENDPOINTS.player.me, {
      method: "GET",
      token,
      headers: makePublicHeaders(tenantHost),
    });

    const player = result.user || result.player || result.data || null;

    return NextResponse.json({
      success: true,
      player,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil data player."),
      },
      { status: getBackendStatus(error, 401) }
    );
  }
}