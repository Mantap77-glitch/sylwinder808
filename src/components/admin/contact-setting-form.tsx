"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContactSettingFormProps = {
  defaultWhatsappNumber: string;
  defaultWhatsappUrl: string;
  defaultTelegramUsername: string;
  defaultTelegramUrl: string;
};

function normalizeWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function makeWhatsappUrl(number: string) {
  const cleanNumber = normalizeWhatsappNumber(number);

  if (!cleanNumber) return "";

  return `https://wa.me/${cleanNumber}`;
}

function normalizeTelegramUsername(value: string) {
  return value.trim().replace(/^@/, "");
}

function makeTelegramUrl(username: string) {
  const cleanUsername = normalizeTelegramUsername(username);

  if (!cleanUsername) return "";

  return `https://t.me/${cleanUsername}`;
}

export function ContactSettingForm({
  defaultWhatsappNumber,
  defaultWhatsappUrl,
  defaultTelegramUsername,
  defaultTelegramUrl,
}: ContactSettingFormProps) {
  const router = useRouter();

  const [whatsappNumber, setWhatsappNumber] = useState(defaultWhatsappNumber);
  const [whatsappUrl, setWhatsappUrl] = useState(defaultWhatsappUrl);
  const [telegramUsername, setTelegramUsername] = useState(
    defaultTelegramUsername
  );
  const [telegramUrl, setTelegramUrl] = useState(defaultTelegramUrl);

  const [loading, setLoading] = useState(false);

  function handleWhatsappNumberChange(value: string) {
    setWhatsappNumber(value);

    const url = makeWhatsappUrl(value);
    setWhatsappUrl(url);
  }

  function handleTelegramUsernameChange(value: string) {
    setTelegramUsername(value);

    const url = makeTelegramUrl(value);
    setTelegramUrl(url);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/contact", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whatsappNumber,
          whatsappUrl,
          telegramUsername,
          telegramUrl,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menyimpan contact setting.");
        return;
      }

      toast.success(result?.message || "Contact setting berhasil disimpan.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-4xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Form WhatsApp & Telegram</CardTitle>
        <p className="text-sm text-slate-500">
          Data ini nanti bisa dipakai untuk tombol bantuan, customer service,
          atau floating contact di public website.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input
              value={whatsappNumber}
              onChange={(event) =>
                handleWhatsappNumberChange(event.target.value)
              }
              className="bg-white text-slate-950"
              placeholder="Contoh: 6281234567890"
            />
            <p className="text-xs text-slate-500">
              Gunakan format negara. Contoh Indonesia: 628xxxxxxxxxx.
            </p>
          </div>

          <div className="space-y-2">
            <Label>WhatsApp URL</Label>
            <Input
              value={whatsappUrl}
              onChange={(event) => setWhatsappUrl(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="https://wa.me/6281234567890"
            />
          </div>

          <div className="space-y-2">
            <Label>Telegram Username</Label>
            <Input
              value={telegramUsername}
              onChange={(event) =>
                handleTelegramUsernameChange(event.target.value)
              }
              className="bg-white text-slate-950"
              placeholder="Contoh: supportclient"
            />
            <p className="text-xs text-slate-500">
              Boleh isi tanpa @. Contoh: supportclient.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Telegram URL</Label>
            <Input
              value={telegramUrl}
              onChange={(event) => setTelegramUrl(event.target.value)}
              className="bg-white text-slate-950"
              placeholder="https://t.me/supportclient"
            />
          </div>

          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <MessageCircle className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-black text-slate-950">Preview WhatsApp</p>
                  <p className="text-sm text-slate-500">
                    {whatsappUrl || "Belum diisi"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                  <Send className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-black text-slate-950">Preview Telegram</p>
                  <p className="text-sm text-slate-500">
                    {telegramUrl || "Belum diisi"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button className="md:col-span-2" type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Contact Setting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}