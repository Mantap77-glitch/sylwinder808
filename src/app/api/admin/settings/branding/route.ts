import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDir = path.join(process.cwd(), "public", "uploads", "branding");
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

function isValidFile(value: unknown): value is File {
  return value instanceof File && value.size > 0;
}

function makeUploadFileName(file: File, prefix: string) {
  const extension = file.name.split(".").pop() || "png";
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "");

  return `${prefix}-${Date.now()}-${crypto.randomUUID()}.${
    safeExtension || "png"
  }`;
}

async function saveBrandingFile(req: Request, file: unknown, prefix: string) {
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

  const fileName = makeUploadFileName(file, prefix);
  const filePath = path.join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  const appOrigin = getAppOrigin(req);

  return `${appOrigin}/uploads/branding/${fileName}`;
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

    const result = await serverApi(API_ENDPOINTS.admin.brandingSetting, {
      method: "GET",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET_BRANDING_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil branding."),
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

    const siteName = String(formData.get("siteName") || "").trim();
    const logoFile = formData.get("logoFile");
    const faviconFile = formData.get("faviconFile");

    if (!siteName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama situs wajib diisi.",
        },
        { status: 400 }
      );
    }

    const uploadedLogoUrl = await saveBrandingFile(req, logoFile, "logo");
    const uploadedFaviconUrl = await saveBrandingFile(
      req,
      faviconFile,
      "favicon"
    );

    const result = await serverApi(API_ENDPOINTS.admin.brandingSetting, {
      method: "PATCH",
      token: session.token,
      body: {
        siteName,
        ...(uploadedLogoUrl
          ? {
              logoUrl: uploadedLogoUrl,
            }
          : {}),
        ...(uploadedFaviconUrl
          ? {
              faviconUrl: uploadedFaviconUrl,
            }
          : {}),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UPDATE_BRANDING_PROXY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menyimpan branding."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}