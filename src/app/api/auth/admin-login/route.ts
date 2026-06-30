import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

const adminLoginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
  remember: z.boolean().optional(),
});

type AdminAuthType = "SUPER_ADMIN" | "ADMIN";

type BackendTenant = {
  id?: string | number | null;
  name?: string | null;
  code?: string | null;
  status?: string | null;
};

type BackendAdmin = {
  id?: string | number;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  tenantId?: string | number | null;
  tenant?: BackendTenant | null;
};

type LoginResponse = {
  success?: boolean;
  token?: string;
  user?: BackendAdmin;
  admin?: BackendAdmin;
  data?: {
    token?: string;
    user?: BackendAdmin;
    admin?: BackendAdmin;
  };
};

type MeResponse = {
  success?: boolean;
  user?: BackendAdmin;
  admin?: BackendAdmin;
  data?: BackendAdmin | { user?: BackendAdmin; admin?: BackendAdmin };
};

function extractBackendMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Login admin gagal.";
}

function translateLoginError(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes("wrong password") ||
    lower.includes("user not found") ||
    lower.includes("super admin not found") ||
    lower.includes("invalid credentials")
  ) {
    return "Email atau password admin salah.";
  }

  if (lower.includes("forbidden")) {
    return "Akses ditolak.";
  }

  return message || "Login admin gagal.";
}

function getToken(result: LoginResponse) {
  return result.token || result.data?.token || "";
}

function normalizeAdmin(result: MeResponse | LoginResponse): BackendAdmin | null {
  const data = result.data;

  if (result.user) return result.user;
  if (result.admin) return result.admin;

  if (data && "user" in data && data.user) return data.user;
  if (data && "admin" in data && data.admin) return data.admin;

  if (
    data &&
    "id" in data &&
    (typeof data.id === "string" || typeof data.id === "number")
  ) {
    return data as BackendAdmin;
  }

  return null;
}

function normalizeRole(role: string | null | undefined, authType: AdminAuthType) {
  if (role === "SUPER_ADMIN" || role === "CLIENT_ADMIN" || role === "STAFF") {
    return role;
  }

  return authType === "SUPER_ADMIN" ? "SUPER_ADMIN" : "CLIENT_ADMIN";
}

async function attemptLogin(endpoint: string, email: string, password: string) {
  try {
    const result = await serverApi<LoginResponse>(endpoint, {
      method: "POST",
      body: {
        email,
        password,
      },
    });

    const token = getToken(result);

    if (!token) {
      return {
        ok: false as const,
        message: "Token login tidak ditemukan dari backend.",
      };
    }

    return {
      ok: true as const,
      token,
      result,
    };
  } catch (error) {
    return {
      ok: false as const,
      message: extractBackendMessage(error),
    };
  }
}

async function loadCurrentAdmin(authType: AdminAuthType, token: string) {
  const endpoint =
    authType === "SUPER_ADMIN"
      ? API_ENDPOINTS.auth.superMe
      : API_ENDPOINTS.auth.adminMe;

  const result = await serverApi<MeResponse>(endpoint, {
    method: "GET",
    token,
  });

  return normalizeAdmin(result);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = adminLoginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data login tidak valid.",
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password, remember } = parsed.data;

    /**
     * Coba login sebagai Admin Client / Staff dulu.
     * Jika tidak cocok, baru coba Super Admin.
     */
    const adminAttempt = await attemptLogin(
      API_ENDPOINTS.auth.adminLogin,
      email,
      password
    );

    let authType: AdminAuthType | null = null;
    let token = "";

    if (adminAttempt.ok) {
      authType = "ADMIN";
      token = adminAttempt.token;
    } else {
      const superAttempt = await attemptLogin(
        API_ENDPOINTS.auth.superLogin,
        email,
        password
      );

      if (superAttempt.ok) {
        authType = "SUPER_ADMIN";
        token = superAttempt.token;
      } else {
        const message =
          adminAttempt.message && adminAttempt.message !== "User not found"
            ? adminAttempt.message
            : superAttempt.message || adminAttempt.message;

        return NextResponse.json(
          {
            message: translateLoginError(message),
          },
          { status: 401 }
        );
      }
    }

    const currentAdmin = await loadCurrentAdmin(authType, token);

    if (!currentAdmin) {
      return NextResponse.json(
        { message: "Session admin tidak valid." },
        { status: 401 }
      );
    }

    const role = normalizeRole(currentAdmin.role, authType);
    const tenantId =
      currentAdmin.tenantId ?? currentAdmin.tenant?.id ?? null;

    if (
      role !== "SUPER_ADMIN" &&
      currentAdmin.tenant?.status &&
      currentAdmin.tenant.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          message:
            "Akun client sedang tidak aktif. Silakan hubungi team support.",
        },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24;

    /**
     * Cookie baru untuk API backend.
     */
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("admin_auth_type", authType, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    /**
     * Cookie lama tetap diset sementara agar route lama yang belum dimigrasi
     * tidak langsung rusak.
     */
    cookieStore.set("admin_user_id", String(currentAdmin.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    cookieStore.set("admin_role", role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    if (tenantId) {
      cookieStore.set("admin_tenant_id", String(tenantId), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge,
      });
    } else {
      cookieStore.delete("admin_tenant_id");
    }

    return NextResponse.json({
      message: "Login admin berhasil.",
      user: {
        id: String(currentAdmin.id),
        email: currentAdmin.email ?? email,
        username: currentAdmin.username ?? currentAdmin.email ?? email,
        phone: currentAdmin.phone ?? null,
        role,
        tenantId: tenantId ? String(tenantId) : null,
        tenantName: currentAdmin.tenant?.name ?? null,
      },
      redirectTo: "/admin",
    });
  } catch (error) {
    console.error("ADMIN_LOGIN_ERROR:", error);

    return NextResponse.json(
      { message: "Login admin gagal. Server error." },
      { status: 500 }
    );
  }
}