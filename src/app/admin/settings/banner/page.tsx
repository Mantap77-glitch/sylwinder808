import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";
import { BannerManager } from "@/components/admin/banner-manager";

type BackendBanner = {
  id?: string | number;
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  href?: string | null;
  placement?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | string | null;
  createdAt?: string | null;
};

type BackendBannersResponse = {
  success?: boolean;
  banners?: BackendBanner[];
  data?: BackendBanner[];
  items?: BackendBanner[];
};

async function getTenantHost() {
  const headerStore = await headers();

  const requestHost =
    headerStore.get("x-forwarded-host") || headerStore.get("host") || "";

  return process.env.PUBLIC_TENANT_HOST || requestHost;
}

function makePublicHeaders(tenantHost: string) {
  return {
    host: tenantHost,
    "x-forwarded-host": tenantHost,
    "x-tenant-host": tenantHost,
    "x-public-domain": tenantHost,
  };
}

function getRawBanners(result: BackendBannersResponse | null) {
  if (!result) return [];
  if (Array.isArray(result.banners)) return result.banners;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.items)) return result.items;

  return [];
}

function normalizeBanners(result: BackendBannersResponse | null) {
  return getRawBanners(result)
    .map((banner) => ({
      id: String(banner.id || ""),
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      href: banner.href || "",
      placement: banner.placement || "HOME",
      isActive: banner.isActive ?? true,
      sortOrder: Number(banner.sortOrder || 0),
      createdAt: banner.createdAt || "",
    }))
    .filter((banner) => banner.id)
    .sort((a, b) => {
      if (a.placement !== b.placement) {
        return a.placement.localeCompare(b.placement);
      }

      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    })
    .map(({ createdAt, ...banner }) => banner);
}

async function getBanners(token: string) {
  try {
    const result = await serverApi<BackendBannersResponse>(
      API_ENDPOINTS.admin.banners,
      {
        method: "GET",
        token,
      }
    );

    return normalizeBanners(result);
  } catch {
    try {
      const tenantHost = await getTenantHost();

      if (!tenantHost) return [];

      const result = await serverApi<BackendBannersResponse>(
        API_ENDPOINTS.public.banners,
        {
          method: "GET",
          headers: makePublicHeaders(tenantHost),
        }
      );

      return normalizeBanners(result);
    } catch {
      return [];
    }
  }
}

export default async function BannerSettingPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin || session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!session.tenantId || !session.token) {
    redirect("/admin");
  }

  const bannerRows = await getBanners(session.token);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">Change Banner</h1>

        <p className="mt-2 text-sm text-slate-500">
          Atur banner untuk website
        </p>
      </section>

      <BannerManager banners={bannerRows} />
    </div>
  );
}