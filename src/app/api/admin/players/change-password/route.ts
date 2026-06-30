import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const changePasswordSchema = z.object({
  playerId: z.string().min(1, "ID player wajib diisi."),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter."),
});

function getErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message;
  }

  if (error instanceof Error) return error.message;

  return "Gagal mengganti password player.";
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. Silakan login ulang." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await serverApi(
      API_ENDPOINTS.admin.playerChangePassword(parsed.data.playerId),
      {
        method: "PATCH",
        token,
        body: {
          password: parsed.data.newPassword,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password player berhasil diganti.",
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