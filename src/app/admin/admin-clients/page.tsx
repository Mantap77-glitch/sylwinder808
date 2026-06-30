import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/admin-session";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { AdminClientForm } from "@/components/admin/admin-client-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientStatusAction } from "@/components/admin/client-status-action";

type ApiAny = Record<string, any>;

type AdminClientUser = {
  id: string;
  username: string;
  email: string;
  isBlocked?: boolean;
};

type AdminClientDomain = {
  id: string;
  host: string;
  status: string;
  isPrimary: boolean;
};

type AdminClientTenant = {
  id: string;
  name: string;
  code: string;
  status: string;
  users: AdminClientUser[];
  domains: AdminClientDomain[];
};

function isObject(value: unknown): value is ApiAny {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findTenantArray(result: unknown): ApiAny[] {
  if (Array.isArray(result)) return result;
  if (!isObject(result)) return [];

  if (Array.isArray(result.tenants)) return result.tenants;
  if (Array.isArray(result.clients)) return result.clients;
  if (Array.isArray(result.items)) return result.items;
  if (Array.isArray(result.data)) return result.data;

  if (isObject(result.data)) {
    if (Array.isArray(result.data.tenants)) return result.data.tenants;
    if (Array.isArray(result.data.clients)) return result.data.clients;
    if (Array.isArray(result.data.items)) return result.data.items;
  }

  return [];
}

function normalizeTenants(result: unknown): AdminClientTenant[] {
  return findTenantArray(result).map((tenant) => {
    const rawUsers = Array.isArray(tenant.users)
      ? tenant.users
      : Array.isArray(tenant.admins)
        ? tenant.admins
        : Array.isArray(tenant.adminClients)
          ? tenant.adminClients
          : [];

    const rawDomains = Array.isArray(tenant.domains) ? tenant.domains : [];

    return {
      id: String(tenant.id ?? ""),
      name: String(tenant.name ?? tenant.clientName ?? "-"),
      code: String(tenant.code ?? tenant.clientCode ?? "-"),
      status: String(tenant.status ?? "INACTIVE"),
      users: rawUsers.map((user) => ({
        id: String(user.id ?? user.userId ?? ""),
        username: String(user.username ?? "-"),
        email: String(user.email ?? "-"),
        isBlocked: user.isBlocked === true,
      })),
      domains: rawDomains.map((domain) => ({
        id: String(domain.id ?? ""),
        host: String(domain.host ?? "-"),
        status: String(domain.status ?? "-"),
        isPrimary: domain.isPrimary === true,
      })),
    };
  });
}

async function getAdminClients(token: string) {
  try {
    const result = await serverApi(API_ENDPOINTS.admin.adminClients, {
      method: "GET",
      token,
    });

    return normalizeTenants(result);
  } catch (error) {
    console.error("GET_ADMIN_CLIENTS_PAGE_ERROR:", error);

    return [];
  }
}

export default async function AdminClientsPage() {
  const session = await getAdminSession();

  if (!session.isSuperAdmin && session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!session.token) {
    redirect("/admin/login");
  }

  const tenants = await getAdminClients(session.token);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">Admin Client</h1>

        <p className="mt-2 text-sm text-slate-500">
          Buat akun admin client dan tenant/client baru. Menu ini hanya tampil
          untuk Super Admin.
        </p>
      </section>

      <AdminClientForm />

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Client</CardTitle>
          <p className="text-sm text-slate-500">
            Total client: {tenants.length}
          </p>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="p-3">Client</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Admin Client</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-950">
                      {tenant.name}
                    </td>

                    <td className="p-3 text-slate-700">{tenant.code}</td>

                    <td className="p-3 text-slate-700">
                      {tenant.users.length > 0
                        ? tenant.users.map((user) => (
                            <div key={user.id}>
                              <p className="font-semibold">{user.username}</p>
                              <p className="text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          ))
                        : "-"}
                    </td>

                    <td className="p-3 text-slate-700">
                      {tenant.domains.length > 0
                        ? tenant.domains.map((domain) => (
                            <div key={domain.id}>
                              {domain.host}
                              {domain.isPrimary ? " • Primary" : ""}
                            </div>
                          ))
                        : "-"}
                    </td>

                    <td className="p-3">
                      <ClientStatusAction
                        tenantId={tenant.id}
                        status={tenant.status}
                      />
                    </td>
                  </tr>
                ))}

                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Belum ada client.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}