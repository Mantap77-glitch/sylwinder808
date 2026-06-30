import { PlayerTable, type Player } from "@/components/admin/player-table";
import { getAdminSession } from "@/lib/auth/admin-session";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";

type ApiAny = Record<string, any>;

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

function toNumber(value: unknown) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return 0;
}

function toStringValue(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);

  return fallback;
}

function getFirstObject(value: unknown): ApiAny | null {
  if (isObject(value)) return value;

  if (Array.isArray(value)) {
    const firstObject = value.find((item) => isObject(item));
    return isObject(firstObject) ? firstObject : null;
  }

  return null;
}

function getFirstBank(player: ApiAny) {
  const candidates = [
    player.bank,
    player.bankAccount,
    player.bankAccounts,
    player.playerBank,
    player.playerBanks,
    player.bank_account,
    player.bank_accounts,
  ];

  for (const candidate of candidates) {
    const bank = getFirstObject(candidate);

    if (bank) return bank;
  }

  return null;
}

function normalizePlayers(result: unknown): Player[] {
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
    const bank = getFirstBank(player);

    const isBlocked =
      typeof player.isBlocked === "boolean" ? player.isBlocked : false;

    const isActive =
      typeof player.isActive === "boolean"
        ? player.isActive
        : player.status
          ? String(player.status).toUpperCase() === "ACTIVE"
          : !isBlocked;

    return {
      id: toStringValue(player.id, String(index)),
      username: toStringValue(player.username ?? player.name),
      email: toStringValue(player.email, "-"),
      isActive,
      createdAt: toStringValue(player.createdAt, new Date().toISOString()),

      tenantName: toStringValue(
        player.tenantName ?? tenant?.name ?? tenant?.code,
        "-"
      ),

      phone: toStringValue(player.phone ?? profile?.phone, "-"),

      balance: toNumber(
        player.balance ?? wallet?.balance ?? profile?.balance ?? 0
      ),

      loyaltyPoint: toNumber(
        player.loyaltyPoint ?? profile?.loyaltyPoint ?? 0
      ),

      loyaltyXp: toNumber(player.loyaltyXp ?? profile?.loyaltyXp ?? 0),

      bankName: toStringValue(
        player.bankName ??
          player.bank_name ??
          player.paymentMethod ??
          bank?.bankName ??
          bank?.bank_name ??
          bank?.paymentMethod ??
          bank?.payment_method ??
          bank?.name,
        "-"
      ),

      accountName: toStringValue(
        player.accountName ??
          player.account_name ??
          bank?.accountName ??
          bank?.account_name,
        "-"
      ),

      accountNumber: toStringValue(
        player.accountNumber ??
          player.account_number ??
          bank?.accountNumber ??
          bank?.account_number,
        "-"
      ),
    };
  });
}

export default async function PlayersPage() {
  const session = await getAdminSession();

  let players: Player[] = [];
  let errorMessage = "";

  try {
    const result = await serverApi<ApiAny>(API_ENDPOINTS.admin.players, {
      method: "GET",
      token: session.token,
    });

    players = normalizePlayers(result);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal mengambil data player.";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">Player List</h1>
      </section>

      {errorMessage && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </section>
      )}

      <PlayerTable data={players} />
    </div>
  );
}