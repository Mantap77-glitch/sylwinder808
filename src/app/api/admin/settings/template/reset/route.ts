import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

function getErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message;
  }

  if (error instanceof Error) return error.message;

  return "Gagal reset template.";
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login ulang.",
        },
        { status: 401 }
      );
    }

    const result = await serverApi(API_ENDPOINTS.admin.templateReset, {
      method: "POST",
      token,
    });

    return NextResponse.json({
      success: true,
      message: "Template berhasil di-reset.",
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