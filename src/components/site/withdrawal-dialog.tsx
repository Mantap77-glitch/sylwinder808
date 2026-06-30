"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WithdrawalDialogProps = {
  open: boolean;
  balance?: string;
  onOpenChange: (open: boolean) => void;
};

const playerBankAccounts = [
  {
    id: "registered-bank-account",
    label: "Rekening Terdaftar Player",
  },
];

function parseIDR(value?: string) {
  if (!value) return 0;

  const onlyNumber = value.replace(/[^\d]/g, "");

  return Number(onlyNumber || 0);
}

function formatIDR(value: string | number) {
  const numberValue = Number(value || 0);

  if (!numberValue) return "IDR 0";

  return `IDR ${numberValue.toLocaleString("id-ID")}`;
}

export function WithdrawalDialog({
  open,
  balance,
  onOpenChange,
}: WithdrawalDialogProps) {
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const currentBalance = useMemo(() => parseIDR(balance), [balance]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Jumlah penarikan wajib diisi.");
      return;
    }

    if (!bankAccount) {
      toast.error("Pilih bank tujuan penarikan.");
      return;
    }

    if (numericAmount > currentBalance) {
      toast.error("Saldo tidak mencukupi untuk melakukan withdraw.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/withdrawal-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          bankAccount,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        toast.error(
          result?.message ||
            result?.error ||
            "Gagal membuat request withdraw."
        );
        return;
      }

      toast.success(result?.message || "Request withdraw berhasil dibuat.");

      setAmount("");
      setBankAccount("");
      onOpenChange(false);

      window.location.reload();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto border-white/10 bg-slate-950 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="//dkzd8du6wd13r.cloudfront.net/Images/v-normad-alpha/light-cyan/desktop/tabs/withdrawal.svg?v=605301323"
                alt="Withdrawal"
                className="h-7 w-7 object-contain"
              />
            </span>

            <div>
              <DialogTitle className="text-2xl font-black">
                Penarikan
              </DialogTitle>
              <DialogDescription>
                Lengkapi data penarikan saldo player.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
          <p className="text-sm text-slate-300">Saldo tersedia</p>
          <p className="mt-1 text-2xl font-black text-cyan-200">
            {balance ?? "IDR 0"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount">Jumlah Penarikan</Label>
              <Input
                id="withdrawal-amount"
                type="number"
                inputMode="numeric"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="border-white/10 bg-slate-950 text-white"
                placeholder="Contoh: 50000"
                disabled={loading}
              />

              <p className="text-xs text-slate-400">
                Nominal saat ini:{" "}
                <span className="font-bold text-cyan-200">
                  {formatIDR(amount)}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Pilih Bank Anda</Label>
              <select
                value={bankAccount}
                onChange={(event) => setBankAccount(event.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                <option value="">Pilih Bank Anda</option>
                {playerBankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.label}
                  </option>
                ))}
              </select>

              <p className="text-xs text-slate-400">
                Withdraw akan dikirim ke rekening terdaftar player.
              </p>
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={loading}>
            {loading ? "Memproses..." : "Withdraw"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}