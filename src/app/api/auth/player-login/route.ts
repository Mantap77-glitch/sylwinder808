import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const loginSchema = z.object({
  username: z.string().min(3, "Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

type ApiRecord = Record<string, unknown>;

type TenantInfo = {
  id: string;
  code: string;
  name: string;
  status: string;
};

type LoginResponse = {
  success?: boolean;
  token?: string;
  accessToken?: string;
  user?: ApiRecord;
  player?: ApiRecord;
  data?: {
    token?: string;
    accessToken?: string;
    user?: ApiRecord;
    player?: ApiRecord;
  };
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

function getToken(result: LoginResponse) {
  return (
    result.token ||
    result.accessToken ||
    result.data?.token ||
    result.data?.accessToken ||
    ""
  );
}

function getPlayer(result: LoginResponse) {
  return (
    result.user ||
    result.player ||
    result.data?.user ||
    result.data?.player ||
    null
  );
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
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data login tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await serverApi<LoginResponse>(API_ENDPOINTS.player.login, {
      method: "POST",
      headers: makePublicHeaders(tenantHost),
      body: {
        username: parsed.data.username,
        password: parsed.data.password,

        tenantId: tenant.id,
        tenantCode: tenant.code,
        domain: tenantHost,
        host: tenantHost,
        cleanHost: removePort(tenantHost),
      },
    });

    const token = getToken(result);
    const player = getPlayer(result);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token player tidak ditemukan dari backend.",
        },
        { status: 401 }
      );
    }

    const playerId = player?.id ?? parsed.data.username;
    const username = player?.username ?? parsed.data.username;

    const cookieStore = await cookies();
    const maxAge = 60 * 60 * 24;

    cookieStore.set("player_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("player_session", String(username), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("player_id", String(playerId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("player_username", String(username), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("player_tenant_id", tenant.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("player_tenant_code", tenant.code, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("player_tenant_host", tenantHost, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: player ?? {
        id: playerId,
        username,
      },
      redirectTo: "/home",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getBackendMessage(
          error,
          "Login gagal. Username atau password salah."
        ),
      },
      { status: getBackendStatus(error, 401) }
    );
  }
}