import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const updateManualTransactionSchema = z.object({
  id: z.string().min(1, "ID transaksi wajib diisi."),
  type: z.string().optional(),
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectReason: z.string().optional().nullable(),
});

function getErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message;
  }

  if (error instanceof Error) return error.message;

  return "Gagal mengubah status transaksi.";
}

function parseTransactionId(id: string, type?: string) {
  if (id.startsWith("deposit-")) {
    return {
      kind: "DEPOSIT" as const,
      rawId: id.replace("deposit-", ""),
    };
  }

  if (id.startsWith("withdrawal-")) {
    return {
      kind: "WITHDRAWAL" as const,
      rawId: id.replace("withdrawal-", ""),
    };
  }

  const upperType = String(type || "").toUpperCase();

  if (upperType === "WITHDRAW" || upperType === "WITHDRAWAL") {
    return {
      kind: "WITHDRAWAL" as const,
      rawId: id,
    };
  }

  return {
    kind: "DEPOSIT" as const,
    rawId: id,
  };
}

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const parsed = updateManualTransactionSchema.safeParse(body);

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

    const transaction = parseTransactionId(parsed.data.id, parsed.data.type);

    let endpoint = "";

    if (transaction.kind === "DEPOSIT") {
      endpoint =
        parsed.data.status === "APPROVED"
          ? API_ENDPOINTS.admin.depositApprove(transaction.rawId)
          : API_ENDPOINTS.admin.depositReject(transaction.rawId);
    }

    if (transaction.kind === "WITHDRAWAL") {
      endpoint =
        parsed.data.status === "APPROVED"
          ? API_ENDPOINTS.admin.withdrawalApprove(transaction.rawId)
          : API_ENDPOINTS.admin.withdrawalReject(transaction.rawId);
    }

    const result = await serverApi(endpoint, {
      method: "PATCH",
      token,
    });

    return NextResponse.json({
      success: true,
      message:
        parsed.data.status === "APPROVED"
          ? "Transaksi berhasil di-approve."
          : "Transaksi berhasil di-reject.",
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