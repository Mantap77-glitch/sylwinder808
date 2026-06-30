"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Badge } from "@/components/ui/badge";

type BankType = "BANK" | "EWALLET" | "PULSA" | "QRIS";

type BankRow = {
  id: string;
  name: string;
  code: string;
  type: BankType;
  accountName: string;
  accountNumber: string;
  adminFee: string;
  isActive: boolean;
};

type BankSettingManagerProps = {
  banks: BankRow[];
};

const defaultForm = {
  id: "",
  name: "",
  code: "",
  type: "BANK" as BankType,
  accountName: "",
  accountNumber: "",
  adminFee: "",
  isActive: true,
};

function makeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function BankSettingManager({ banks }: BankSettingManagerProps) {
  const router = useRouter();

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(form.id);

  const groupedBanks = useMemo(() => {
    return {
      BANK: banks.filter((bank) => bank.type === "BANK"),
      EWALLET: banks.filter((bank) => bank.type === "EWALLET"),
      PULSA: banks.filter((bank) => bank.type === "PULSA"),
    };
  }, [banks]);

  function updateForm<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "name" && !isEdit) {
        next.code = makeCode(String(value));
      }

      return next;
    });
  }

  function resetForm() {
    setForm(defaultForm);
  }

  function handleEdit(bank: BankRow) {
    setForm({
      id: bank.id,
      name: bank.name,
      code: bank.code,
      type: bank.type,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      adminFee: bank.adminFee,
      isActive: bank.isActive,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Nama akun wajib diisi.");
      return;
    }

    if (!form.code.trim()) {
      toast.error("Kode akun wajib diisi.");
      return;
    }

    if (!form.accountName.trim()) {
      toast.error("Nama pemilik akun wajib diisi.");
      return;
    }

    if (!form.accountNumber.trim()) {
      toast.error(
        form.type === "PULSA"
          ? "Nomor tujuan wajib diisi."
          : "Nomor rekening / akun wajib diisi."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/banks", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id || undefined,
          name: form.name,
          code: form.code,
          type: form.type,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          adminFee: form.adminFee,
          isActive: form.isActive,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menyimpan akun.");
        return;
      }

      toast.success(result?.message || "Akun berhasil disimpan.");
      resetForm();
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(bank: BankRow) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus akun ${bank.name}?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/settings/banks?id=${bank.id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menghapus akun.");
        return;
      }

      toast.success(result?.message || "Akun berhasil dihapus.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(bank: BankRow) {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/banks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bank.id,
          name: bank.name,
          code: bank.code,
          type: bank.type,
          accountName: bank.accountName,
          accountNumber: bank.accountNumber,
          adminFee: bank.adminFee,
          isActive: !bank.isActive,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal mengubah status.");
        return;
      }

      toast.success(result?.message || "Status akun berhasil diubah.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Akun" : "Tambah Akun"}</CardTitle>
          <p className="text-sm text-slate-500">
            Akun aktif akan muncul otomatis di dropdown deposit public website
            sesuai kategori.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <SelectNative
                value={form.type}
                onChange={(event) =>
                  updateForm("type", event.target.value as BankType)
                }
                className="bg-white text-slate-950"
              >
                <option value="BANK">BANK</option>
                <option value="EWALLET">E-WALLET</option>
                <option value="PULSA">PULSA</option>
              </SelectNative>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <SelectNative
                value={form.isActive ? "ACTIVE" : "DEACTIVE"}
                onChange={(event) =>
                  updateForm("isActive", event.target.value === "ACTIVE")
                }
                className="bg-white text-slate-950"
              >
                <option value="ACTIVE">Active</option>
                <option value="DEACTIVE">Deactive</option>
              </SelectNative>
            </div>

            <div className="space-y-2">
              <Label>
                {form.type === "PULSA" ? "Nama Operator" : "Nama Bank / E-Wallet"}
              </Label>
              <Input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="bg-white text-slate-950"
                placeholder={
                  form.type === "PULSA" ? "Contoh: Telkomsel" : "Contoh: BCA"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Kode</Label>
              <Input
                value={form.code}
                onChange={(event) =>
                  updateForm("code", makeCode(event.target.value))
                }
                className="bg-white text-slate-950"
                placeholder="Contoh: BCA / DANA / TELKOMSEL"
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Pemilik Akun</Label>
              <Input
                value={form.accountName}
                onChange={(event) =>
                  updateForm("accountName", event.target.value)
                }
                className="bg-white text-slate-950"
                placeholder="Contoh: PT Client Pertama"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {form.type === "PULSA" ? "Nomor Tujuan" : "Nomor Rekening / Akun"}
              </Label>
              <Input
                value={form.accountNumber}
                onChange={(event) =>
                  updateForm("accountNumber", event.target.value)
                }
                className="bg-white text-slate-950"
                placeholder={
                  form.type === "PULSA"
                    ? "Contoh: 081234567890"
                    : "Contoh: 1234567890"
                }
              />
            </div>

            {form.type === "PULSA" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Keterangan Biaya Admin</Label>
                <Input
                  value={form.adminFee}
                  onChange={(event) => updateForm("adminFee", event.target.value)}
                  className="bg-white text-slate-950"
                  placeholder="Contoh: Biaya admin 10%"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Menyimpan..."
                  : isEdit
                    ? "Update Akun"
                    : "Tambah Akun"}
              </Button>

              {isEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={resetForm}
                >
                  Batal Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <BankTable
        title="BANK"
        data={groupedBanks.BANK}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      <BankTable
        title="E-WALLET"
        data={groupedBanks.EWALLET}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      <BankTable
        title="PULSA"
        data={groupedBanks.PULSA}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />
    </div>
  );
}

function BankTable({
  title,
  data,
  loading,
  onEdit,
  onDelete,
  onToggle,
}: {
  title: string;
  data: BankRow[];
  loading: boolean;
  onEdit: (bank: BankRow) => void;
  onDelete: (bank: BankRow) => void;
  onToggle: (bank: BankRow) => void;
}) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-slate-500">Total akun: {data.length}</p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="p-3">Nama</th>
                <th className="p-3">Kode</th>
                <th className="p-3">Pemilik</th>
                <th className="p-3">Nomor</th>
                <th className="p-3">Admin Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((bank) => (
                <tr key={bank.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-950">{bank.name}</td>
                  <td className="p-3">{bank.code}</td>
                  <td className="p-3">{bank.accountName || "-"}</td>
                  <td className="p-3">{bank.accountNumber || "-"}</td>
                  <td className="p-3">{bank.adminFee || "-"}</td>
                  <td className="p-3">
                    <Badge
                      className={
                        bank.isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                      }
                    >
                      {bank.isActive ? "Active" : "Deactive"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={loading}
                        onClick={() => onEdit(bank)}
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={loading}
                        onClick={() => onToggle(bank)}
                      >
                        {bank.isActive ? "Deactivate" : "Activate"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={loading}
                        onClick={() => onDelete(bank)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Belum ada akun {title}.
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