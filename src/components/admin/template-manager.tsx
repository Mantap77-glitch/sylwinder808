"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type TemplateManagerProps = {
  primaryColor: string;
  secondaryColor: string;
  loginBackground: string;
  registerBackground: string;
};

const DEFAULT_TEMPLATE = {
  primaryColor: "#4f46e5",
  secondaryColor: "#14b8a6",
  loginBackground: "#0f172a",
  registerBackground: "#111827",
};

function getSafeColor(value: string, fallback: string) {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value;
  }

  return fallback;
}

export function TemplateManager({
  primaryColor,
  secondaryColor,
  loginBackground,
  registerBackground,
}: TemplateManagerProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    primaryColor: getSafeColor(primaryColor, DEFAULT_TEMPLATE.primaryColor),
    secondaryColor: getSafeColor(
      secondaryColor,
      DEFAULT_TEMPLATE.secondaryColor
    ),
    loginBackground: getSafeColor(
      loginBackground,
      DEFAULT_TEMPLATE.loginBackground
    ),
    registerBackground: getSafeColor(
      registerBackground,
      DEFAULT_TEMPLATE.registerBackground
    ),
  });

  const [loading, setLoading] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/template", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        toast.error(result?.message || "Gagal menyimpan template.");
        return;
      }

      toast.success(result?.message || "Template berhasil disimpan.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      "Yakin ingin reset template ke default?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/template/reset", {
        method: "POST",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        toast.error(result?.message || "Gagal reset template.");
        return;
      }

      setForm(DEFAULT_TEMPLATE);
      toast.success(result?.message || "Template berhasil di-reset.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-5xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Template Public Website</CardTitle>
        <p className="text-sm text-slate-500">
          Atur warna utama, warna kedua, background login, dan background
          register website.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <Input
                  type="color"
                  value={form.primaryColor}
                  onChange={(event) =>
                    updateField("primaryColor", event.target.value)
                  }
                  className="h-12 cursor-pointer bg-white"
                />

                <Input
                  value={form.primaryColor}
                  onChange={(event) =>
                    updateField("primaryColor", event.target.value)
                  }
                  className="bg-white text-slate-950"
                  placeholder="#4f46e5"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <Input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(event) =>
                    updateField("secondaryColor", event.target.value)
                  }
                  className="h-12 cursor-pointer bg-white"
                />

                <Input
                  value={form.secondaryColor}
                  onChange={(event) =>
                    updateField("secondaryColor", event.target.value)
                  }
                  className="bg-white text-slate-950"
                  placeholder="#14b8a6"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="space-y-2">
              <Label>Login Background</Label>
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <Input
                  type="color"
                  value={form.loginBackground}
                  onChange={(event) =>
                    updateField("loginBackground", event.target.value)
                  }
                  className="h-12 cursor-pointer bg-white"
                />

                <Input
                  value={form.loginBackground}
                  onChange={(event) =>
                    updateField("loginBackground", event.target.value)
                  }
                  className="bg-white text-slate-950"
                  placeholder="#0f172a"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="space-y-2">
              <Label>Register Background</Label>
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <Input
                  type="color"
                  value={form.registerBackground}
                  onChange={(event) =>
                    updateField("registerBackground", event.target.value)
                  }
                  className="h-12 cursor-pointer bg-white"
                />

                <Input
                  value={form.registerBackground}
                  onChange={(event) =>
                    updateField("registerBackground", event.target.value)
                  }
                  className="bg-white text-slate-950"
                  placeholder="#111827"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-slate-950 p-5 text-white">
          <div
            className="rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
            }}
          >
            <p className="text-sm font-semibold opacity-80">
              Preview Primary / Secondary
            </p>
            <h3 className="mt-1 text-2xl font-black">Public Website Button</h3>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div
              className="rounded-2xl border border-white/10 p-5"
              style={{ backgroundColor: form.loginBackground }}
            >
              <p className="text-sm font-semibold opacity-80">
                Login Background
              </p>
              <h3 className="mt-1 text-xl font-black">Masuk/Login</h3>
            </div>

            <div
              className="rounded-2xl border border-white/10 p-5"
              style={{ backgroundColor: form.registerBackground }}
            >
              <p className="text-sm font-semibold opacity-80">
                Register Background
              </p>
              <h3 className="mt-1 text-xl font-black">Daftar/Register</h3>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" disabled={loading} onClick={handleSave}>
            {loading ? "Menyimpan..." : "Simpan Template"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={handleReset}
          >
            Reset ke Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}