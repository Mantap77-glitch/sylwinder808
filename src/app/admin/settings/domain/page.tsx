import { redirect } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";
import { DomainManager } from "@/components/admin/domain-manager";

type BackendDomain = {
  id?: string | number;
  host?: string | null;
  status?: string | null;
  isPrimary?: boolean | null;
  createdAt?: string | null;
};

type DomainResponse = {
  success?: boolean;
  domains?: BackendDomain[];
  data?: BackendDomain[];
  items?: BackendDomain[];
};

function getRawDomains(result: DomainResponse | null) {
  if (!result) return [];
  if (Array.isArray(result.domains)) return result.domains;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.items)) return result.items;

  return [];
}

function normalizeDomains(result: DomainResponse | null) {
  return getRawDomains(result)
    .map((domain) => ({
      id: String(domain.id || ""),
      host: domain.host || "",
      status: domain.status || "INACTIVE",
      isPrimary: domain.isPrimary === true,
      createdAt: domain.createdAt || "",
    }))
    .filter((domain) => domain.id && domain.host)
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateA - dateB;
    })
    .map(({ createdAt, ...domain }) => domain);
}

async function getDomains(token: string) {
  try {
    const result = await serverApi<DomainResponse>(API_ENDPOINTS.admin.domains, {
      method: "GET",
      token,
    });

    return normalizeDomains(result);
  } catch (error) {
    console.error("GET_DOMAIN_PAGE_ERROR:", error);

    return [];
  }
}

export default async function DomainSettingPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin || session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!session.tenantId || !session.token) {
    redirect("/admin");
  }

  const domainRows = await getDomains(session.token);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">
          Management Domain
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Kelola maksimal 4 domain untuk public website
        </p>
      </section>

      <DomainManager domains={domainRows} maxDomains={4} />
    </div>
  );
}