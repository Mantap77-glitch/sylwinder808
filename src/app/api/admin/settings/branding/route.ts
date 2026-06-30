import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

const uploadDir = path.join(process.cwd(), "public", "uploads", "branding");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function saveLogoFile(file: File | null, req: Request) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran logo maksimal 5MB.");
  }

  await mkdir(uploadDir, {
    recursive: true,
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = file.name.split(".").pop() || "png";
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fileName = `logo-${Date.now()}-${crypto.randomUUID()}.${
    safeExtension || "png"
  }`;

  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  return `${origin.replace(/\/+$/, "")}/uploads/branding/${fileName}`;
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

    const formData = await req.formData();

    const siteName = String(formData.get("siteName") || "").trim();
    const logoFile = formData.get("logoFile") as File | null;

    if (!siteName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama situs wajib diisi.",
        },
        { status: 400 }
      );
    }

    const uploadedLogoUrl = await saveLogoFile(logoFile, req);

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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Branding public website berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    console.error("UPDATE_BRANDING_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menyimpan branding."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}