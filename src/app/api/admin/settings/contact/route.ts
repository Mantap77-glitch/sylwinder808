import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

const contactSettingSchema = z.object({
  whatsappNumber: z.string().optional().nullable(),
  whatsappUrl: z.string().optional().nullable(),
  telegramUsername: z.string().optional().nullable(),
  telegramUrl: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  livechatUrl: z.string().optional().nullable(),
});

function cleanOptional(value?: string | null) {
  if (!value) return "";

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : "";
}

function stripWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function normalizeWhatsapp(value?: string | null, fallbackNumber?: string | null) {
  const url = cleanOptional(value);
  const number = cleanOptional(fallbackNumber);

  if (url) return url;

  const cleanNumber = stripWhatsappNumber(number);

  return cleanNumber ? `https://wa.me/${cleanNumber}` : "";
}

function normalizeTelegram(value?: string | null, fallbackUsername?: string | null) {
  const url = cleanOptional(value);
  const username = cleanOptional(fallbackUsername).replace(/^@/, "");

  if (url) return url;

  return username ? `https://t.me/${username}` : "";
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

    const result = await serverApi(API_ENDPOINTS.admin.contactSetting, {
      method: "GET",
      token: session.token,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET_CONTACT_SETTING_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(
          error,
          "Gagal mengambil contact setting."
        ),
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
    const parsed = contactSettingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data contact setting tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const whatsapp = normalizeWhatsapp(
      parsed.data.whatsappUrl,
      parsed.data.whatsappNumber
    );

    const telegram = normalizeTelegram(
      parsed.data.telegramUrl,
      parsed.data.telegramUsername
    );

    const result = await serverApi(API_ENDPOINTS.admin.contactSetting, {
      method: "PATCH",
      token: session.token,
      body: {
        whatsapp,
        telegram,
        email: cleanOptional(parsed.data.email),
        livechatUrl: cleanOptional(parsed.data.livechatUrl),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contact setting berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    console.error("UPDATE_CONTACT_SETTING_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(
          error,
          "Gagal menyimpan contact setting."
        ),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}