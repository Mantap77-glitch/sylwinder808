import { redirect } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";
import { ContactSettingForm } from "@/components/admin/contact-setting-form";

type ContactSettingPayload = {
  whatsapp?: string | null;
  telegram?: string | null;
  email?: string | null;
  livechatUrl?: string | null;
  whatsappNumber?: string | null;
  whatsappUrl?: string | null;
  telegramUsername?: string | null;
  telegramUrl?: string | null;
};

type ContactSettingResponse = ContactSettingPayload & {
  success?: boolean;
  contact?: ContactSettingPayload | null;
  setting?: ContactSettingPayload | null;
  data?: ContactSettingPayload | null;
};

type NormalizedContactSetting = {
  whatsappNumber: string;
  whatsappUrl: string;
  telegramUsername: string;
  telegramUrl: string;
};

function stripWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function normalizeWhatsappUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const number = stripWhatsappNumber(trimmed);

  return number ? `https://wa.me/${number}` : trimmed;
}

function normalizeTelegramUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const username = trimmed.replace(/^@/, "");

  return username ? `https://t.me/${username}` : trimmed;
}

function getTelegramUsername(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (trimmed.includes("t.me/")) {
    return trimmed.split("t.me/")[1]?.replace(/^@/, "").split(/[/?#]/)[0] || "";
  }

  return trimmed.replace(/^@/, "");
}

function getContactPayload(
  result: ContactSettingResponse | null
): ContactSettingPayload {
  if (!result) return {};

  return result.contact || result.setting || result.data || result;
}

function normalizeContactSetting(
  result: ContactSettingResponse | null
): NormalizedContactSetting {
  const contact = getContactPayload(result);

  const rawWhatsapp =
    contact.whatsappUrl || contact.whatsapp || contact.whatsappNumber || "";

  const rawTelegram =
    contact.telegramUrl || contact.telegram || contact.telegramUsername || "";

  const whatsappUrl = normalizeWhatsappUrl(rawWhatsapp);
  const telegramUrl = normalizeTelegramUrl(rawTelegram);

  return {
    whatsappNumber: contact.whatsappNumber || stripWhatsappNumber(rawWhatsapp),
    whatsappUrl,
    telegramUsername:
      contact.telegramUsername || getTelegramUsername(rawTelegram),
    telegramUrl,
  };
}

async function getContactSetting(token: string) {
  try {
    const result = await serverApi<ContactSettingResponse>(
      API_ENDPOINTS.admin.contactSetting,
      {
        method: "GET",
        token,
      }
    );

    return normalizeContactSetting(result);
  } catch (error) {
    console.error("GET_CONTACT_SETTING_PAGE_ERROR:", error);

    return normalizeContactSetting(null);
  }
}

export default async function ContactSettingPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin || session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!session.tenantId || !session.token) {
    redirect("/admin");
  }

  const setting = await getContactSetting(session.token);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">
          Contact Setting
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Atur informasi WhatsApp dan Telegram untuk public website
        </p>
      </section>

      <ContactSettingForm
        defaultWhatsappNumber={setting.whatsappNumber}
        defaultWhatsappUrl={setting.whatsappUrl}
        defaultTelegramUsername={setting.telegramUsername}
        defaultTelegramUrl={setting.telegramUrl}
      />
    </div>
  );
}