import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =======================
   ERROR HANDLER
======================= */
function getBackendMessage(error: unknown, fallback: string) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as {
      error?: unknown;
      message?: unknown;
      errors?: unknown;
    } | null;

    if (typeof detail?.error === "string") return detail.error;
    if (typeof detail?.message === "string") return detail.message;

    if (Array.isArray(detail?.errors)) {
      return String(detail.errors[0]);
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

/* =======================
   SESSION
======================= */
async function getClientAdminSession() {
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

/* =======================
   GET
======================= */
export async function GET() {
  try {
    const session = await getClientAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.banners, {
      method: "GET",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil banner."),
      },
      { status: getBackendStatus(error) }
    );
  }
}

/* =======================
   POST (CREATE)
======================= */
export async function POST(req: Request) {
  try {
    const session = await getClientAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    // penting: backend expect image (bukan imageFile)
    const imageFile = formData.get("image");

    if (imageFile && !(imageFile instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File tidak valid." },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.banners, {
      method: "POST",
      token: session.token,
      body: formData,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("CREATE_BANNER_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menambahkan banner."),
      },
      { status: getBackendStatus(error) }
    );
  }
}

/* =======================
   PATCH (UPDATE)
======================= */
export async function PATCH(req: Request) {
  try {
    const session = await getClientAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const id = String(formData.get("id") || "").trim();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID wajib diisi." },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.bannerDetail(id), {
      method: "PATCH",
      token: session.token,
      body: formData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UPDATE_BANNER_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal memperbarui banner."),
      },
      { status: getBackendStatus(error) }
    );
  }
}

/* =======================
   DELETE
======================= */
export async function DELETE(req: Request) {
  try {
    const session = await getClientAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner ID wajib diisi." },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.bannerDetail(id), {
      method: "DELETE",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE_BANNER_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menghapus banner."),
      },
      { status: getBackendStatus(error) }
    );
  }
}