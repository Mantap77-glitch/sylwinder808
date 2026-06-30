import { redirect } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";
import { BankSettingManager } from "@/components/admin/bank-setting-manager";

type BankType = "BANK" | "EWALLET" | "PULSA";

type BackendBank = {
  id?: string | number;
  name?: string | null;
  bankName?: string | null;
  code?: string | null;
  type?: BankType | string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  adminFee?: string | number | null;
  isActive?: boolean | null;
  createdAt?: string | null;
};

type BackendBanksResponse = {
  success?: boolean;
  banks?: BackendBank[];
  data?: BackendBank[];
  items?: BackendBank[];
};

function isBankType(value: unknown): value is BankType {
  return value === "BANK" || value === "EWALLET" || value === "PULSA";
}

function getRawBanks(result: BackendBanksResponse) {
  if (Array.isArray(result.banks)) return result.banks;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.items)) return result.items;

  return [];
}

function normalizeBanks(result: BackendBanksResponse) {
  return getRawBanks(result)
    .map((bank) => {
      const rawType = String(bank.type || "BANK").toUpperCase();
      const type = isBankType(rawType) ? rawType : "BANK";
      const name = bank.bankName || bank.name || bank.code || "-";

      return {
        id: String(bank.id || ""),
        name: String(name),
        code: String(bank.code || ""),
        type,
        accountName: bank.accountName ?? "",
        accountNumber: bank.accountNumber ?? "",
        adminFee:
          bank.adminFee === null || bank.adminFee === undefined
            ? ""
            : String(bank.adminFee),
        isActive: bank.isActive ?? true,
        createdAt: bank.createdAt || "",
      };
    })
    .filter((bank) => bank.id)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    })
    .map(({ createdAt, ...bank }) => bank);
}

async function getBanks(token: string) {
  try {
    const result = await serverApi<BackendBanksResponse>(
      API_ENDPOINTS.admin.banks,
      {
        method: "GET",
        token,
      }
    );

    return normalizeBanks(result);
  } catch (error) {
    console.error("GET_BANK_SETTINGS_PAGE_ERROR:", error);

    return [];
  }
}

export default async function BankSettingPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin || session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!session.tenantId || !session.token) {
    redirect("/admin");
  }

  const rows = await getBanks(session.token);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">Bank Setting</h1>

        <p className="mt-2 text-sm text-slate-500">
          Kelola akun BANK, E-WALLET, dan PULSA untuk website
        </p>
      </section>

      <BankSettingManager banks={rows} />
    </div>
  );
}