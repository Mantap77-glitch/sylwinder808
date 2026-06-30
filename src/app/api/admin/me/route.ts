import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";

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

type MeResponse = {
  success?: boolean;
  user?: BackendAdmin;
  admin?: BackendAdmin;
  data?: BackendAdmin | { user?: BackendAdmin; admin?: BackendAdmin };
};

function normalizeAdmin(result: MeResponse): BackendAdmin | null {
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

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("admin_token")?.value;
    const authType = cookieStore.get("admin_auth_type")?.value as
      | AdminAuthType
      | undefined;

    if (!token || !authType) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const endpoint =
      authType === "SUPER_ADMIN"
        ? API_ENDPOINTS.auth.superMe
        : API_ENDPOINTS.auth.adminMe;

    const result = await serverApi<MeResponse>(endpoint, {
      method: "GET",
      token,
    });

    const admin = normalizeAdmin(result);

    if (!admin || !admin.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Session admin tidak valid.",
        },
        { status: 401 }
      );
    }

    const role = normalizeRole(admin.role, authType);
    const tenantId = admin.tenantId ?? admin.tenant?.id ?? null;

    return NextResponse.json({
      success: true,
      id: String(admin.id),
      username: admin.username ?? admin.email ?? "Admin",
      email: admin.email ?? "",
      phone: admin.phone ?? null,
      role,
      tenantId: tenantId ? String(tenantId) : null,
      tenantName: admin.tenant?.name ?? null,
      tenant: admin.tenant
        ? {
            id: admin.tenant.id ? String(admin.tenant.id) : null,
            name: admin.tenant.name ?? null,
            code: admin.tenant.code ?? null,
            status: admin.tenant.status ?? null,
          }
        : null,
      isSuperAdmin: role === "SUPER_ADMIN",
      isClientAdmin: role === "CLIENT_ADMIN",
      isStaff: role === "STAFF",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membaca session admin.",
      },
      { status: 401 }
    );
  }
}