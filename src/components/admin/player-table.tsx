"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export type Player = {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;

  tenantName: string;
  phone: string;
  balance: number;
  loyaltyPoint: number;
  loyaltyXp: number;

  bankName: string;
  accountName: string;
  accountNumber: string;
};

export function PlayerTable({ data }: { data: Player[] }) {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return data;

    return data.filter((player) => {
      return (
        player.username.toLowerCase().includes(keyword) ||
        player.email.toLowerCase().includes(keyword) ||
        player.phone.toLowerCase().includes(keyword) ||
        player.tenantName.toLowerCase().includes(keyword) ||
        player.bankName.toLowerCase().includes(keyword) ||
        player.accountName.toLowerCase().includes(keyword) ||
        player.accountNumber.toLowerCase().includes(keyword)
      );
    });
  }, [data, search]);

  async function handleChangePassword() {
    setMessage("");

    if (!selectedPlayer) {
      setMessage("Player tidak ditemukan.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/players/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          newPassword,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        setMessage(
          result?.message ||
            result?.error ||
            "Gagal mengganti password player."
        );
        return;
      }

      setMessage(result?.message || "Password player berhasil diganti.");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setSelectedPlayer(null);
        setMessage("");
      }, 800);
    } catch {
      setMessage("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnDef<Player>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-slate-950">{row.original.username}</p>
          <p className="text-xs text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) =>
        `IDR ${row.original.balance.toLocaleString("id-ID", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
    },
    {
      accessorKey: "bankName",
      header: "Bank / E-Wallet",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.bankName}</p>
          <p className="text-xs text-slate-500">
            {row.original.accountName} • {row.original.accountNumber}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            row.original.isActive
              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
              : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
          }
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      id: "changePassword",
      header: "Change Password",
      cell: ({ row }) => (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelectedPlayer(row.original);
            setNewPassword("");
            setConfirmPassword("");
            setMessage("");
          }}
        >
          Change Password
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">Data Player</h2>
            <p className="text-sm text-slate-500">
              Total data tampil: {filteredData.length}
            </p>
          </div>

          <div className="w-full md:w-80">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search player..."
              className="bg-white text-slate-950"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3 text-left text-xs font-black uppercase tracking-wider text-slate-500"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td className="p-3 text-slate-700" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-slate-500"
                  >
                    Data player tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(selectedPlayer)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPlayer(null);
            setNewPassword("");
            setConfirmPassword("");
            setMessage("");
          }
        }}
      >
        <DialogContent className="bg-white text-slate-950">
          <DialogHeader>
            <DialogTitle>Change Password Player</DialogTitle>
            <DialogDescription>
              Ganti password untuk player{" "}
              <strong>{selectedPlayer?.username}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {message && (
              <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                className="bg-white text-slate-950"
              />
            </div>

            <div className="space-y-2">
              <Label>Konfirmasi Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi password baru"
                className="bg-white text-slate-950"
              />
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={loading}
              onClick={handleChangePassword}
            >
              {loading ? "Memproses..." : "Simpan Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}