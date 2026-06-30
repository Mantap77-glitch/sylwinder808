import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const templateSchema = z.object({
  backgroundColor: z.string().nullable().optional(),

  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  loginBackground: z.string().nullable().optional(),
  registerBackground: z.string().nullable().optional(),
});

function normalizeValue(value: string | null | undefined) {
  if (value === undefined) return undefined;

  const trimmed = value?.trim();

  return trimmed || null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message;
  }

  if (error instanceof Error) return error.message;

  return "Gagal memproses template.";
}

function getTokenFromCookies() {
  const cookieStorePromise = cookies();

  return cookieStorePromise.then((cookieStore) => {
    return cookieStore.get("admin_token")?.value || "";
  });
}

export async function GET() {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login ulang.",
        },
        { status: 401 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.templateSetting, {
      method: "GET",
      token,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login ulang.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = templateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data template tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const payload: Record<string, string | null> = {};

    const primaryColor = normalizeValue(parsed.data.primaryColor);
    const secondaryColor = normalizeValue(parsed.data.secondaryColor);
    const loginBackground = normalizeValue(parsed.data.loginBackground);
    const registerBackground = normalizeValue(parsed.data.registerBackground);
    const backgroundColor = normalizeValue(parsed.data.backgroundColor);

    if (primaryColor !== undefined) {
      payload.primaryColor = primaryColor;
    }

    if (secondaryColor !== undefined) {
      payload.secondaryColor = secondaryColor;
    }

    if (loginBackground !== undefined) {
      payload.loginBackground = loginBackground;
    }

    if (registerBackground !== undefined) {
      payload.registerBackground = registerBackground;
    }

    /**
     * Compatibility untuk TemplateManager lama yang masih kirim:
     * { backgroundColor }
     *
     * API baru temanmu tidak punya field backgroundColor,
     * jadi sementara kita map ke loginBackground + registerBackground.
     */
    if (backgroundColor !== undefined) {
      payload.loginBackground = backgroundColor;
      payload.registerBackground = backgroundColor;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data template yang dikirim.",
        },
        { status: 400 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.templateSetting, {
      method: "PATCH",
      token,
      body: payload,
    });

    return NextResponse.json({
      success: true,
      message: "Template berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}