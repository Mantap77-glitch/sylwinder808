"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GameGrid } from "@/components/site/game-grid";

type ProviderCard = {
  id: string;
  name: string;
  slug: string;
  category: string;
  provider: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | string | null;
};

type ProviderGame = {
  id?: string | number | null;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  provider?: string | null;
  providerSlug?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  playUrl?: string | null;
  desktopUrl?: string | null;
  mobileUrl?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | string | null;
};

type GameProviderSectionProps = {
  games: ProviderCard[];
  providerGames?: Record<string, ProviderGame[]>;
  isAuthenticated?: boolean;
};

function requestLogin() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event("player:open-login"));
}

function checkIsMobile() {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    ) || window.innerWidth < 768
  );
}

function getProviderTitle(provider?: ProviderCard | null, slug?: string | null) {
  if (provider?.name) return provider.name;

  if (!slug) return "Provider Games";

  return slug
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function getGameTitle(game: ProviderGame) {
  return game.title || game.name || "Game";
}

function getGameImage(game: ProviderGame) {
  return game.imageUrl || game.thumbnailUrl || "";
}

function getGameUrl(game: ProviderGame, isMobile: boolean) {
  if (isMobile && game.mobileUrl) return game.mobileUrl;
  if (!isMobile && game.desktopUrl) return game.desktopUrl;

  return game.playUrl || game.desktopUrl || game.mobileUrl || "#";
}

function normalizeProviderGames(games: ProviderGame[]) {
  return [...games]
    .filter((game) => game.isActive !== false)
    .sort((a, b) => {
      const sortA = Number(a.sortOrder || 0);
      const sortB = Number(b.sortOrder || 0);

      return sortA - sortB;
    });
}

export function GameProviderSection({
  games,
  providerGames = {},
  isAuthenticated = false,
}: GameProviderSectionProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function updateDevice() {
      setIsMobile(checkIsMobile());
    }

    updateDevice();

    window.addEventListener("resize", updateDevice);

    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  const selectedProviderCard = useMemo(() => {
    if (!selectedProvider) return null;

    return games.find((game) => game.slug === selectedProvider) || null;
  }, [games, selectedProvider]);

  const selectedProviderGames = useMemo(() => {
    if (!selectedProvider) return [];

    return normalizeProviderGames(providerGames[selectedProvider] || []);
  }, [providerGames, selectedProvider]);

  function handleProviderSelect(providerSlug: string) {
    if (!isAuthenticated) {
      requestLogin();
      return;
    }

    setSelectedProvider(providerSlug);
  }

  if (selectedProvider) {
    const providerTitle = getProviderTitle(
      selectedProviderCard,
      selectedProvider
    );

    return (
      <section>
        <div className="mx-auto max-w-7xl px-4 pt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSelectedProvider(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Provider
          </Button>
        </div>

        <section
          id={`${selectedProvider}-games`}
          className="mx-auto max-w-7xl px-4 py-8"
        >
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-primary">
                Provider Games
              </p>

              <h2 className="text-2xl font-black text-white md:text-3xl">
                {providerTitle}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground">
              Klik gambar game untuk mulai bermain.
            </p>
          </div>

          {selectedProviderGames.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {selectedProviderGames.map((game, index) => {
                const title = getGameTitle(game);
                const imageUrl = getGameImage(game);
                const playUrl = getGameUrl(game, isMobile);

                return (
                  <a
                    key={`${selectedProvider}-${game.id || game.slug || title}-${index}`}
                    href={isAuthenticated ? playUrl : "#"}
                    target={isAuthenticated ? "_blank" : undefined}
                    rel={isAuthenticated ? "noopener nofollow" : undefined}
                    aria-label={`Main ${title}`}
                    onClick={(event) => {
                      if (!isAuthenticated) {
                        event.preventDefault();
                        requestLogin();
                      }
                    }}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-card shadow-soft transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-3xl font-black text-primary">
                          {title.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="line-clamp-2 text-xs font-black leading-4 text-white drop-shadow md:text-sm">
                          {title}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
              Daftar game untuk provider ini belum tersedia.
            </div>
          )}
        </section>
      </section>
    );
  }

  return (
    <GameGrid
      games={games}
      onProviderSelect={handleProviderSelect}
    />
  );
}