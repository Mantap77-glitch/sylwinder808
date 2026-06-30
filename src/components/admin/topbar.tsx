"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminMe = {
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "STAFF";
  tenantName: string | null;
  isSuperAdmin: boolean;
};

export function AdminTopbar() {
  const router = useRouter();
  const [me, setMe] = useState<AdminMe | null>(null);

  useEffect(() => {
    async function loadMe() {
      const response = await fetch("/api/admin/me", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const result = await response.json();
      setMe(result);
    }

    loadMe();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/admin-logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  const roleLabel =
    me?.isSuperAdmin || me?.role === "SUPER_ADMIN"
      ? "SUPER_ADMIN"
      : me?.tenantName || me?.role || "";

  return (
    <header className="sticky top-4 z-20 mb-6 flex items-center justify-between rounded-3xl border bg-white/90 p-4 text-slate-900 shadow-soft backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white">
          ✦
        </span>

        <div className="min-w-0">
          <strong className="block truncate">Admin Panel</strong>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {me && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black text-slate-950">{me.username}</p>
            <p className="text-xs text-slate-500">{me.email}</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="gap-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}