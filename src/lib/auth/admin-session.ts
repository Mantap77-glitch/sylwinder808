import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";

type AdminAuthType = "SUPER_ADMIN" | "ADMIN";

type AdminRole = "SUPER_ADMIN" | "CLIENT_ADMIN" | "STAFF";

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

function normalizeRole(
  role: string | null | undefined,
  authType: AdminAuthType
): AdminRole {
  if (role === "SUPER_ADMIN" || role === "CLIENT_ADMIN" || role === "STAFF") {
    return role;
  }

  return authType === "SUPER_ADMIN" ? "SUPER_ADMIN" : "CLIENT_ADMIN";
}

export async function getAdminSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get("admin_token")?.value;
  const authType = cookieStore.get("admin_auth_type")?.value as
    | AdminAuthType
    | undefined;

  if (!token || !authType) {
    redirect("/admin/login");
  }

  const endpoint =
    authType === "SUPER_ADMIN"
      ? API_ENDPOINTS.auth.superMe
      : API_ENDPOINTS.auth.adminMe;

  let result: MeResponse;

  try {
    result = await serverApi<MeResponse>(endpoint, {
      method: "GET",
      token,
    });
  } catch {
    redirect("/admin/login");
  }

  const admin = normalizeAdmin(result);

  if (!admin || !admin.id) {
    redirect("/admin/login");
  }

  const role = normalizeRole(admin.role, authType);
  const tenantId = admin.tenantId ?? admin.tenant?.id ?? null;

  return {
    id: String(admin.id),
    userId: String(admin.id),
    email: admin.email ?? "",
    username: admin.username ?? admin.email ?? "Admin",
    phone: admin.phone ?? null,
    role,
    tenantId: tenantId ? String(tenantId) : null,
    tenant: admin.tenant
      ? {
          id: admin.tenant.id ? String(admin.tenant.id) : null,
          name: admin.tenant.name ?? null,
          code: admin.tenant.code ?? null,
          status: admin.tenant.status ?? null,
        }
      : null,
    token,
    authType,
    isSuperAdmin: role === "SUPER_ADMIN",
    isClientAdmin: role === "CLIENT_ADMIN",
    isStaff: role === "STAFF",
  };
}