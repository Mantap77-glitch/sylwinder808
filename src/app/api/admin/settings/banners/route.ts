import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

function getAppOrigin(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (envUrl) {
    const cleanUrl = envUrl.trim().replace(/\/$/, "");

    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      return cleanUrl;
    }

    return `https://${cleanUrl}`;
  }

  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";

  const protocol = req.headers.get("x-forwarded-proto") || "https";

  return `${protocol}://${host}`.replace(/\/$/, "");
}

function cleanOptional(value?: FormDataEntryValue | null) {
  if (!value) return null;

  const text = String(value).trim();

  return text.length > 0 ? text : null;
}

function toBoolean(value: FormDataEntryValue | null) {
  const text = String(value || "").toLowerCase();

  return text === "true" || text === "1" || text === "on";
}

function toNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value || 0);

  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function isValidFile(value: unknown): value is File {
  return value instanceof File && value.size > 0;
}

function makeUploadFileName(file: File) {
  const extension = file.name.split(".").pop() || "jpg";
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "");

  return `banner-${Date.now()}-${crypto.randomUUID()}.${
    safeExtension || "jpg"
  }`;
}

async function saveBannerFile(req: Request, file: unknown) {
  if (!isValidFile(file)) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5MB.");
  }

  await mkdir(uploadDir, {
    recursive: true,
  });

  const fileName = makeUploadFileName(file);
  const filePath = path.join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  const appOrigin = getAppOrigin(req);

  return `${appOrigin}/uploads/banners/${fileName}`;
}

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

export async function GET() {
  try {
    const session = await getClientAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.banners, {
      method: "GET",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET_BANNERS_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil banner."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getClientAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const subtitle = cleanOptional(formData.get("subtitle"));
    const href = cleanOptional(formData.get("href"));
    const placement = String(formData.get("placement") || "").trim();
    const isActive = toBoolean(formData.get("isActive"));
    const sortOrder = toNumber(formData.get("sortOrder"));
    const imageFile = formData.get("imageFile");

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!placement) {
      return NextResponse.json(
        {
          success: false,
          message: "Placement wajib diisi.",
        },
        { status: 400 }
      );
    }

    const imageUrl = await saveBannerFile(req, imageFile);

    const result = await serverApi(API_ENDPOINTS.admin.banners, {
      method: "POST",
      token: session.token,
      body: {
        title,
        subtitle,
        imageUrl,
        href,
        placement,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("CREATE_BANNER_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menambahkan banner."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getClientAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const id = String(formData.get("id") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const subtitle = cleanOptional(formData.get("subtitle"));
    const href = cleanOptional(formData.get("href"));
    const placement = String(formData.get("placement") || "").trim();
    const isActive = toBoolean(formData.get("isActive"));
    const sortOrder = toNumber(formData.get("sortOrder"));
    const imageFile = formData.get("imageFile");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Banner ID wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!placement) {
      return NextResponse.json(
        {
          success: false,
          message: "Placement wajib diisi.",
        },
        { status: 400 }
      );
    }

    const uploadedImageUrl = await saveBannerFile(req, imageFile);

    const result = await serverApi(API_ENDPOINTS.admin.bannerDetail(id), {
      method: "PATCH",
      token: session.token,
      body: {
        title,
        subtitle,
        href,
        placement,
        isActive,
        sortOrder,
        ...(uploadedImageUrl
          ? {
              imageUrl: uploadedImageUrl,
            }
          : {}),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UPDATE_BANNER_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal memperbarui banner."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getClientAdminSession();

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
          message: "Banner ID wajib diisi.",
        },
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
      { status: getBackendStatus(error, 400) }
    );
  }
}