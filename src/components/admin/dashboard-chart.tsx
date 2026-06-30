"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type DashboardChartData = {
  day: string;
  deposit: number;
  withdraw: number;
  adjustment: number;
};

type DashboardChartProps = {
  data: DashboardChartData[];
};

function formatIDR(value: number) {
  return `IDR ${Number(value).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatYAxis(value: number) {
  const numberValue = Number(value);

  if (numberValue >= 1_000_000) {
    return `${numberValue / 1_000_000}M`;
  }

  if (numberValue >= 1_000) {
    return `${numberValue / 1_000}K`;
  }

  return String(numberValue);
}

export function DashboardChart({ data }: DashboardChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="grid h-72 min-h-72 w-full place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
        Belum ada data chart.
      </div>
    );
  }

  return (
    <div className="h-72 min-h-72 w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 18,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis tickFormatter={(value) => formatYAxis(Number(value))} />
          <Tooltip formatter={(value) => formatIDR(Number(value))} />
          <Legend />

          <Line
            type="monotone"
            dataKey="deposit"
            name="Deposit"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="withdraw"
            name="Withdraw"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="adjustment"
            name="Adjustment"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}