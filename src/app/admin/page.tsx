import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardChart } from "@/components/admin/dashboard-chart";
import { getAdminSession } from "@/lib/auth/admin-session";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { redirect } from "next/navigation";

type ApiAny = Record<string, any>;

type DashboardChartItem = {
  day: string;
  deposit: number;
  withdraw: number;
  adjustment: number;
};

type HistoryItem = {
  id: string;
  invoiceNo: string;
  playerName: string;
  status: string;
  amount: number;
};

function isObject(value: unknown): value is ApiAny {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPayload(value: unknown): ApiAny {
  if (!isObject(value)) return {};

  if (isObject(value.data)) return value.data;
  if (isObject(value.dashboard)) return value.dashboard;
  if (isObject(value.result)) return value.result;

  return value;
}

function getNumber(source: ApiAny, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number") return value;

    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  return 0;
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
  }

  if (isObject(source.dashboard)) {
    for (const key of keys) {
      if (Array.isArray(source.dashboard[key])) return source.dashboard[key];
    }
  }

  return [];
}

function makeDefaultChartData(): DashboardChartItem[] {
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      day: date.toLocaleDateString("id-ID", {
        weekday: "short",
      }),
      deposit: 0,
      withdraw: 0,
      adjustment: 0,
    };
  });
}

function normalizeChartData(dashboardResult: unknown): DashboardChartItem[] {
  const source = findArray(dashboardResult, [
    "chart",
    "charts",
    "chartData",
    "dailyChart",
    "daily",
    "days",
  ]);

  if (source.length === 0) {
    return makeDefaultChartData();
  }

  return source.map((item) => ({
    day: String(item.day ?? item.label ?? item.date ?? "-"),
    deposit: Number(item.deposit ?? item.depositAmount ?? item.totalDeposit ?? 0),
    withdraw: Number(
      item.withdraw ??
        item.withdrawal ??
        item.withdrawAmount ??
        item.withdrawalAmount ??
        item.totalWithdraw ??
        0
    ),
    adjustment: Number(
      item.adjustment ?? item.adjustmentAmount ?? item.totalAdjustment ?? 0
    ),
  }));
}

function normalizeHistory(dashboardResult: unknown): HistoryItem[] {
  const payload = getPayload(dashboardResult);

  const source = findArray(payload, [
    "recentTransactions",
    "transactions",
    "history",
    "histories",
    "recent",
    "items",
  ]);

  return source.slice(0, 8).map((trx, index) => {
    const player = isObject(trx.player) ? trx.player : null;

    return {
      id: String(trx.id ?? trx.invoiceNo ?? trx.invoice ?? index),
      invoiceNo: String(trx.invoiceNo ?? trx.invoice ?? trx.code ?? trx.id ?? "-"),
      playerName: String(
        player?.username ??
          trx.playerUsername ??
          trx.playerName ??
          trx.username ??
          "-"
      ),
      status: String(trx.status ?? "-"),
      amount: Number(trx.amount ?? trx.nominal ?? trx.total ?? 0),
    };
  });
}

function getStatusClass(status: string) {
  const upperStatus = status.toUpperCase();

  if (upperStatus === "APPROVED" || upperStatus === "SUCCESS") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (upperStatus === "PENDING" || upperStatus === "NEW") {
    return "bg-amber-100 text-amber-700";
  }

  if (upperStatus === "REJECTED" || upperStatus === "FAILED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

async function getDashboard(token: string) {
  try {
    const result = await serverApi<ApiAny>(API_ENDPOINTS.admin.dashboard, {
      method: "GET",
      token,
    });

    return {
      data: result,
      error: "",
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data dashboard.",
    };
  }
}

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (session.isSuperAdmin || session.role === "SUPER_ADMIN") {
    redirect("/admin/admin-clients");
  }

  const dashboardResponse = await getDashboard(session.token);
  const dashboardPayload = getPayload(dashboardResponse.data);

  const statsPayload = isObject(dashboardPayload.stats)
    ? dashboardPayload.stats
    : isObject(dashboardPayload.summary)
      ? dashboardPayload.summary
      : dashboardPayload;

  const players = getNumber(statsPayload, [
    "players",
    "player",
    "totalPlayers",
    "totalPlayer",
    "playerCount",
  ]);

  const transactions = getNumber(statsPayload, [
    "transactions",
    "transaction",
    "totalTransactions",
    "totalTransaction",
    "transactionCount",
  ]);

  const pending = getNumber(statsPayload, [
    "pending",
    "pendingTransactions",
    "pendingTransaction",
    "manualTransactions",
    "manualTransaction",
    "pendingManualTransactions",
    "pendingDeposits",
    "pendingWithdrawals",
  ]);

  const domains = getNumber(statsPayload, [
    "domains",
    "domain",
    "activeDomains",
    "activeDomain",
    "totalDomains",
  ]);

  const stats = [
    {
      icon: "👥",
      value: players,
      label: "Player List",
      badge: session.isSuperAdmin ? "All Client" : "Client",
      description: "Total player terdaftar",
    },
    {
      icon: "🧾",
      value: transactions,
      label: "History Transaction",
      badge: "Total",
      description: "Semua transaksi tercatat",
    },
    {
      icon: "⏳",
      value: pending,
      label: "Manual Transaction",
      badge: "Pending",
      description: "Transaksi menunggu proses",
    },
    {
      icon: "🌐",
      value: domains,
      label: "Management Domain",
      badge: "Active",
      description: "Domain aktif website",
    },
  ];

  const chartData = normalizeChartData(dashboardResponse.data);
  const history = normalizeHistory(dashboardResponse.data);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">Login sebagai</p>

        <h1 className="mt-1 text-2xl font-black">{session.username}</h1>
      </section>

      {dashboardResponse.error && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Dashboard API belum mengembalikan data. Detail:{" "}
          <span className="font-bold">{dashboardResponse.error}</span>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-xl text-white">
                {stat.icon}
              </span>

              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                {stat.badge}
              </Badge>
            </CardHeader>

            <CardContent>
              <h3 className="text-3xl font-black text-slate-950">
                {String(stat.value)}
              </h3>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {stat.label}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-950">Chart Dashboard</CardTitle>
            <p className="text-sm text-slate-500">
              Ringkasan aktivitas transaksi website dalam 7 hari terakhir.
            </p>
          </CardHeader>

          <CardContent className="min-h-[320px] min-w-0">
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-950">History Transaction</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-3 pr-4">Invoice</th>
                    <th className="py-3 pr-4">Player</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((trx) => (
                    <tr key={trx.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {trx.invoiceNo}
                      </td>

                      <td className="py-3 pr-4 text-slate-700">
                        {trx.playerName}
                      </td>

                      <td className="py-3 pr-4">
                        <Badge
                          variant="secondary"
                          className={getStatusClass(trx.status)}
                        >
                          {trx.status}
                        </Badge>
                      </td>

                      <td className="py-3 text-right font-bold text-slate-900">
                        IDR{" "}
                        {Number(trx.amount).toLocaleString("id-ID", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    </tr>
                  ))}

                  {history.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-500"
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
      </section>
    </div>
  );
}