import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

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
    const session = await getAdminSession();

    if (!session.token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login ulang.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const result = await serverApi(API_ENDPOINTS.admin.changePassword, {
      method: "POST",
      token: session.token,
      body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("CHANGE_ADMIN_PASSWORD_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengganti password admin."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}