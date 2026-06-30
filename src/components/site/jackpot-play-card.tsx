"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

function formatIDR(value: number) {
  return `IDR ${value.toLocaleString("id-ID")}`;
}

function getRandomIncrement() {
  return Math.floor(Math.random() * 100000) + 1000;
}

export function JackpotPlayCard() {
  const [jackpot, setJackpot] = useState(5137812986);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setJackpot((current) => current + getRandomIncrement());
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-300/30 bg-slate-950 p-4 shadow-soft">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.22),transparent_22rem)]" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/25">
            <Sparkles className="h-4 w-4" />
          </span>

          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Jackpot Play
          </h3>
        </div>

        <div className="rounded-[1.4rem] border-4 border-cyan-200/60 bg-black px-4 py-4 shadow-[0_0_25px_rgba(34,211,238,.20)]">
          <div className="rounded-[1rem] border border-dashed border-cyan-300/50 bg-slate-950/80 px-3 py-3 text-center">
            <p className="font-mono text-[1.55rem] font-black leading-none tracking-wider text-cyan-100 drop-shadow-[0_0_8px_rgba(103,232,249,.8)] md:text-3xl">
              {formatIDR(jackpot)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}