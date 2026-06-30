import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function cleanOptional(value?: FormDataEntryValue | null) {
  if (!value) return null;

  const text = String(value).trim();

  return text.length > 0 ? text : null;
}

function toBoolean(value: FormDataEntryValue | null, fallback = true) {
  if (value === null) return fallback;

  return String(value) === "true";
}

function toNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value || 0);

  return Number.isNaN(numberValue) ? 0 : numberValue;
}

async function saveBannerFile(file: File | null, req: Request) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran banner maksimal 5MB.");
  }

  await mkdir(uploadDir, {
    recursive: true,
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = file.name.split(".").pop() || "jpg";
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fileName = `banner-${Date.now()}-${crypto.randomUUID()}.${
    safeExtension || "jpg"
  }`;

  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  return `${origin.replace(/\/+$/, "")}/uploads/banners/${fileName}`;
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

function buildPayload({
  formData,
  imageUrl,
  includeImage,
}: {
  formData: FormData;
  imageUrl: string | null;
  includeImage: boolean;
}) {
  const title = String(formData.get("title") || "").trim();
  const subtitle = cleanOptional(formData.get("subtitle"));
  const href = cleanOptional(formData.get("href"));
  const placement = String(formData.get("placement") || "").trim();
  const isActive = toBoolean(formData.get("isActive"), true);
  const sortOrder = toNumber(formData.get("sortOrder"));

  return {
    title,
    subtitle,
    href,
    placement,
    isActive,
    sortOrder,
    ...(includeImage && imageUrl
      ? {
          imageUrl,
        }
      : {}),
  };
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

    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const placement = String(formData.get("placement") || "").trim();
    const imageFile = formData.get("imageFile") as File | null;

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

    const imageUrl = await saveBannerFile(imageFile, req);

    const result = await serverApi(API_ENDPOINTS.admin.banners, {
      method: "POST",
      token: session.token,
      body: buildPayload({
        formData,
        imageUrl,
        includeImage: Boolean(imageUrl),
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Banner berhasil ditambahkan.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_BANNER_ERROR:", error);

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

    const id = String(formData.get("id") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const placement = String(formData.get("placement") || "").trim();
    const imageFile = formData.get("imageFile") as File | null;

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

    const imageUrl = await saveBannerFile(imageFile, req);

    const result = await serverApi(API_ENDPOINTS.admin.bannerDetail(id), {
      method: "PATCH",
      token: session.token,
      body: buildPayload({
        formData,
        imageUrl,
        includeImage: Boolean(imageUrl),
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Banner berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error("UPDATE_BANNER_ERROR:", error);

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
          message: "Banner ID wajib diisi.",
        },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.bannerDetail(id), {
      method: "DELETE",
      token: session.token,
    });

    return NextResponse.json({
      success: true,
      message: "Banner berhasil dihapus.",
      data: result,
    });
  } catch (error) {
    console.error("DELETE_BANNER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(
          error,
          "Gagal menghapus banner. Pastikan backend sudah menyediakan DELETE /api/admin/settings/banners/[id]."
        ),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}