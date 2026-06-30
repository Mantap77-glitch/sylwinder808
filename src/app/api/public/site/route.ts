import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as { error?: string; message?: string } | null;

    return detail?.error || detail?.message || error.message;
  }

  if (error instanceof Error) return error.message;

  return "Gagal mengambil data public site.";
}

function getPayload(value: unknown): ApiRecord {
  if (!isRecord(value)) return {};

  if (isRecord(value.data)) return value.data;
  if (isRecord(value.site)) return value.site;
  if (isRecord(value.setting)) return value.setting;
  if (isRecord(value.settings)) return value.settings;
  if (isRecord(value.tenant)) return value.tenant;
  if (isRecord(value.result)) return value.result;

  return value;
}

function findArray(value: unknown, keys: string[]): ApiRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) return [];

  for (const key of keys) {
    const item = value[key];

    if (Array.isArray(item)) {
      return item.filter(isRecord);
    }
  }

  if (isRecord(value.data)) {
    for (const key of keys) {
      const item = value.data[key];

      if (Array.isArray(item)) {
        return item.filter(isRecord);
      }
    }
  }

  return [];
}

function getString(source: ApiRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function getBoolean(source: ApiRecord, keys: string[], fallback = true) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "boolean") return value;
  }

  return fallback;
}

function normalizeTemplate(source: ApiRecord) {
  const template = isRecord(source.template)
    ? source.template
    : isRecord(source.settings)
      ? source.settings
      : source;

  return {
    primaryColor: getString(template, ["primaryColor"], "#4f46e5"),
    secondaryColor: getString(template, ["secondaryColor"], "#14b8a6"),
    loginBackground: getString(template, ["loginBackground"], "#0f172a"),
    registerBackground: getString(template, ["registerBackground"], "#111827"),
  };
}

function normalizeSite(siteResult: unknown) {
  const payload = getPayload(siteResult);
  const tenant = isRecord(payload.tenant) ? payload.tenant : payload;
  const contact = isRecord(payload.contact) ? payload.contact : payload;
  const branding = isRecord(payload.branding) ? payload.branding : payload;

  const templateSource = isRecord(payload.template)
    ? payload.template
    : isRecord(payload.settings)
      ? payload.settings
      : payload;

  const siteName = getString(
    branding,
    ["siteName", "name"],
    getString(tenant, ["name", "code"], "NAMA")
  );

  return {
    siteName,
    logoUrl: getString(branding, ["logoUrl", "logo", "iconUrl"], ""),
    liveChatUrl: getString(contact, ["livechatUrl", "liveChatUrl"], ""),
    whatsappUrl: getString(contact, ["whatsapp", "whatsappUrl"], ""),
    telegramUrl: getString(contact, ["telegram", "telegramUrl"], ""),
    email: getString(contact, ["email"], ""),
    tenant: {
      id: getString(tenant, ["id"], ""),
      name: getString(tenant, ["name"], siteName),
      code: getString(tenant, ["code"], ""),
      status: getString(tenant, ["status"], "ACTIVE"),
    },
    template: normalizeTemplate(templateSource),
  };
}

function normalizeBanners(result: unknown) {
  const source = findArray(result, ["banners", "banner", "items", "data"]);

  return source.map((banner, index) => ({
    id: getString(banner, ["id"], String(index)),
    title: getString(banner, ["title"], ""),
    subtitle: getString(banner, ["subtitle"], ""),
    imageUrl: getString(banner, ["imageUrl", "image", "url"], ""),
    href: getString(banner, ["href", "link"], ""),
    placement: getString(banner, ["placement"], "home"),
    isActive: getBoolean(banner, ["isActive"], true),
    sortOrder: Number(banner.sortOrder ?? index),
  }));
}

function normalizePaymentTargets(result: unknown) {
  const source = findArray(result, [
    "paymentTargets",
    "targets",
    "banks",
    "items",
    "data",
  ]);

  return source.map((target, index) => ({
    id: getString(target, ["id"], String(index)),
    bankName: getString(target, ["bankName", "name"], "-"),
    accountName: getString(target, ["accountName"], "-"),
    accountNumber: getString(target, ["accountNumber"], "-"),
    isActive: getBoolean(target, ["isActive"], true),
  }));
}

async function getTenantHost() {
  const headerStore = await headers();

  const requestHost =
    headerStore.get("x-forwarded-host") || headerStore.get("host") || "";

  return process.env.PUBLIC_TENANT_HOST || requestHost;
}

export async function GET() {
  try {
    const tenantHost = await getTenantHost();

    if (!tenantHost) {
      return NextResponse.json(
        {
          success: false,
          message: "Host public tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const publicHeaders = {
      host: tenantHost,
      "x-forwarded-host": tenantHost,
      "x-tenant-host": tenantHost,
    };

    const [siteResult, bannersResult, paymentTargetsResult] =
      await Promise.all([
        serverApi(API_ENDPOINTS.public.site, {
          method: "GET",
          headers: publicHeaders,
        }),

        serverApi(API_ENDPOINTS.public.banners, {
          method: "GET",
          headers: publicHeaders,
        }).catch(() => null),

        serverApi(API_ENDPOINTS.public.paymentTargets, {
          method: "GET",
          headers: publicHeaders,
        }).catch(() => null),
      ]);

    return NextResponse.json({
      success: true,
      setting: normalizeSite(siteResult),
      banners: normalizeBanners(bannersResult),
      banks: normalizePaymentTargets(paymentTargetsResult),
      tenantHost,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}