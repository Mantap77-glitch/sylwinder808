"use client";

import { useEffect, useState } from "react";

const hacksawGamingGames = [
  {
    title: "3 Cursed Chests",
    imageUrl: "https://great.com/wp-content/uploads/2026/04/3-Cursed-Chests.jpg",
    desktopUrl:
      "https://static-live.hacksawgaming.com/2296/1.24.0/index.html?language=en&channel=desktop&gameid=2296&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
    mobileUrl:
      "https://static-live.hacksawgaming.com/2296/1.24.0/index.html?language=en&channel=mobile&gameid=2296&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
  },
  {
    title: "Le Fisherman",
    imageUrl:
      "https://great.com/wp-content/uploads/2026/01/le-fisherman-slot-266x354.png",
    desktopUrl:
      "https://static-live.hacksawgaming.com/launcher/static-launcher.html?gameid=2057&channel=desktop&language=en&partner=hacksaw&mode=demo&token=123",
    mobileUrl:
      "https://static-live.hacksawgaming.com/launcher/static-launcher.html?gameid=2057&channel=mobile&language=en&partner=hacksaw&mode=demo&token=123",
  },
  {
    title: "Rise Of Fortuna",
    imageUrl: "https://great.com/wp-content/uploads/2026/05/Rise-of-Fortuna.jpg",
    desktopUrl:
      "https://static-live.hacksawgaming.com/2213/1.19.0/index.html?language=en&channel=desktop&gameid=2213&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
    mobileUrl:
      "https://static-live.hacksawgaming.com/2213/1.19.0/index.html?language=en&channel=mobile&gameid=2213&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
  },
  {
    title: "Le Bandit",
    imageUrl:
      "https://great.com/wp-content/uploads/2024/09/26092024_1727337917-266x354.jpg",
    desktopUrl:
      "https://static-stg.hacksawgaming.com/launcher/static-launcher.html?gameid=1309&channel=desktop&language=en&partner=stg&mode=demo&token=123",
    mobileUrl:
      "https://static-stg.hacksawgaming.com/launcher/static-launcher.html?gameid=1309&channel=mobile&language=en&partner=stg&mode=demo&token=123",
  },
  {
    title: "Red Rascal",
    imageUrl: "https://great.com/wp-content/uploads/2026/04/Red-Rascal.jpg",
    desktopUrl:
      "https://static-live.hacksawgaming.com/2274/1.20.0/index.html?language=en&channel=desktop&gameid=2274&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
    mobileUrl:
      "https://static-live.hacksawgaming.com/2274/1.20.0/index.html?language=en&channel=mobile&gameid=2274&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
  },
  {
    title: "Wanted Dead Or A Wild",
    imageUrl:
      "https://great.com/wp-content/uploads/2024/09/26092024_1727338985-1-266x354.jpeg",
    desktopUrl:
      "https://static-stg.hacksawgaming.com/launcher/static-launcher.html?gameid=1067&channel=desktop&language=en&partner=stg&mode=demo&token=123",
    mobileUrl:
      "https://static-stg.hacksawgaming.com/launcher/static-launcher.html?gameid=1067&channel=mobile&language=en&partner=stg&mode=demo&token=123",
  },
  {
    title: "Epic Bullets & Bounty",
    imageUrl:
      "https://great.com/wp-content/uploads/2026/03/Epic-Bullets-Bounty-266x354.png",
    desktopUrl:
      "https://static-live.hacksawgaming.com/2185/1.2.2/index.html?language=en&channel=desktop&gameid=2185&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
    mobileUrl:
      "https://static-live.hacksawgaming.com/2185/1.2.2/index.html?language=en&channel=mobile&gameid=2185&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
  },
  {
    title: "Le Hooligan",
    imageUrl:
      "https://great.com/wp-content/uploads/2026/06/Le-Hooligan_53673_.05062026_1780685951-1-266x354.jpeg",
    desktopUrl:
      "https://static-stg.hacksawgaming.com/2470/1.1.4/index.html?language=en&channel=desktop&gameid=2470&mode=2&token=123&partner=stg&env=https://rgs-hacksaw-fun-stg.hacksawgaming.com/api&realmoneyenv=https://rgs-hacksaw-stg.hacksawgaming.com/api&alwaysredirect=true",
    mobileUrl:
      "https://static-stg.hacksawgaming.com/2470/1.1.4/index.html?language=en&channel=mobile&gameid=2470&mode=2&token=123&partner=stg&env=https://rgs-hacksaw-fun-stg.hacksawgaming.com/api&realmoneyenv=https://rgs-hacksaw-stg.hacksawgaming.com/api&alwaysredirect=true",
  },
  {
    title: "Plinko",
    imageUrl: "https://great.com/wp-content/uploads/2024/11/Plinko-266x354.png",
    desktopUrl:
      "https://static-live.hacksawgaming.com/1294/1.82.0/index.html?language=en&channel=desktop&gameid=1294&mode=2&token=123131&lobbyurl=https%3A%2F%2Fwww.hacksawgaming.com&currency=EUR&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api",
    mobileUrl:
      "https://static-live.hacksawgaming.com/1294/1.82.0/index.html?language=en&channel=mobile&gameid=1294&mode=2&token=123131&lobbyurl=https%3A%2F%2Fwww.hacksawgaming.com&currency=EUR&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api",
  },
  {
    title: "Deal With Death",
    imageUrl: "https://great.com/wp-content/uploads/2026/01/Deal-With-Death.png",
    desktopUrl:
      "https://static-live.hacksawgaming.com/2000/1.29.2/index.html?language=en&channel=desktop&gameid=2000&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
    mobileUrl:
      "https://static-live.hacksawgaming.com/2000/1.29.2/index.html?language=en&channel=mobile&gameid=2000&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true",
  },
  {
    title: "Duel At Dawn",
    imageUrl:
      "https://great.com/wp-content/uploads/2024/11/duel_at_dawn-266x354.png",
    desktopUrl:
      "https://static-live.hacksawgaming.com/1620/1.35.2/index.html?language=en&channel=desktop&gameid=1620&mode=2&token=123131&lobbyurl=https%3A%2F%2Fwww.hacksawgaming.com&currency=EUR&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api",
    mobileUrl:
      "https://static-live.hacksawgaming.com/1620/1.35.2/index.html?language=en&channel=mobile&gameid=1620&mode=2&token=123131&lobbyurl=https%3A%2F%2Fwww.hacksawgaming.com&currency=EUR&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api",
  },
  {
    title: "Le Cowboy",
    imageUrl:
      "https://great.com/wp-content/uploads/2025/11/Le-Cowboy-266x354.png",
    desktopUrl:
      "https://static-live.hacksawgaming.com/launcher/static-launcher.html?gameid=1924&channel=desktop&language=en&partner=bigwinboard&mode=demo&token=123",
    mobileUrl:
      "https://static-live.hacksawgaming.com/launcher/static-launcher.html?gameid=1924&channel=mobile&language=en&partner=bigwinboard&mode=demo&token=123",
  },
];

function checkIsMobile() {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
    window.innerWidth < 768
  );
}

export function HacksawGamingGameList() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function updateDevice() {
      setIsMobile(checkIsMobile());
    }

    updateDevice();

    window.addEventListener("resize", updateDevice);

    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return (
    <section id="hacksaw-gaming-games" className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-primary">
            Provider Games
          </p>

          <h2 className="text-2xl font-black text-white md:text-3xl">
            Hacksaw Gaming
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Klik gambar game untuk mulai bermain.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {hacksawGamingGames.map((game) => {
          const playUrl = isMobile ? game.mobileUrl : game.desktopUrl;

          return (
            <a
              key={game.title}
              href={playUrl}
              target="_blank"
              rel="noopener nofollow"
              aria-label={`Main ${game.title}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-card shadow-soft transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="line-clamp-2 text-xs font-black leading-4 text-white drop-shadow md:text-sm">
                    {game.title}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}