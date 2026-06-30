"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema } from "@/lib/validators/auth";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Values = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(adminLoginSchema) });
  async function onSubmit(values: Values) {
  const res = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    return toast.error(result?.message || "Login gagal");
  }

  toast.success(result?.message || "Login berhasil");
  router.push(result?.redirectTo || "/admin");
  router.refresh();
  }
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,.45),transparent_35%),linear-gradient(135deg,#0f172a,#312e81)] p-4">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur lg:grid-cols-[1.1fr_.9fr]">
      <section className="flex min-h-[300px] flex-col justify-between bg-gradient-to-br from-indigo-600/80 to-cyan-500/60 p-8 text-white lg:min-h-[560px] lg:p-14"><div className="font-bold">✦ Sylwinder808</div><div><h1 className="text-5xl font-black">WELCOME</h1></div></section>
      <section className="bg-white p-8 text-slate-950 lg:p-14">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div><h2 className="text-3xl font-black">Masuk</h2><p className="mt-2 text-slate-500">Gunakan email dan password admin.</p></div>
          <div className="space-y-2"><Label>Email</Label><Input className="bg-white text-slate-950" type="email" {...form.register("email")} /></div>
          <div className="space-y-2"><Label>Password</Label><Input className="bg-white text-slate-950" type="password" {...form.register("password")} /></div>
          <label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" {...form.register("remember")} /> Ingat saya</label>
          <Button className="w-full" type="submit">Login</Button>
        </form>
      </section>
    </div>
  </main>;
}
