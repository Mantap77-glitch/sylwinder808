"use client";

import { useEffect, useMemo, useState } from "react";
import { Medal } from "lucide-react";

type WinnerItem = {
  username: string;
  amount: number;
  game: string;
  imageUrl: string;
};

const winnerData: WinnerItem[] = [
  {
    username: "kamd****",
    amount: 7973000,
    game: "Gates of Olympus 1000",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/GatesofOlympus1000.jpg",
  },
  {
    username: "azka****",
    amount: 2850000,
    game: "Mahjong Ways 2",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/MahjongWays2.jpg",
  },
  {
    username: "riko****",
    amount: 4568000,
    game: "Sweet Bonanza 1000",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/vs20fruitswx.png",
  },
  {
    username: "bima****",
    amount: 1825000,
    game: "Fortune Tiger",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/FortuneTiger.webp",
  },
  {
    username: "nara****",
    amount: 9360000,
    game: "Starlight Princess 1000",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/StarlightPrincess1000.jpg",
  },
  {
    username: "dion****",
    amount: 3219000,
    game: "Sugar Rush 1000",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/vs20sugarrushx.png",
  },
  {
    username: "saka****",
    amount: 1200000,
    game: "Lucky Neko",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/LuckyNeko.jpg",
  },
  {
    username: "vian****",
    amount: 6475000,
    game: "Gates Of Gatot Kaca Super Scatter",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/GatesofGatotKacaSuperScatter.webp",
  },
  {
    username: "reno****",
    amount: 5125000,
    game: "Wild Bounty Showdown",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pgsoft/WildBountyShowdown.jpg",
  },
  {
    username: "aldi****",
    amount: 8788000,
    game: "Sweet Bonanza Super Scatter",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/SweetBonanzaSuperScatter.webp",
  },
  {
    username: "fajar****",
    amount: 2530000,
    game: "Mahjong Wins 3 - Black Scatter",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/MahjongWins3BlackScatter.jpg",
  },
  {
    username: "tama****",
    amount: 4100000,
    game: "Treasures of Aztec",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pgsoft/TreasureOfAztec.jpg",
  },
  {
    username: "yoga****",
    amount: 6882000,
    game: "Gates Of Olympus",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/vs20olympgate.png",
  },
  {
    username: "zaki****",
    amount: 972000,
    game: "Fortune Rabbit",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/FortuneRabbit.jpg",
  },
  {
    username: "raja****",
    amount: 7650000,
    game: "Starlight Princess",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/Starlight-Princess.jpg",
  },
  {
    username: "ivan****",
    amount: 3480000,
    game: "Sugar Rush",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/SugarRush.jpg",
  },
  {
    username: "luki****",
    amount: 6899000,
    game: "Wild West Gold",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/vs40wildwest.png",
  },
  {
    username: "joko****",
    amount: 1535000,
    game: "Dragon Hatch",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/DragonHatch.jpg",
  },
  {
    username: "mega****",
    amount: 8290000,
    game: "Gates Of Olympus Super Scatter",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/vs20olympgold.png",
  },
  {
    username: "bayu****",
    amount: 2745000,
    game: "Mafia Mayhem",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/MafiaMayhem.jpg",
  },
  {
    username: "raka****",
    amount: 5980000,
    game: "Wisdom Of Athena 1000 Xmas",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/WisdomofAthena1000Xmas.webp",
  },
  {
    username: "feri****",
    amount: 4020000,
    game: "Queen of Bounty",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/QueenOfBounty.jpg",
  },
  {
    username: "dika****",
    amount: 10850000,
    game: "Starlight Princess Super Scatter",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/StarlightPrincessSuperScatter.webp",
  },
  {
    username: "aris****",
    amount: 2360000,
    game: "Pinata Wins",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/PinataWins.jpg",
  },
  {
    username: "udin****",
    amount: 6815000,
    game: "Mahjong Wins Gong Xi Fa Cai",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/vswaysmahwgong.png",
  },
  {
    username: "seno****",
    amount: 3999000,
    game: "Ways of the Qilin",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/WaysOfQilin.jpg",
  },
  {
    username: "reza****",
    amount: 7410000,
    game: "Zeus vs Typhon",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/ZeusvsTyphon.webp",
  },
  {
    username: "toni****",
    amount: 1165000,
    game: "Caishen Wins",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/CaishenWins.jpg",
  },
  {
    username: "imam****",
    amount: 5625000,
    game: "Fortune Of Olympus",
    imageUrl:
      "https://pixel.gambar-lp.com/game-demo/pragmaticplay/FortuneofOlympus.webp",
  },
  {
    username: "rang****",
    amount: 9245000,
    game: "Wild Bandito",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/WildBandito.jpg",
  },
];

function formatIDR(value: number) {
  return `IDR ${value.toLocaleString("id-ID")}.00`;
}

export function SlotWinnerCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const activeWinner = useMemo(() => winnerData[activeIndex], [activeIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFade(false);

      window.setTimeout(() => {
        setActiveIndex((current) => {
          const randomIndex = Math.floor(Math.random() * winnerData.length);

          if (randomIndex === current) {
            return (current + 1) % winnerData.length;
          }

          return randomIndex;
        });

        setFade(true);
      }, 220);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-slate-950 p-4 shadow-soft">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,.20),transparent_18rem)]" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-400/20 text-amber-300 ring-1 ring-amber-300/30">
            <Medal className="h-4 w-4" />
          </span>

          <h3 className="text-sm font-black uppercase tracking-wide text-white">
            Pemenang Mesin Slot
          </h3>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl border border-cyan-300/15 bg-cyan-950/35 p-3 transition duration-300 ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeWinner.imageUrl}
              alt={activeWinner.game}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">
              {activeWinner.username}
            </p>

            <p className="mt-1 font-mono text-lg font-black text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,.45)]">
              {formatIDR(activeWinner.amount)}
            </p>

            <p className="mt-1 line-clamp-1 text-sm font-semibold text-cyan-100">
              {activeWinner.game}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}