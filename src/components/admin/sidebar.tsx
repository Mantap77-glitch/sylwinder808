"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  MessageCircle,
  KeyRound,
  UserPlus,
  Landmark,
  Image,
  Globe,
  LayoutTemplate,
  History,
  ClipboardPlus,
  FileText,
} from "lucide-react";

type AdminMe = {
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "STAFF";
  tenantName: string | null;
  isSuperAdmin: boolean;
};

const clientTransactionMenus = [
  {
    label: "New Transaction",
    href: "/admin/transactions/new",
    icon: ClipboardPlus,
  },
  {
    label: "Manual Transaction",
    href: "/admin/transactions/manual",
    icon: FileText,
  },
  {
    label: "History Transaction",
    href: "/admin/transactions/history",
    icon: History,
  },
];

const superTransactionMenus = [
  {
    label: "History Transaction",
    href: "/admin/transactions/history",
    icon: History,
  },
];

const clientWebSettingMenus = [
  {
    label: "Bank Setting",
    href: "/admin/settings/banks",
    icon: Landmark,
  },
  {
    label: "Change Icon Logo",
    href: "/admin/settings/branding",
    icon: Image,
  },
  {
    label: "Change Banner",
    href: "/admin/settings/banner",
    icon: Image,
  },
  {
    label: "Template",
    href: "/admin/settings/template",
    icon: LayoutTemplate,
  },
  {
    label: "Contact Setting",
    href: "/admin/settings/contact",
    icon: MessageCircle,
  },
  {
    label: "Management Domain",
    href: "/admin/settings/domain",
    icon: Globe,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadMe() {
      try {
        const response = await fetch("/api/admin/me", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const result = await response.json();
        setMe(result);
      } finally {
        setLoaded(true);
      }
    }

    loadMe();
  }, []);

  const isSuperAdmin = me?.isSuperAdmin === true || me?.role === "SUPER_ADMIN";

  const transactionMenus = isSuperAdmin
    ? superTransactionMenus
    : clientTransactionMenus;

  return (
    <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r bg-slate-950 p-4 text-white lg:block">
      <div className="mb-6 flex items-center gap-3 rounded-3xl bg-white/10 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-500 font-black">
          ✦
        </span>

        <div className="min-w-0">
          <p className="truncate font-black">SYLWINDER 808</p>
        </div>
      </div>

      {loaded && me && (
        <nav className="space-y-6">
          <div className="space-y-2">
            <MenuTitle>{isSuperAdmin ? "Management" : "Menu Utama"}</MenuTitle>

            {!isSuperAdmin && (
              <>
                <SidebarLink
                  href="/admin"
                  label="Home Page"
                  icon={Home}
                  active={pathname === "/admin"}
                />

                <SidebarLink
                  href="/admin/players"
                  label="Player List"
                  icon={Users}
                  active={pathname.startsWith("/admin/players")}
                />
              </>
            )}

            {isSuperAdmin && (
              <>
                <SidebarLink
                  href="/admin/admin-clients"
                  label="Admin Clients"
                  icon={UserPlus}
                  active={pathname.startsWith("/admin/admin-clients")}
                />

                <SidebarLink
                  href="/admin/settings/domain"
                  label="Management Domain"
                  icon={Globe}
                  active={pathname.startsWith("/admin/settings/domain")}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <MenuTitle>Transaction</MenuTitle>

            {transactionMenus.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </div>

          {!isSuperAdmin && (
            <div className="space-y-2">
              <MenuTitle>Web Setting</MenuTitle>

              {clientWebSettingMenus.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname.startsWith(item.href)}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <MenuTitle>Account</MenuTitle>

            <SidebarLink
              href="/admin/change-password"
              label="Change Password"
              icon={KeyRound}
              active={pathname.startsWith("/admin/change-password")}
            />
          </div>
        </nav>
      )}
    </aside>
  );
}

function MenuTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 text-xs font-black uppercase tracking-wider text-white/40">
      {children}
    </p>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-indigo-500 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}