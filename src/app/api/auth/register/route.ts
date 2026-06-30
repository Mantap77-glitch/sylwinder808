import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username wajib diisi minimal 3 karakter."),
    email: z.string().email("Format email tidak valid."),
    phone: z.string().min(9, "Number phone wajib diisi minimal 9 digit."),
    password: z.string().min(6, "Password minimal 6 karakter."),
    retypePassword: z.string().min(6, "ReType password wajib diisi."),
    bankName: z.string().min(1, "Bank / E-Wallet wajib dipilih."),
    accountName: z.string().min(2, "Account name wajib diisi."),
    accountNumber: z.string().min(4, "Account number wajib diisi."),
    agreeTerms: z.boolean().optional(),
  })
  .refine((data) => data.password === data.retypePassword, {
    path: ["retypePassword"],
    message: "ReType password harus sama dengan password.",
  });

type ApiRecord = Record<string, unknown>;

type TenantInfo = {
  id: string;
  code: string;
  name: string;
  status: string;
};

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTenantHost(req: Request) {
  return (
    process.env.PUBLIC_TENANT_HOST ||
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    ""
  ).trim();
}

function removePort(host: string) {
  return host.split(":")[0];
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
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message || fallback;
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

async function resolveTenant(tenantHost: string): Promise<TenantInfo> {
  const result = await serverApi<ApiRecord>(API_ENDPOINTS.public.site, {
    method: "GET",
    headers: makePublicHeaders(tenantHost),
  });

  const site = isRecord(result.site) ? result.site : result;
  const tenant = isRecord(site.tenant) ? site.tenant : null;

  if (!tenant) {
    throw new Error("Tenant public tidak ditemukan dari backend.");
  }

  const id = tenant.id ? String(tenant.id) : "";
  const code = tenant.code ? String(tenant.code) : "";
  const name = tenant.name ? String(tenant.name) : "";
  const status = tenant.status ? String(tenant.status) : "ACTIVE";

  if (!id || !code) {
    throw new Error("Data tenant dari backend belum lengkap.");
  }

  if (status !== "ACTIVE") {
    throw new Error("Client sedang tidak aktif.");
  }

  return {
    id,
    code,
    name,
    status,
  };
}

export async function POST(req: Request) {
  try {
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

    const tenant = await resolveTenant(tenantHost);

    const json = await req.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data register tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const result = await serverApi(API_ENDPOINTS.player.register, {
      method: "POST",
      headers: makePublicHeaders(tenantHost),
      body: {
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,

        tenantId: tenant.id,
        tenantCode: tenant.code,
        domain: tenantHost,
        host: tenantHost,
        cleanHost: removePort(tenantHost),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Register berhasil. Silakan login.",
        data: result,
        redirectTo: "/",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(
          error,
          "Register gagal. Periksa data kembali."
        ),
      },
      { status: getBackendStatus(error, 400) }
    );
  }
}