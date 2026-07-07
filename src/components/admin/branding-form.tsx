"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BrandingFormProps = {
  defaultSiteName: string;
  defaultLogoUrl: string | null;
};

export function BrandingForm({
  defaultSiteName,
  defaultLogoUrl,
}: BrandingFormProps) {
  const router = useRouter();

  const [siteName, setSiteName] = useState(defaultSiteName);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(defaultLogoUrl ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!siteName.trim()) {
      toast.error("Nama situs wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("siteName", siteName.trim());

    if (logoFile) {
      formData.append("logoFile", logoFile);
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/branding", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menyimpan branding.");
        return;
      }

      toast.success(result?.message || "Branding berhasil disimpan.");
      setLogoFile(null);

      if (result?.data?.logoUrl) {
        setPreviewUrl(result.data.logoUrl);
      }

      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Form Branding Website</CardTitle>
        <p className="text-sm text-slate-500">
          Logo ini akan tampil di topbar public website dan dipakai sebagai icon
          browser/tab.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Nama Situs</Label>
            <Input
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="Contoh: NAMA CLIENT 1"
            />  
          </div>

          <div className="space-y-2">
            <Label>Upload Logo / Icon</Label>
            <Input
              type="file"
              accept="image/*"
              className="bg-white text-slate-950"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setLogoFile(file);

                if (file) {
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
            <p className="text-xs text-slate-500">
              Rekomendasi gambar persegi, contoh 512x512 PNG/WebP.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Preview Topbar</Label>

            <div className="rounded-2xl border bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-3 font-black tracking-widest">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary text-primary-foreground">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={siteName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    siteName.slice(0, 2).toUpperCase()
                  )}
                </span>

                <span className="truncate">{siteName || "NAMA"}</span>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Branding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}