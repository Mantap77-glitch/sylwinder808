"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminClientForm() {
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [domains, setDomains] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !clientName ||
      !clientCode ||
      !adminUsername ||
      !adminEmail ||
      !adminPassword
    ) {
      toast.error(
        "Client name, code, username, email, dan password wajib diisi."
      );
      return;
    }

    if (adminPassword.length < 6) {
      toast.error("Password admin client minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/admin-clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName,
          clientCode,
          adminUsername,
          adminEmail,
          adminPassword,
          domains,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal membuat admin client.");
        return;
      }

      toast.success(result?.message || "Admin client berhasil dibuat.");

      setClientName("");
      setClientCode("");
      setAdminUsername("");
      setAdminEmail("");
      setAdminPassword("");
      setDomains("");

      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Buat Admin Client</CardTitle>
        <p className="text-sm text-slate-500">
          Form ini akan membuat tenant/client baru, akun admin client, dan
          domain awal.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="Contoh: Client Pertama"
            />
          </div>

          <div className="space-y-2">
            <Label>Client Code</Label>
            <Input
              value={clientCode}
              onChange={(event) =>
                setClientCode(
                  event.target.value
                    .toLowerCase()
                    .replaceAll(" ", "_")
                    .replace(/[^a-z0-9_]/g, "")
                )
              }
              className="bg-white text-slate-950"
              placeholder="contoh: client_pertama"
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Username</Label>
            <Input
              value={adminUsername}
              onChange={(event) => setAdminUsername(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="adminclient1"
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="adminclient@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Password</Label>
            <Input
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className="space-y-2">
            <Label>Domain</Label>
            <Input
              value={domains}
              onChange={(event) => setDomains(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="contoh: pertama1.xyz, pertama1.top"
            />
            <p className="text-xs text-slate-500">
              Pisahkan banyak domain dengan koma. Bisa dikosongkan.
            </p>
          </div>

          <Button className="md:col-span-2" type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Buat Admin Client"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}   