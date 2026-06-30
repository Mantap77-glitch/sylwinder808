import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminSession } from "@/lib/auth/admin-session";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";

type ApiAny = Record<string, any>;

type TransactionItem = {
  id: string;
  invoiceNo: string;
  clientName: string;
  playerUsername: string;
  playerEmail: string;
  type: string;
  status: string;
  amount: number;
  adminUsername: string;
  createdAt: string;
  note: string;
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

function getObjectValue(value: unknown): ApiAny | null {
  if (isObject(value)) return value;

  return null;
}

function getAdminUsername(trx: ApiAny) {
  const admin =
    getObjectValue(trx.admin) ??
    getObjectValue(trx.approvedBy) ??
    getObjectValue(trx.rejectedBy) ??
    getObjectValue(trx.reviewedBy) ??
    getObjectValue(trx.processedBy) ??
    getObjectValue(trx.updatedBy) ??
    getObjectValue(trx.operator);

  return toStringValue(
    trx.adminUsername ??
      trx.approvedByUsername ??
      trx.rejectedByUsername ??
      trx.reviewedByUsername ??
      trx.processedByUsername ??
      trx.updatedByUsername ??
      trx.operatorUsername ??
      admin?.username ??
      admin?.email,
    "-"
  );
}

function formatIDR(value: unknown) {
  return `IDR ${Number(value).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: string) {
  const upperStatus = status.toUpperCase();

  if (upperStatus === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (upperStatus === "PENDING" || upperStatus === "NEW") {
    return "bg-amber-100 text-amber-700";
  }

  if (upperStatus === "REJECTED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function normalizeTransactions(result: unknown): TransactionItem[] {
  const root = isObject(result) ? result : {};
  const payload = isObject(root.data) ? root.data : root;

  const deposits = findArray(payload, ["deposits", "deposit"]);
  const withdrawals = findArray(payload, ["withdrawals", "withdrawal"]);
  const transactions = findArray(payload, [
    "transactions",
    "transaction",
    "history",
    "histories",
    "items",
  ]);

  const depositRows = deposits.map((trx, index) => {
    const player = isObject(trx.user)
      ? trx.user
      : isObject(trx.player)
        ? trx.player
        : null;

    return {
      id: `deposit-${toStringValue(trx.id, String(index))}`,
      invoiceNo: `DEP-${toStringValue(trx.id, String(index + 1))}`,
      clientName: toStringValue(trx.tenantName ?? trx.tenant?.name, "-"),
      playerUsername: toStringValue(
        trx.playerUsername ?? trx.username ?? player?.username,
        "-"
      ),
      playerEmail: toStringValue(trx.playerEmail ?? player?.email, "-"),
      type: "DEPOSIT",
      status: toStringValue(trx.status, "-"),
      amount: toNumber(trx.amount ?? trx.nominal ?? trx.total),
      adminUsername: getAdminUsername(trx),
      createdAt: toStringValue(trx.createdAt ?? trx.date ?? trx.updatedAt, ""),
      note: toStringValue(
        trx.method
          ? `${trx.method}${trx.serialNumber ? ` / SN: ${trx.serialNumber}` : ""}`
          : trx.note,
        "-"
      ),
    };
  });

  const withdrawalRows = withdrawals.map((trx, index) => {
    const player = isObject(trx.user)
      ? trx.user
      : isObject(trx.player)
        ? trx.player
        : null;

    return {
      id: `withdrawal-${toStringValue(trx.id, String(index))}`,
      invoiceNo: `WD-${toStringValue(trx.id, String(index + 1))}`,
      clientName: toStringValue(trx.tenantName ?? trx.tenant?.name, "-"),
      playerUsername: toStringValue(
        trx.playerUsername ?? trx.username ?? player?.username,
        "-"
      ),
      playerEmail: toStringValue(trx.playerEmail ?? player?.email, "-"),
      type: "WITHDRAW",
      status: toStringValue(trx.status, "-"),
      amount: toNumber(trx.amount ?? trx.nominal ?? trx.total),
      adminUsername: getAdminUsername(trx),
      createdAt: toStringValue(trx.createdAt ?? trx.date ?? trx.updatedAt, ""),
      note: toStringValue(trx.note ?? trx.method, "-"),
    };
  });

  const transactionRows = transactions.map((trx, index) => {
    const tenant = isObject(trx.tenant) ? trx.tenant : null;
    const player = isObject(trx.player) ? trx.player : null;
    const admin = isObject(trx.admin) ? trx.admin : null;

    return {
      id: toStringValue(trx.id, String(index)),
      invoiceNo: toStringValue(
        trx.invoiceNo ?? trx.invoice ?? trx.code ?? trx.id,
        "-"
      ),
      clientName: toStringValue(
        trx.clientName ?? trx.tenantName ?? tenant?.name ?? tenant?.code,
        "-"
      ),
      playerUsername: toStringValue(
        trx.playerUsername ?? trx.username ?? player?.username,
        "-"
      ),
      playerEmail: toStringValue(trx.playerEmail ?? player?.email, "-"),
      type: toStringValue(trx.type, "-"),
      status: toStringValue(trx.status, "-"),
      amount: toNumber(trx.amount ?? trx.nominal ?? trx.total),
      adminUsername: getAdminUsername(trx),
      createdAt: toStringValue(trx.createdAt ?? trx.date ?? trx.updatedAt, ""),
      note: toStringValue(trx.note ?? trx.description, "-"),
    };
  });

  return [...depositRows, ...withdrawalRows, ...transactionRows].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return dateB - dateA;
  });
}

export default async function TransactionHistoryPage() {
  const session = await getAdminSession();

  let transactions: TransactionItem[] = [];
  let errorMessage = "";

  try {
    const result = await serverApi<ApiAny>(API_ENDPOINTS.admin.transactions, {
      method: "GET",
      token: session.token,
    });

    transactions = normalizeTransactions(result);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Gagal mengambil data transaksi.";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">
          History Transaction
        </h1>
      </section>

      {errorMessage && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </section>
      )}

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Data Transaksi</CardTitle>
          <p className="text-sm text-slate-500">
            Total transaksi tampil: {transactions.length}
          </p>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Player</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Note</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-950">
                      {trx.invoiceNo}
                    </td>

                    <td className="p-3 text-slate-700">{trx.clientName}</td>

                    <td className="p-3">
                      <div>
                        <p className="font-bold text-slate-950">
                          {trx.playerUsername}
                        </p>
                        <p className="text-xs text-slate-500">
                          {trx.playerEmail}
                        </p>
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700"
                      >
                        {trx.type}
                      </Badge>
                    </td>

                    <td className="p-3">
                      <Badge
                        variant="secondary"
                        className={getStatusClass(trx.status)}
                      >
                        {trx.status}
                      </Badge>
                    </td>

                    <td className="p-3 text-right font-bold text-slate-950">
                      {formatIDR(trx.amount)}
                    </td>

                    <td className="p-3 text-slate-700">
                      {trx.adminUsername}
                    </td>

                    <td className="p-3 text-slate-700">
                      {formatDate(trx.createdAt)}
                    </td>

                    <td className="p-3 text-slate-500">{trx.note}</td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-slate-500"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}