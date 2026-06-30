import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type DepositMethod = "BANK" | "EWALLET" | "PULSA";

function clean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";

  return value.trim();
}

function makeUploadName(file: File) {
  const extension = file.name.split(".").pop() || "png";
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "");

  return `${Date.now()}-${crypto.randomUUID()}.${safeExtension || "png"}`;
}

function getTenantHost(req: Request) {
  return (
    process.env.PUBLIC_TENANT_HOST ||
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    ""
  ).trim();
}

function makePublicHeaders(tenantHost: string) {
  return {
    "x-tenant-host": tenantHost,
    "x-forwarded-host": tenantHost,
    "x-public-domain": tenantHost,
  };
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

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("player_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const tenantHost = getTenantHost(req);

    if (!tenantHost) {
      return NextResponse.json(
        {
          success: false,
          message: "Host public tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const method = clean(formData.get("method")) as DepositMethod;
    const amount = Number(clean(formData.get("amount")));
    const originAccount = clean(formData.get("originAccount"));
    const targetBankId = clean(formData.get("targetBankId"));
    const serialNumber = clean(formData.get("serialNumber"));
    const proof = formData.get("proof");

    const proofFile = proof instanceof File && proof.size > 0 ? proof : null;

    if (!["BANK", "EWALLET", "PULSA"].includes(method)) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method tidak valid.",
        },
        { status: 400 }
      );
    }

    const maxAmount = method === "PULSA" ? 1_000_000 : 100_000_000;

    if (!amount || amount < 20_000) {
      return NextResponse.json(
        {
          success: false,
          message: "Nominal minimal IDR 20.000.",
        },
        { status: 400 }
      );
    }

    if (amount > maxAmount) {
      return NextResponse.json(
        {
          success: false,
          message:
            method === "PULSA"
              ? "Nominal PULSA maksimal IDR 1.000.000."
              : "Nominal maksimal IDR 100.000.000.",
        },
        { status: 400 }
      );
    }

    if (!targetBankId) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun tujuan wajib dipilih.",
        },
        { status: 400 }
      );
    }

    if (method !== "PULSA" && !originAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun asal wajib dipilih.",
        },
        { status: 400 }
      );
    }

    if (method === "PULSA" && !serialNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor Seri / SN wajib diisi.",
        },
        { status: 400 }
      );
    }

    let proofUrl: string | null = null;

    if (proofFile) {
      if (!proofFile.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: "Bukti transfer harus berupa gambar.",
          },
          { status: 400 }
        );
      }

      if (proofFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: "Ukuran gambar maksimal 5MB.",
          },
          { status: 400 }
        );
      }

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "deposits"
      );

      await mkdir(uploadDir, { recursive: true });

      const fileName = makeUploadName(proofFile);
      const filePath = path.join(uploadDir, fileName);

      const bytes = await proofFile.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      const origin = new URL(req.url).origin;
      proofUrl = `${origin}/uploads/deposits/${fileName}`;
    }

    const result = await serverApi(API_ENDPOINTS.player.deposit, {
      method: "POST",
      token,
      headers: makePublicHeaders(tenantHost),
      body: {
        amount,
        method,
        targetBankId,
        originAccount: originAccount || null,
        serialNumber: serialNumber || null,
        proof: proofUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Request deposit berhasil dikirim.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_PLAYER_DEPOSIT_REQUEST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(error, "Gagal mengirim request deposit."),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}