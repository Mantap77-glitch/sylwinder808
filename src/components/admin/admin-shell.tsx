"use client";

import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[18rem_1fr]">
      <AdminSidebar />

      <main className="min-w-0 p-4 lg:p-6">
        <AdminTopbar />
        {children}
      </main>
    </div>
  );
}