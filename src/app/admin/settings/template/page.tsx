import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/admin-session";
import { TemplateManager } from "@/components/admin/template-manager";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPayload(value: unknown): ApiRecord {
  if (!isRecord(value)) return {};

  if (isRecord(value.data)) return value.data;
  if (isRecord(value.template)) return value.template;
  if (isRecord(value.setting)) return value.setting;
  if (isRecord(value.settings)) return value.settings;
  if (isRecord(value.result)) return value.result;

  return value;
}

function getStringValue(source: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

export default async function TemplateSettingPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin) {
    redirect("/admin");
  }

  if (!session.tenantId) {
    redirect("/admin");
  }

  let primaryColor = "";
  let secondaryColor = "";
  let loginBackground = "";
  let registerBackground = "";
  let errorMessage = "";

  try {
    const result = await serverApi<ApiRecord>(
      API_ENDPOINTS.admin.templateSetting,
      {
        method: "GET",
        token: session.token,
      }
    );

    const payload = getPayload(result);

    primaryColor = getStringValue(payload, ["primaryColor"]);
    secondaryColor = getStringValue(payload, ["secondaryColor"]);
    loginBackground = getStringValue(payload, ["loginBackground"]);
    registerBackground = getStringValue(payload, ["registerBackground"]);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal mengambil data template.";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">Template</h1>

        <p className="mt-2 text-sm text-slate-500">
          Atur warna template public website
        </p>
      </section>

      {errorMessage && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {errorMessage}
        </section>
      )}

      <TemplateManager
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        loginBackground={loginBackground}
        registerBackground={registerBackground}
      />
    </div>
  );
}