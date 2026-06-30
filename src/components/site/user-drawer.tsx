"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Gift, History, LogOut, Menu, User, Wallet, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DepositPaymentDialog } from "@/components/site/deposit-payment-dialog";
import { WithdrawalDialog } from "@/components/site/withdrawal-dialog";
import { TransactionHistoryDialog } from "@/components/site/transaction-history-dialog";

type UserDrawerProps = {
  user: {
    username: string;
    balance?: string;
    loyaltyPoint?: string;
    level?: string;
  };
};

export function UserDrawer({ user }: UserDrawerProps) {
  const [portalReady, setPortalReady] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  function openDrawer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setDrawerMounted(true);

    window.requestAnimationFrame(() => {
      setOpen(true);
    });
  }

  function closeDrawer() {
    setOpen(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setDrawerMounted(false);
      closeTimerRef.current = null;
    }, 300);
  }

  useEffect(() => {
    if (!drawerMounted) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflowX = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overflowX = previousHtmlOverflowX;
    };
  }, [drawerMounted]);

  useEffect(() => {
    if (!drawerMounted) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerMounted]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/player-logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  function openDeposit() {
    closeDrawer();
    setDepositOpen(true);
  }

  function openWithdrawal() {
    closeDrawer();
    setWithdrawalOpen(true);
  }

  function openHistory() {
    closeDrawer();
    setHistoryOpen(true);
  }

  const drawerPortal =
    portalReady && drawerMounted
      ? createPortal(
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            <button
              type="button"
              aria-label="Tutup user drawer"
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
              onClick={closeDrawer}
            />

            <aside
              className={`absolute right-0 top-0 h-[100dvh] w-[88vw] max-w-sm overflow-y-auto border-l border-white/10 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-out ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950 p-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-white/45">
                    Info User
                  </p>
                  <h2 className="truncate text-lg font-black">
                    {user.username}
                  </h2>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={closeDrawer}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 p-4 pb-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-white/45">Username</p>
                      <p className="truncate font-black">{user.username}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-white/45">Saldo</p>
                    <p className="mt-1 break-words font-black text-primary">
                      {user.balance ?? "Rp0"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-white/45">Level</p>
                    <p className="mt-1 font-black">
                      {user.level ?? "Bronze"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Loyalty Point</p>
                  <p className="mt-1 text-xl font-black text-amber-300">
                    {user.loyaltyPoint ?? "0"}
                  </p>
                </div>

                <nav className="grid gap-2">
                  <DrawerAction
                    icon={<Wallet className="h-4 w-4" />}
                    onClick={openDeposit}
                  >
                    Deposit
                  </DrawerAction>

                  <DrawerAction
                    icon={<Wallet className="h-4 w-4" />}
                    onClick={openWithdrawal}
                  >
                    Withdraw
                  </DrawerAction>

                  <DrawerAction
                    icon={<History className="h-4 w-4" />}
                    onClick={openHistory}
                  >
                    Riwayat Transaksi
                  </DrawerAction>
                </nav>

                <Button
                  type="button"
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={openDrawer}
        className="gap-2"
      >
        <Menu className="h-4 w-4" />
        <span className="hidden sm:inline">User</span>
      </Button>

      {drawerPortal}

      <DepositPaymentDialog
        open={depositOpen}
        username={user.username}
        onOpenChange={setDepositOpen}
      />

      <WithdrawalDialog
        open={withdrawalOpen}
        balance={user.balance}
        onOpenChange={setWithdrawalOpen}
      />

      <TransactionHistoryDialog
        open={historyOpen}
        username={user.username}
        onOpenChange={setHistoryOpen}
      />
    </>
  );
}

function DrawerLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
    >
      {icon}
      {children}
    </Link>
  );
}

function DrawerAction({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold transition hover:bg-white/10"
    >
      {icon}
      {children}
    </button>
  );
}