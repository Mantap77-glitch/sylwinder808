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

async function getClientSession() {
  const session = await getAdminSession();

  if (
    session.isSuperAdmin ||
    session.role === "SUPER_ADMIN" ||
    !session.tenantId ||
    !session.token
  ) {
    return null;
  }

  return session;
}

export async function GET() {
  try {
    const session = await getClientSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.domains, {
      method: "GET",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET_DOMAIN_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil domain."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getClientSession();

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

    const result = await serverApi(API_ENDPOINTS.admin.domains, {
      method: "POST",
      token: session.token,
      body,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("CREATE_DOMAIN_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menambahkan domain."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getClientSession();

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

    const result = await serverApi(API_ENDPOINTS.admin.domains, {
      method: "PATCH",
      token: session.token,
      body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UPDATE_DOMAIN_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengubah status domain."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getClientSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Domain ID wajib diisi.",
        },
        { status: 400 }
      );
    }

    const result = await serverApi(`${API_ENDPOINTS.admin.domains}?id=${id}`, {
      method: "DELETE",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE_DOMAIN_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menghapus domain."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}