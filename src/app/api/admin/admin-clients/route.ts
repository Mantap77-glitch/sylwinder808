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

async function getSuperAdminSession() {
  const session = await getAdminSession();

  if (
    !session.token ||
    (!session.isSuperAdmin && session.role !== "SUPER_ADMIN")
  ) {
    return null;
  }

  return session;
}

export async function GET() {
  try {
    const session = await getSuperAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.adminClients, {
      method: "GET",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET_ADMIN_CLIENTS_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil admin client."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSuperAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const result = await serverApi(API_ENDPOINTS.admin.adminClients, {
      method: "POST",
      token: session.token,
      body,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("CREATE_ADMIN_CLIENT_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal membuat admin client."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}