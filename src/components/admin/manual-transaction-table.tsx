"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

type ManualTransactionTableProps = {
  transactions: ManualTransactionRow[];
};

function formatIDR(value: string) {
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

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getTypeLabel(type: string) {
  const upperType = type.toUpperCase();

  if (upperType === "WITHDRAW" || upperType === "WITHDRAWAL") {
    return "Withdraw";
  }

  return "Deposit";
}

export function ManualTransactionTable({
  transactions,
}: ManualTransactionTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState("");

  async function updateStatus(
    transaction: ManualTransactionRow,
    status: "APPROVED" | "REJECTED"
  ) {
    const typeLabel = getTypeLabel(transaction.type);

    const confirmed = window.confirm(
      status === "APPROVED"
        ? `Approve ${typeLabel} ${transaction.username} sebesar ${formatIDR(
            transaction.amount
          )}?`
        : `Reject ${typeLabel} ${transaction.username}?`
    );

    if (!confirmed) return;

    let rejectReason = "";

    if (status === "REJECTED") {
      rejectReason =
        window.prompt("Masukkan alasan reject:", "Transaksi tidak valid.") ||
        "";

      if (!rejectReason.trim()) {
        toast.error("Alasan reject wajib diisi.");
        return;
      }
    }

    setLoadingId(transaction.id);

    try {
      const response = await fetch("/api/admin/transactions/manual", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: transaction.id,
          type: transaction.type,
          status,
          rejectReason,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        toast.error(
          result?.message ||
            result?.error ||
            "Gagal mengubah status transaksi."
        );
        return;
      }

      toast.success(result?.message || "Status transaksi berhasil diubah.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoadingId("");
    }
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="p-3">Tanggal</th>
                <th className="p-3">Player</th>
                <th className="p-3">Type</th>
                <th className="p-3">Method</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Akun Asal</th>
                <th className="p-3">Akun Tujuan</th>
                <th className="p-3">SN</th>
                <th className="p-3">Bukti</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 text-slate-600">
                    {formatDate(transaction.createdAt)}
                  </td>

                  <td className="p-3 font-bold text-slate-950">
                    {transaction.username}
                  </td>

                  <td className="p-3">
                    <Badge
                      className={
                        transaction.type.toUpperCase().includes("WITHDRAW")
                          ? "bg-rose-600 text-white"
                          : "bg-emerald-600 text-white"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </td>

                  <td className="p-3">
                    <Badge className="bg-indigo-600 text-white">
                      {transaction.method}
                    </Badge>
                  </td>

                  <td className="p-3 font-black text-slate-950">
                    {formatIDR(transaction.amount)}
                  </td>

                  <td className="p-3">{transaction.originAccount || "-"}</td>

                  <td className="p-3">
                    <div className="max-w-[260px] whitespace-normal">
                      {transaction.targetAccount || "-"}
                    </div>

                    {transaction.adminFee && (
                      <p className="mt-1 text-xs text-amber-600">
                        Admin fee: {transaction.adminFee}
                      </p>
                    )}
                  </td>

                  <td className="p-3">{transaction.serialNumber || "-"}</td>

                  <td className="p-3">
                    {transaction.proofUrl ? (
                      <a
                        href={transaction.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-indigo-600 hover:underline"
                      >
                        Lihat Bukti
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-3">
                    <Badge className="bg-amber-500 text-white">
                      {transaction.status}
                    </Badge>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={loadingId === transaction.id}
                        onClick={() => updateStatus(transaction, "APPROVED")}
                      >
                        Approve
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={loadingId === transaction.id}
                        onClick={() => updateStatus(transaction, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    Belum ada request manual transaction pending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}