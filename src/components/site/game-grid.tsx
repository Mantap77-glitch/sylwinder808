"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Game = {
  id: string;
  name: string;
  slug: string;
  category: string;
  provider: string;
};

type GameGridProps = {
  games: Game[];
  onProviderSelect?: (providerSlug: string) => void;
};

const allowedProviders = [
  "pragmatic-play",
  "pg-soft",
  "hacksaw-gaming",
  "microgaming",
];

const providerMeta: Record<
  string,
  {
    name: string;
    imageUrl: string;
    fallback: string;
  }
> = {
  "pragmatic-play": {
    name: "Pragmatic Play",
    imageUrl: "/providers-grid/gg1.webp",
    fallback: "PP",
  },
  "pg-soft": {
    name: "PG Soft",
    imageUrl: "/providers-grid/gg2.webp",
    fallback: "PG",
  },
  "hacksaw-gaming": {
    name: "Hacksaw Gaming",
    imageUrl: "/providers-grid/gg3.webp",
    fallback: "HG",
  },
  microgaming: {
    name: "Microgaming",
    imageUrl: "/providers-grid/gg4.webp",
    fallback: "MG",
  },
};

function sortByAllowedProviders(games: Game[]) {
  return [...games].sort((a, b) => {
    return allowedProviders.indexOf(a.slug) - allowedProviders.indexOf(b.slug);
  });
}

export function GameGrid({ games, onProviderSelect }: GameGridProps) {
  const providerGames = sortByAllowedProviders(
    games.filter((game) => allowedProviders.includes(game.slug))
  );

  return (
    <section id="games" className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-primary">
            Pilih Platform
          </p>

          <h2 className="text-3xl font-black text-white">Provider Games</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Klik provider untuk melihat daftar game.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {providerGames.map((game, index) => {
          const meta = providerMeta[game.slug] ?? {
            name: game.name,
            imageUrl: "",
            fallback: game.name.slice(0, 2).toUpperCase(),
          };

          const cardContent = (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-card shadow-soft transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                {meta.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.imageUrl}
                    alt={meta.name}
                    className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-4xl font-black text-primary">
                    {meta.fallback}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-center text-sm font-black text-white drop-shadow md:text-base">
                    {meta.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          );

          if (onProviderSelect) {
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => onProviderSelect(game.slug)}
                className="block text-left"
              >
                {cardContent}
              </button>
            );
          }

          return (
            <Link key={game.id} href={`#${game.slug}`} className="block">
              {cardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}