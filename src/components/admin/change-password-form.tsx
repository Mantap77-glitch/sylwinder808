"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword) {
      toast.error("Password lama wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal mengganti password.");
        return;
      }

      toast.success(result?.message || "Password berhasil diganti.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Form Change Password</CardTitle>
        <p className="text-sm text-slate-500">
          Gunakan password yang kuat dan jangan bagikan kepada siapa pun.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Password Lama</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="Masukkan password lama"
            />
          </div>

          <div className="space-y-2">
            <Label>Password Baru</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className="space-y-2">
            <Label>Konfirmasi Password Baru</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="Ulangi password baru"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPassword ? "Sembunyikan Password" : "Lihat Password"}
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}