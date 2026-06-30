"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type DomainRow = {
  id: string;
  host: string;
  status: string;
  isPrimary: boolean;
};

type DomainManagerProps = {
  domains: DomainRow[];
  maxDomains: number;
};

function cleanHost(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0];
}

export function DomainManager({ domains, maxDomains }: DomainManagerProps) {
  const router = useRouter();

  const [host, setHost] = useState("");
  const [loading, setLoading] = useState(false);

  const domainLimitReached = domains.length >= maxDomains;

  const normalizedHost = useMemo(() => cleanHost(host), [host]);

  async function handleAddDomain(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (domainLimitReached) {
      toast.error(`Maksimal hanya boleh ${maxDomains} domain.`);
      return;
    }

    if (!normalizedHost) {
      toast.error("Domain wajib diisi.");
      return;
    }

    if (!normalizedHost.includes(".")) {
      toast.error("Format domain tidak valid. Contoh: domain.com");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: normalizedHost,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menambahkan domain.");
        return;
      }

      toast.success(result?.message || "Domain berhasil ditambahkan.");
      setHost("");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(domain: DomainRow) {
    const nextStatus = domain.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      nextStatus === "INACTIVE"
        ? `Yakin ingin menonaktifkan domain ${domain.host}?`
        : `Yakin ingin mengaktifkan domain ${domain.host}?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/domain", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: domain.id,
          status: nextStatus,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal mengubah status domain.");
        return;
      }

      toast.success(result?.message || "Status domain berhasil diubah.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPrimary(domain: DomainRow) {
    if (domain.isPrimary) {
      toast.info("Domain ini sudah menjadi primary.");
      return;
    }

    const confirmed = window.confirm(
      `Jadikan ${domain.host} sebagai primary domain?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/domain/primary", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: domain.id,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal mengubah primary domain.");
        return;
      }

      toast.success(result?.message || "Primary domain berhasil diubah.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(domain: DomainRow) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus domain ${domain.host}?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/settings/domain?id=${domain.id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menghapus domain.");
        return;
      }

      toast.success(result?.message || "Domain berhasil dihapus.");
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
          <CardTitle>Tambah Domain</CardTitle>
          <p className="text-sm text-slate-500">
            Domain yang didaftarkan akan digunakan untuk membaca
            public website. Maksimal {maxDomains} domain.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAddDomain} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <Input
                value={host}
                onChange={(event) => setHost(event.target.value)}
                disabled={domainLimitReached || loading}
                className="bg-white text-slate-950"
                placeholder="contoh: pertama1.xyz"
              />

              <div className="mt-2 text-xs text-slate-500">
                {domainLimitReached ? (
                  <span className="font-semibold text-red-600">
                    Limit tercapai. Maksimal {maxDomains} domain.
                  </span>
                ) : normalizedHost ? (
                  <span>
                    Akan disimpan sebagai:{" "}
                    <strong className="text-slate-700">{normalizedHost}</strong>
                  </span>
                ) : (
                  <span>Masukkan domain tanpa http:// atau https://.</span>
                )}
              </div>
            </div>

            <Button type="submit" disabled={domainLimitReached || loading}>
              {loading ? "Menyimpan..." : "Tambah Domain"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Domain</CardTitle>
          <p className="text-sm text-slate-500">
            Total domain: {domains.length}/{maxDomains}
          </p>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="p-3">Domain</th>
                  <th className="p-3">Primary</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-950">{domain.host}</p>
                      <p className="text-xs text-slate-500">
                        Public website domain
                      </p>
                    </td>

                    <td className="p-3">
                      {domain.isPrimary ? (
                        <Badge className="bg-indigo-600 text-white">
                          Primary
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={loading}
                          onClick={() => handleSetPrimary(domain)}
                        >
                          Set Primary
                        </Button>
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          domain.status === "ACTIVE"
                            ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                        }
                      >
                        {domain.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={loading}
                          onClick={() => handleToggleStatus(domain)}
                        >
                          {domain.status === "ACTIVE" ? "Inactivate" : "Activate"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={loading}
                          onClick={() => handleDelete(domain)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {domains.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-slate-500"
                    >
                      Belum ada domain.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}