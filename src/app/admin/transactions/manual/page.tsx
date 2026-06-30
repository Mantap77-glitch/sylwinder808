import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/admin-session";
import { ManualTransactionTable } from "@/components/admin/manual-transaction-table";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";

type ApiAny = Record<string, any>;

type ManualTransactionRow = {
  id: string;
  username: string;
  type: string;
  method: string;
  status: string;
  amount: string;
  originAccount: string;
  targetAccount: string;
  serialNumber: string;
  adminFee: string;
  proofUrl: string;
  createdAt: string;
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

function toStringValue(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);

  return fallback;
}

function getPlayerUsername(transaction: ApiAny) {
  const user = isObject(transaction.user) ? transaction.user : null;
  const player = isObject(transaction.player) ? transaction.player : null;

  return toStringValue(
    transaction.username ??
      transaction.playerUsername ??
      user?.username ??
      player?.username,
    "-"
  );
}

function normalizeDeposits(result: unknown): ManualTransactionRow[] {
  const deposits = findArray(result, ["deposits", "deposit", "items", "data"]);

  return deposits
    .filter((deposit) => {
      const status = toStringValue(deposit.status).toUpperCase();
      return status === "PENDING" || status === "NEW";
    })
    .map((deposit) => ({
      id: `deposit-${toStringValue(deposit.id)}`,
      username: getPlayerUsername(deposit),
      type: "DEPOSIT",
      method: toStringValue(deposit.method, "-"),
      status: toStringValue(deposit.status, "-"),
      amount: toStringValue(deposit.amount, "0"),
      originAccount: toStringValue(deposit.originAccount, ""),
      targetAccount: toStringValue(
        deposit.targetAccount ??
          deposit.targetBankName ??
          deposit.targetBankId ??
          "",
        ""
      ),
      serialNumber: toStringValue(deposit.serialNumber, ""),
      adminFee: toStringValue(deposit.adminFee, ""),
      proofUrl: toStringValue(deposit.proofUrl, ""),
      createdAt: toStringValue(deposit.createdAt, new Date().toISOString()),
    }));
}

function normalizeWithdrawals(result: unknown): ManualTransactionRow[] {
  const withdrawals = findArray(result, [
    "withdrawals",
    "withdrawal",
    "items",
    "data",
  ]);

  return withdrawals
    .filter((withdrawal) => {
      const status = toStringValue(withdrawal.status).toUpperCase();
      return status === "PENDING" || status === "NEW";
    })
    .map((withdrawal) => ({
      id: `withdrawal-${toStringValue(withdrawal.id)}`,
      username: getPlayerUsername(withdrawal),
      type: "WITHDRAW",
      method: toStringValue(withdrawal.method ?? "BANK", "BANK"),
      status: toStringValue(withdrawal.status, "-"),
      amount: toStringValue(withdrawal.amount, "0"),
      originAccount: "",
      targetAccount: toStringValue(
        withdrawal.targetAccount ??
          withdrawal.bankAccount ??
          withdrawal.accountNumber ??
          "",
        ""
      ),
      serialNumber: "",
      adminFee: "",
      proofUrl: "",
      createdAt: toStringValue(withdrawal.createdAt, new Date().toISOString()),
    }));
}

export default async function ManualTransactionPage() {
  const session = await getAdminSession();

  if (session.isSuperAdmin) {
    redirect("/admin");
  }

  if (!session.tenantId) {
    redirect("/admin");
  }

  let rows: ManualTransactionRow[] = [];
  let errorMessage = "";

  try {
    const [depositResult, withdrawalResult] = await Promise.all([
      serverApi<ApiAny>(API_ENDPOINTS.admin.deposits, {
        method: "GET",
        token: session.token,
      }),

      serverApi<ApiAny>(API_ENDPOINTS.admin.withdrawals, {
        method: "GET",
        token: session.token,
      }),
    ]);

    rows = [
      ...normalizeDeposits(depositResult),
      ...normalizeWithdrawals(withdrawalResult),
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return dateB - dateA;
    });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Gagal mengambil data manual transaction.";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">
          Manual Transaction
        </h1>
      </section>

      {errorMessage && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </section>
      )}

      <ManualTransactionTable transactions={rows} />
    </div>
  );
}