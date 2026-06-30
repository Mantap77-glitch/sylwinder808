"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { SelectNative } from "@/components/ui/select-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const transactionFormSchema = z.object({
  type: z.literal("ADJUSTMENT"),
  playerId: z.string().min(1, "Player wajib dipilih."),
  amount: z.coerce
    .number()
    .refine((value) => value !== 0, "Amount tidak boleh 0."),
  note: z.string().optional(),
});

type TransactionFormInput = z.input<typeof transactionFormSchema>;
type TransactionFormValues = z.output<typeof transactionFormSchema>;

type PlayerOption = {
  id: string;
  username: string;
  email: string;
  tenantId?: string | null;
  tenantName?: string;
  phone?: string;
  balance?: number;
};

export function TransactionForm({ players }: { players: PlayerOption[] }) {
  const form = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "ADJUSTMENT",
      playerId: "",
      amount: 0,
      note: "",
    },
  });

  const onSubmit: SubmitHandler<TransactionFormValues> = async (values) => {
    const res = await fetch("/api/admin/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || result?.success === false) {
      toast.error(
        result?.message || result?.error || "Gagal membuat adjustment."
      );
      return;
    }

    toast.success(result?.message || "Adjustment berhasil dibuat.");

    form.reset({
      type: "ADJUSTMENT",
      playerId: "",
      amount: 0,
      note: "",
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 md:grid-cols-2"
    >
      <div className="space-y-2">
        <Label>Player</Label>
        <SelectNative
          className="bg-white text-slate-950"
          {...form.register("playerId")}
        >
          <option value="">Pilih player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.username} - {player.email}
              {player.tenantName ? ` - ${player.tenantName}` : ""}
              {typeof player.balance === "number"
                ? ` - Saldo: IDR ${player.balance.toLocaleString("id-ID")}`
                : ""}
            </option>
          ))}
        </SelectNative>

        {form.formState.errors.playerId && (
          <p className="text-sm text-red-600">
            {form.formState.errors.playerId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <SelectNative
          className="bg-white text-slate-950"
          {...form.register("type")}
        >
          <option value="ADJUSTMENT">Adjustment</option>
        </SelectNative>

        <p className="text-xs text-slate-500">
          Deposit dan withdraw diproses lewat Manual Transaction.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          className="bg-white text-slate-950"
          type="number"
          step="1"
          placeholder="Contoh: 50000 atau -50000"
          {...form.register("amount")}
        />

        <p className="text-xs text-slate-500">
          Gunakan nilai positif untuk menambah saldo dan nilai negatif untuk
          mengurangi saldo.
        </p>

        {form.formState.errors.amount && (
          <p className="text-sm text-red-600">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Note</Label>
        <Input
          className="bg-white text-slate-950"
          placeholder="Contoh: Koreksi saldo player"
          {...form.register("note")}
        />
      </div>

      <Button
        className="md:col-span-2"
        type="submit"
        disabled={form.formState.isSubmitting || players.length === 0}
      >
        {form.formState.isSubmitting
          ? "Memproses..."
          : "Simpan Adjustment"}
      </Button>
    </form>
  );
}