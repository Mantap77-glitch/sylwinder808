"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type TransactionHistoryDialogProps = {
  open: boolean;
  username: string;
  onOpenChange: (open: boolean) => void;
};

type TransactionHistoryRow = {
  id: string;
  date: string;
  nominal: string;
  jenis: string;
  metode: string;
  status: string;
};

function formatIDR(value: string) {
  return `IDR ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getJenisLabel(value: string) {
  if (value === "DEPOSIT") return "Deposit";
  if (value === "WITHDRAW") return "Withdraw";
  if (value === "WITHDRAWAL") return "Withdraw";
  if (value === "ADJUSTMENT") return "Adjustment";

  return value;
}

function getStatusLabel(value: string) {
  if (value === "APPROVED") return "Disetujui";
  if (value === "REJECTED") return "Ditolak";
  if (value === "PENDING") return "Pending";

  return value;
}

export function TransactionHistoryDialog({
  open,
  username,
  onOpenChange,
}: TransactionHistoryDialogProps) {
  const [transactions, setTransactions] = useState<TransactionHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const totalDeposit = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.jenis === "DEPOSIT" &&
          transaction.status === "APPROVED"
      )
      .reduce((total, transaction) => total + Number(transaction.nominal), 0);
  }, [transactions]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setErrorText("");

      try {
        const response = await fetch("/api/public/transaction-history", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message || result?.error || "Gagal mengambil riwayat."
          );
        }

        if (!cancelled) {
          setTransactions(result?.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setTransactions([]);
          setErrorText(
            error instanceof Error
              ? error.message
              : "Gagal mengambil riwayat."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-white/10 bg-slate-950 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="//dkzd8du6wd13r.cloudfront.net/Images/v-normad-alpha/light-cyan/desktop/tabs/deposit-history.svg?v=605301323"
                alt="Riwayat Transaksi"
                className="h-7 w-7 object-contain"
              />
            </span>

            <div>
              <DialogTitle className="text-2xl font-black">
                Riwayat Transaksi
              </DialogTitle>
              <DialogDescription>
                Riwayat deposit dan withdraw untuk akun {username}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Player</p>
            <p className="mt-1 font-black text-white">{username}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Total Transaksi</p>
            <p className="mt-1 font-black text-cyan-200">
              {transactions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <p className="text-xs text-emerald-100/80">
              Total Deposit Approved
            </p>
            <p className="mt-1 font-black text-emerald-300">
              {formatIDR(String(totalDeposit))}
            </p>
          </div>
        </div>

        {errorText && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorText}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-400">
                <th className="p-3">Date</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Jenis</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              )}

              {!loading &&
                transactions.map((transaction) => {
                  const isDeposit = transaction.jenis === "DEPOSIT";
                  const isWithdraw =
                    transaction.jenis === "WITHDRAW" ||
                    transaction.jenis === "WITHDRAWAL";
                  const isApproved = transaction.status === "APPROVED";
                  const isRejected = transaction.status === "REJECTED";

                  return (
                    <tr
                      key={transaction.id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="p-3 text-slate-300">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="p-3 font-black text-white">
                        {formatIDR(transaction.nominal)}
                      </td>

                      <td className="p-3">
                        {isDeposit ? (
                          <Badge className="bg-emerald-600 text-white">
                            Deposit
                          </Badge>
                        ) : isWithdraw ? (
                          <Badge className="bg-cyan-600 text-white">
                            Withdraw
                          </Badge>
                        ) : (
                          <Badge className="bg-indigo-600 text-white">
                            {getJenisLabel(transaction.jenis)}
                          </Badge>
                        )}
                      </td>

                      <td className="p-3 text-slate-300">
                        {transaction.metode || "-"}
                      </td>

                      <td className="p-3">
                        <Badge
                          className={
                            isApproved
                              ? "bg-emerald-600 text-white"
                              : isRejected
                                ? "bg-red-600 text-white"
                                : "bg-amber-500 text-white"
                          }
                        >
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}

              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}