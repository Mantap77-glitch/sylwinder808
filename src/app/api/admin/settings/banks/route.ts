import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

const bankSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    code: z.string().min(1, "Kode wajib diisi."),
    type: z.enum(["BANK", "EWALLET", "PULSA"]),
    accountName: z.string().optional().nullable(),
    accountNumber: z.string().optional().nullable(),
    adminFee: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Boolean((data.bankName || data.name || "").trim()), {
    path: ["name"],
    message: "Nama wajib diisi.",
  });

function clean(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
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

function buildPayload(data: z.infer<typeof bankSchema>) {
  const bankName = clean(data.bankName) || clean(data.name) || "";

  return {
    bankName,
    code: data.code.trim().toUpperCase(),
    type: data.type,
    accountName: clean(data.accountName),
    accountNumber: clean(data.accountNumber),
    adminFee: clean(data.adminFee),
    isActive: data.isActive ?? true,
  };
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

    const result = await serverApi(API_ENDPOINTS.admin.banks, {
      method: "GET",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET_BANK_SETTING_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengambil akun."),
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
    const parsed = bankSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data akun tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.banks, {
      method: "POST",
      token: session.token,
      body: buildPayload(parsed.data),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil ditambahkan.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_BANK_SETTING_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menambahkan akun."),
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

    const parsed = bankSchema
      .extend({
        id: z.string().min(1, "ID wajib diisi."),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data akun tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await serverApi(
      API_ENDPOINTS.admin.bankDetail(parsed.data.id),
      {
        method: "PATCH",
        token: session.token,
        body: buildPayload(parsed.data),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Akun berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error("UPDATE_BANK_SETTING_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal memperbarui akun."),
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
          message: "ID akun wajib diisi.",
        },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.bankDetail(id), {
      method: "DELETE",
      token: session.token,
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus.",
      data: result,
    });
  } catch (error) {
    console.error("DELETE_BANK_SETTING_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal menghapus akun."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}