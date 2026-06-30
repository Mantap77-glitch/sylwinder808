import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/admin/transaction-form";
import { getAdminSession } from "@/lib/auth/admin-session";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";

type ApiAny = Record<string, any>;

type PlayerOption = {
  id: string;
  username: string;
  email: string;
  tenantId?: string | null;
  tenantName?: string;
  phone?: string;
  balance?: number;
};

function isObject(value: unknown): value is ApiAny {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findArray(source: unknown, keys: string[]): ApiAny[] {
  if (Array.isArray(source)) return source;

  if (!isObject(source)) return [];

  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key];
  }

  if (isObject(source.data)) {
    for (const key of keys) {
      if (Array.isArray(source.data[key])) return source.data[key];
    }

    if (Array.isArray(source.data.data)) return source.data.data;
  }

  return [];
}

function toStringValue(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);

  return fallback;
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return 0;
}

function normalizePlayers(result: unknown): PlayerOption[] {
  const source = findArray(result, [
    "players",
    "player",
    "users",
    "items",
    "data",
  ]);

  return source.map((player, index) => {
    const tenant = isObject(player.tenant) ? player.tenant : null;

    const profile = isObject(player.profile)
      ? player.profile
      : isObject(player.playerProfile)
        ? player.playerProfile
        : null;

    const wallet = isObject(player.wallet) ? player.wallet : null;

    return {
      id: toStringValue(player.id, String(index)),
      username: toStringValue(player.username ?? player.name),
      email: toStringValue(player.email, "-"),
      tenantId:
        player.tenantId !== undefined && player.tenantId !== null
          ? String(player.tenantId)
          : null,
      tenantName: toStringValue(
        player.tenantName ?? tenant?.name ?? tenant?.code,
        "-"
      ),
      phone: toStringValue(player.phone ?? profile?.phone, "-"),
      balance: toNumber(
        player.balance ?? wallet?.balance ?? profile?.balance ?? 0
      ),
    };
  });
}

export default async function NewTransactionPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin) {
    redirect("/admin/transactions/history");
  }

  let playerOptions: PlayerOption[] = [];
  let errorMessage = "";

  try {
    const result = await serverApi<ApiAny>(API_ENDPOINTS.admin.players, {
      method: "GET",
      token: session.token,
    });

    playerOptions = normalizePlayers(result);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal mengambil data player.";
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <TransactionForm players={playerOptions} />
      </CardContent>
    </Card>
  );
}