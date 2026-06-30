"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PlayerAuthDialogs } from "./player-auth-dialogs";
import { UserDrawer } from "./user-drawer";

type PublicTopbarProps = {
  siteName?: string;
  logoUrl?: string | null;
  isAuthenticated?: boolean;
  user?: {
    username: string;
    balance?: string;
    loyaltyPoint?: string;
    level?: string;
  };
};

export function PublicTopbar({
  siteName = "NAMA",
  logoUrl,
  isAuthenticated = false,
  user,
}: PublicTopbarProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    const openLoginDialog = () => setLoginOpen(true);
    const openRegisterDialog = () => setRegisterOpen(true);

    window.addEventListener("player:open-login", openLoginDialog);
    window.addEventListener("player:open-register", openRegisterDialog);

    return () => {
      window.removeEventListener("player:open-login", openLoginDialog);
      window.removeEventListener("player:open-register", openRegisterDialog);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-4">
          <Link
            href={isAuthenticated ? "/home" : "/"}
            className="flex min-w-0 items-center gap-2 font-black tracking-wide sm:gap-3 sm:tracking-widest"
          >
            <span className="grid h-8 w-8 shrink-0 overflow-hidden place-items-center rounded-lg bg-primary text-[10px] font-black text-primary-foreground sm:h-10 sm:w-10 sm:rounded-xl md:h-11 md:w-11 md:rounded-2xl">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-full w-full object-cover"
                />
              ) : (
                siteName.slice(0, 2).toUpperCase()
              )}
            </span>

            <span className="max-w-[120px] truncate text-xs sm:max-w-[180px] sm:text-sm md:max-w-none md:text-base">
              {siteName}
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-8 px-6 text-sm font-bold text-white/65 lg:flex">
            <a href="#games" className="transition hover:text-white">
              Hot Games
            </a>
            <a href="#games" className="transition hover:text-white">
              Slots
            </a>
            <a href="#games" className="transition hover:text-white">
              Live Casino
            </a>
            <a href="#games" className="transition hover:text-white">
              Race
            </a>
            <a href="#games" className="transition hover:text-white">
              Togel
            </a>
            <a href="#games" className="transition hover:text-white">
              Olahraga
            </a>
            <a href="#games" className="transition hover:text-white">
              Crash Game
            </a>
            <a href="#games" className="transition hover:text-white">
              Arcade
            </a>
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2">
            {isAuthenticated && user ? (
              <UserDrawer user={user} />
            ) : (
              <>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="h-9 rounded-full px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                >
                  Login
                </Button>

                <Button
                  type="button"
                  onClick={() => setRegisterOpen(true)}
                  className="h-9 rounded-full px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                >
                  Daftar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {!isAuthenticated && (
        <PlayerAuthDialogs
          loginOpen={loginOpen}
          registerOpen={registerOpen}
          onLoginOpenChange={setLoginOpen}
          onRegisterOpenChange={setRegisterOpen}
        />
      )}
    </>
  );
}