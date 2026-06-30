"use client";

import { useEffect, useMemo, useState } from "react";

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

type PaymentMethod = "BANK" | "EWALLET" | "PULSA";

type DepositPaymentDialogProps = {
  open: boolean;
  username: string;
  onOpenChange: (open: boolean) => void;
};

type PaymentTarget = {
  id: string;
  name: string;
  code: string;
  type: PaymentMethod;
  accountName: string | null;
  accountNumber: string | null;
  adminFee: string | null;
};

type PaymentTargetRaw = {
  id?: string | number;
  name?: string | null;
  bankName?: string | null;
  code?: string | null;
  type?: string | null;
  method?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  adminFee?: string | number | null;
  isActive?: boolean | null;
};

const paymentMethods = [
  {
    key: "BANK" as const,
    label: "BANK",
    icon: "//dkzd8du6wd13r.cloudfront.net/Images/payment-types/BANK.svg?v=606021655",
    alt: "BANK",
  },
  {
    key: "EWALLET" as const,
    label: "E-WALLET",
    icon: "//dkzd8du6wd13r.cloudfront.net/Images/payment-types/EMONEY.svg?v=606021655",
    alt: "E-WALLET",
  },
  {
    key: "PULSA" as const,
    label: "PULSA",
    icon: "//dkzd8du6wd13r.cloudfront.net/Images/payment-types/PULSA.svg?v=606021655",
    alt: "PULSA",
  },
];

const playerAccounts = [
  {
    id: "BCA - Rekening Terdaftar Player",
    label: "BCA - Rekening Terdaftar Player",
  },
  {
    id: "DANA - Akun Terdaftar Player",
    label: "DANA - Akun Terdaftar Player",
  },
];

function formatIDR(value: string) {
  const numberValue = Number(value || 0);

  if (!numberValue) return "IDR 0";

  return `IDR ${numberValue.toLocaleString("id-ID")}`;
}

function getAmountInfo(method: PaymentMethod) {
  if (method === "PULSA") {
    return "Minimal IDR 20.000 - Maksimal IDR 1.000.000";
  }

  return "Minimal IDR 20.000 - Maksimal IDR 100.000.000";
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "BANK" || value === "EWALLET" || value === "PULSA";
}

function getRawTargets(result: unknown): PaymentTargetRaw[] {
  if (!result || typeof result !== "object") return [];

  const data = result as {
    data?: unknown;
    targets?: unknown;
    paymentTargets?: unknown;
  };

  const raw = data.data || data.targets || data.paymentTargets || [];

  return Array.isArray(raw) ? (raw as PaymentTargetRaw[]) : [];
}

function normalizePaymentTargets(result: unknown): PaymentTarget[] {
  return getRawTargets(result)
    .filter((target) => target.isActive !== false)
    .map((target) => {
      const rawType = target.type || target.method || "BANK";
      const type = String(rawType).toUpperCase();

      if (!isPaymentMethod(type)) return null;

      const name = target.name || target.bankName || target.code || type;

      return {
        id: String(target.id || ""),
        name: String(name),
        code: String(target.code || target.bankName || name),
        type,
        accountName: target.accountName ? String(target.accountName) : null,
        accountNumber: target.accountNumber
          ? String(target.accountNumber)
          : null,
        adminFee:
          target.adminFee === null || target.adminFee === undefined
            ? null
            : String(target.adminFee),
      };
    })
    .filter((target): target is PaymentTarget => Boolean(target?.id));
}

function makeTargetLabel(target: PaymentTarget) {
  if (target.type === "PULSA") {
    return `${target.name} - ${target.accountNumber ?? "-"}`;
  }

  return `${target.name} - ${target.accountName ?? "-"} - ${
    target.accountNumber ?? "-"
  }`;
}

export function DepositPaymentDialog({
  open,
  username,
  onOpenChange,
}: DepositPaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("BANK");
  const [amount, setAmount] = useState("");
  const [originAccount, setOriginAccount] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [paymentTargets, setPaymentTargets] = useState<PaymentTarget[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [targetsError, setTargetsError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const currentTargets = useMemo(() => {
    return paymentTargets.filter((target) => target.type === method);
  }, [paymentTargets, method]);

  const selectedPulsaTarget = useMemo(() => {
    return paymentTargets.find(
      (item) => item.id === targetAccount && item.type === "PULSA"
    );
  }, [paymentTargets, targetAccount]);

  const amountMin = 20000;
  const amountMax = method === "PULSA" ? 1000000 : 100000000;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadPaymentTargets() {
      setTargetsLoading(true);
      setTargetsError("");

      try {
        const response = await fetch("/api/public/payment-targets", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Gagal mengambil payment target."
          );
        }

        if (!cancelled) {
          setPaymentTargets(normalizePaymentTargets(result));
        }
      } catch (error) {
        if (!cancelled) {
          setPaymentTargets([]);
          setTargetsError(
            error instanceof Error
              ? error.message
              : "Gagal mengambil payment target."
          );
        }
      } finally {
        if (!cancelled) {
          setTargetsLoading(false);
        }
      }
    }

    loadPaymentTargets();

    return () => {
      cancelled = true;
    };
  }, [open]);

  function handleMethodChange(nextMethod: PaymentMethod) {
    setMethod(nextMethod);
    setOriginAccount("");
    setTargetAccount("");
    setSerialNumber("");
    setProofFile(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLoading) return;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < amountMin) {
      alert("Nominal minimal IDR 20.000.");
      return;
    }

    if (numericAmount > amountMax) {
      alert(
        method === "PULSA"
          ? "Nominal PULSA maksimal IDR 1.000.000."
          : "Nominal maksimal IDR 100.000.000."
      );
      return;
    }

    if (!targetAccount) {
      alert("Akun tujuan wajib dipilih.");
      return;
    }

    if (method !== "PULSA" && !originAccount) {
      alert("Akun asal wajib dipilih.");
      return;
    }

    if (method === "PULSA" && !serialNumber.trim()) {
      alert("Nomor Seri / SN wajib diisi.");
      return;
    }

    if (proofFile && !proofFile.type.startsWith("image/")) {
      alert("Bukti transfer harus berupa gambar.");
      return;
    }

    if (proofFile && proofFile.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB.");
      return;
    }

    const formData = new FormData();

    formData.append("username", username);
    formData.append("method", method);
    formData.append("amount", String(numericAmount));
    formData.append("originAccount", originAccount);
    formData.append("targetBankId", targetAccount);
    formData.append("serialNumber", serialNumber);

    if (proofFile) {
      formData.append("proof", proofFile);
    }

    setSubmitLoading(true);

    try {
      const response = await fetch("/api/public/deposit-requests", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        alert(
          result?.message ||
            result?.error ||
            "Gagal mengirim request deposit."
        );
        return;
      }

      alert(result?.message || "Request deposit berhasil dikirim.");

      setAmount("");
      setOriginAccount("");
      setTargetAccount("");
      setSerialNumber("");
      setProofFile(null);
      onOpenChange(false);

      window.location.reload();
    } catch {
      alert("Server tidak dapat dihubungi.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/10 bg-slate-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            Payment Method
          </DialogTitle>
          <DialogDescription>
            Pilih metode pembayaran dan lengkapi form deposit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((item) => {
            const active = method === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleMethodChange(item.key)}
                className={`rounded-2xl border p-4 transition ${
                  active
                    ? "border-cyan-300 bg-cyan-400/10 ring-2 ring-cyan-300/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt={item.alt}
                    className="h-8 w-8 object-contain"
                  />
                </div>

                <p
                  className={`mt-3 text-center text-xs font-black ${
                    active ? "text-cyan-200" : "text-white"
                  }`}
                >
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>

        {targetsError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {targetsError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="mb-4">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
              Form Deposit {method === "EWALLET" ? "E-Wallet" : method}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {getAmountInfo(method)}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deposit-amount">Nominal</Label>
              <Input
                id="deposit-amount"
                type="number"
                inputMode="numeric"
                min={amountMin}
                max={amountMax}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="border-white/10 bg-slate-950 text-white"
                placeholder="Contoh: 20000"
              />
              <p className="text-xs text-slate-400">
                Nominal saat ini:{" "}
                <span className="font-bold text-cyan-200">
                  {formatIDR(amount)}
                </span>
              </p>
            </div>

            {method === "BANK" && (
              <>
                <div className="space-y-2">
                  <Label>BANK Asal</Label>
                  <select
                    value={originAccount}
                    onChange={(event) => setOriginAccount(event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                  >
                    <option value="">Pilih BANK Asal</option>
                    {playerAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>BANK Tujuan</Label>
                  <select
                    value={targetAccount}
                    onChange={(event) => setTargetAccount(event.target.value)}
                    disabled={targetsLoading}
                    className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {targetsLoading
                        ? "Memuat BANK Tujuan..."
                        : "Pilih BANK Tujuan"}
                    </option>

                    {currentTargets.map((account) => (
                      <option key={account.id} value={account.id}>
                        {makeTargetLabel(account)}
                      </option>
                    ))}
                  </select>

                  {!targetsLoading && currentTargets.length === 0 && (
                    <p className="text-xs text-amber-200">
                      Belum ada akun BANK aktif dari Bank Setting.
                    </p>
                  )}
                </div>
              </>
            )}

            {method === "EWALLET" && (
              <>
                <div className="space-y-2">
                  <Label>Akun Asal</Label>
                  <select
                    value={originAccount}
                    onChange={(event) => setOriginAccount(event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                  >
                    <option value="">Pilih Akun Asal</option>
                    {playerAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Akun Tujuan</Label>
                  <select
                    value={targetAccount}
                    onChange={(event) => setTargetAccount(event.target.value)}
                    disabled={targetsLoading}
                    className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {targetsLoading
                        ? "Memuat Akun Tujuan..."
                        : "Pilih Akun Tujuan"}
                    </option>

                    {currentTargets.map((account) => (
                      <option key={account.id} value={account.id}>
                        {makeTargetLabel(account)}
                      </option>
                    ))}
                  </select>

                  {!targetsLoading && currentTargets.length === 0 && (
                    <p className="text-xs text-amber-200">
                      Belum ada akun E-WALLET aktif dari Bank Setting.
                    </p>
                  )}
                </div>
              </>
            )}

            {method === "PULSA" && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label>Nomor Tujuan</Label>
                  <select
                    value={targetAccount}
                    onChange={(event) => setTargetAccount(event.target.value)}
                    disabled={targetsLoading}
                    className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {targetsLoading
                        ? "Memuat Nomor Tujuan..."
                        : "Pilih Nomor Tujuan"}
                    </option>

                    {currentTargets.map((account) => (
                      <option key={account.id} value={account.id}>
                        {makeTargetLabel(account)}
                      </option>
                    ))}
                  </select>

                  {!targetsLoading && currentTargets.length === 0 && (
                    <p className="text-xs text-amber-200">
                      Belum ada akun PULSA aktif dari Bank Setting.
                    </p>
                  )}

                  {selectedPulsaTarget && (
                    <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
                      Keterangan biaya admin:{" "}
                      <span className="font-bold">
                        {selectedPulsaTarget.adminFee || "-"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deposit-sn">Nomor Seri / SN</Label>
                  <Input
                    id="deposit-sn"
                    value={serialNumber}
                    onChange={(event) => setSerialNumber(event.target.value)}
                    className="border-white/10 bg-slate-950 text-white"
                    placeholder="Masukkan nomor seri transaksi pulsa"
                  />
                </div>
              </>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deposit-proof">
                Bukti{" "}
                <span className="text-xs font-normal text-slate-500">
                  (Opsional)
                </span>
              </Label>
              <Input
                id="deposit-proof"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setProofFile(file);
                }}
                className="border-white/10 bg-slate-950 text-white"
              />

              {proofFile && (
                <p className="text-xs text-slate-400">
                  File dipilih:{" "}
                  <span className="font-bold text-cyan-200">
                    {proofFile.name}
                  </span>
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={submitLoading}>
            {submitLoading ? "Mengirim..." : "Kirim Deposit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}