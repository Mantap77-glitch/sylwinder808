import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";
import { BrandingForm } from "@/components/admin/branding-form";

type PublicSiteResponse = {
  success?: boolean;
  setting?: {
    siteName?: string | null;
    logoUrl?: string | null;
  } | null;
  site?: {
    siteName?: string | null;
    logoUrl?: string | null;
  } | null;
  data?: {
    siteName?: string | null;
    logoUrl?: string | null;
  } | null;
};

type BrandingSetting = {
  siteName: string;
  logoUrl: string | null;
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

function normalizeBranding(
  result: PublicSiteResponse | null,
  fallbackSiteName: string
): BrandingSetting {
  const source = result?.setting || result?.site || result?.data || null;

  return {
    siteName: source?.siteName || fallbackSiteName || "NAMA",
    logoUrl: source?.logoUrl || null,
  };
}

async function getBrandingSetting(fallbackSiteName: string) {
  try {
    const tenantHost = await getTenantHost();

    if (!tenantHost) {
      return normalizeBranding(null, fallbackSiteName);
    }

    const result = await serverApi<PublicSiteResponse>(
      API_ENDPOINTS.public.site,
      {
        method: "GET",
        headers: makePublicHeaders(tenantHost),
      }
    );

    return normalizeBranding(result, fallbackSiteName);
  } catch (error) {
    console.error("GET_BRANDING_SETTING_PAGE_ERROR:", error);

    return normalizeBranding(null, fallbackSiteName);
  }
}

export default async function BrandingPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin || session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!session.tenantId || !session.token) {
    redirect("/admin");
  }

  const setting = await getBrandingSetting(session.tenant?.name ?? "NAMA");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">
          Change Icon Logo
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Ubah nama situs, logo public website, title browser, dan icon website
        </p>
      </section>

      <BrandingForm
        defaultSiteName={setting.siteName}
        defaultLogoUrl={setting.logoUrl}
      />
    </div>
  );
}