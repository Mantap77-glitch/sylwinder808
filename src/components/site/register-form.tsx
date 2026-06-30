"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type FormValues = z.infer<typeof registerSchema>;

type Bank = { id: string; name: string; code: string; type: string };

export function RegisterForm({ banks }: { banks: Bank[] }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeTerms: false },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (!res.ok) return toast.error("Register gagal. Cek kembali data yang kamu isi.");
    toast.success("Register berhasil. Silakan login.");
    form.reset();
  }
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-red-400">{error}</p>}</div>;
}
