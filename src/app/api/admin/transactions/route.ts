import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const createTransactionSchema = z.object({
  type: z.string(),
  playerId: z.string().min(1, "Player wajib dipilih."),
  amount: z.coerce
    .number()
    .refine((value) => value !== 0, "Amount tidak boleh 0."),
  note: z.string().optional().nullable(),
});

function getErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message;
  }

  if (error instanceof Error) return error.message;

  return "Gagal membuat transaksi.";
}

export async function GET() {
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

    const result = await serverApi(API_ENDPOINTS.admin.transactions, {
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

export async function POST(req: Request) {
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

    const json = await req.json();
    const parsed = createTransactionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data transaksi tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (parsed.data.type !== "ADJUSTMENT") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Untuk saat ini New Transaction hanya mendukung Adjustment. Deposit dan Withdraw diproses dari Manual Transaction.",
        },
        { status: 400 }
      );
    }

    const result = await serverApi(
      API_ENDPOINTS.admin.playerAdjustment(parsed.data.playerId),
      {
        method: "POST",
        token,
        body: {
          amount: parsed.data.amount,
          note: parsed.data.note || "",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Adjustment berhasil dibuat dan saldo player sudah diperbarui.",
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