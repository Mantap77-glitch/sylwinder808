"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

type AnnouncementBarProps = {
  siteName: string;
};

function formatDateNow(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function AnnouncementBar({ siteName }: AnnouncementBarProps) {
  const [now, setNow] = useState("");

  useEffect(() => {
    function updateTime() {
      setNow(formatDateNow(new Date()));
    }

    updateTime();

    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4">
      <div className="grid gap-3 overflow-hidden rounded-md border border-cyan-950/20 bg-cyan-300/70 px-4 py-3 text-cyan-950 shadow-sm md:grid-cols-[220px_1fr_250px] md:items-center">
        <div className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-700/20">
            <Megaphone className="h-5 w-5" />
          </span>
          <span>Pemberitahuan</span>
        </div>

        <div className="overflow-hidden rounded-sm bg-cyan-950/45 px-3 py-2 text-sm font-semibold text-white">
          <div className="animate-[marquee_18s_linear_infinite] whitespace-nowrap">
            Games yang tidak tersedia saat ini sedang maintenance | Hubungi
            support {siteName} untuk BONUS & PROMO MENARIK SLOT ONLINE
          </div>
        </div>

        <div className="text-left font-mono text-sm font-bold md:text-right">
          {now}
        </div>
      </div>
    </section>
  );
}