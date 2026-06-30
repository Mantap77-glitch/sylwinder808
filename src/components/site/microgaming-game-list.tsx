"use client";

import { useEffect, useState } from "react";

const microgamingGames = [
  {
    title: "Luna Princess",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_lunaPrincessLinkMerge.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_lunaPrincessLinkMerge&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_lunaPrincessLinkMerge&languageCode=en&host=mobile",
  },
  {
    title: "Queen Of Cairo Royal Maxways",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_queenOfCairoRoyalMaxways.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_queenOfCairoRoyalMaxways&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_queenOfCairoRoyalMaxways&languageCode=en&host=mobile",
  },
  {
    title: "Striker X",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/P5_strikerX.JPG",
    desktopUrl:
      "https://anya.microfg.com/game/crash/cr2612/?hide=prov%2CtxID%2Cexit&lang=en&token=eyJhbGciOiJGWEciLCJ0eXAiOiJKV1QifQ.eyJVSUQiOiJkZW1vXzk1MjgiLCJCYWxhbmNlIjo1MDAwMDAwMH0.jdfu_7vyz0HpcnhcsZ4rZriIIkMQq2ajasHEhZSHOkI&ui=6",
    mobileUrl:
      "https://anya.microfg.com/game/crash/cr2612/?hide=prov%2CtxID%2Cexit&lang=en&token=eyJhbGciOiJGWEciLCJ0eXAiOiJKV1QifQ.eyJVSUQiOiJkZW1vXzk1MjgiLCJCYWxhbmNlIjo1MDAwMDAwMH0.jdfu_7vyz0HpcnhcsZ4rZriIIkMQq2ajasHEhZSHOkI&ui=6",
  },
  {
    title: "Bison Fire Charge",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_bisonFireCharge.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_bisonFireCharge&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_bisonFireCharge&languageCode=en&host=mobile",
  },
  {
    title: "Playboy Gems and Desires",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_playboyGemsDesires.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_playboyGemsDesires&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_playboyGemsDesires&languageCode=en&host=mobile",
  },
  {
    title: "Soccer X",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_soccerX.JPG",
    desktopUrl:
      "https://fooko.suarrest.com/platform/Default.aspx?gameid=soccerXDesktop&languagecode=en&applicationid=163&productId=37241&brand=MGA_demo&username=demo&password=demo&host=desktop",
    mobileUrl:
      "https://fooko.suarrest.com/platform/Default.aspx?gameid=soccerXDesktop&languagecode=en&applicationid=163&productId=37241&brand=MGA_demo&username=demo&password=demo&host=mobile",
  },
  {
    title: "Break Away Candy",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_breakAwayCandyLinkMerge.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_breakAwayCandyLinkMerge&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_breakAwayCandyLinkMerge&languageCode=en&host=mobile",
  },
  {
    title: "Ultimate Goal Blitz",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_ultimateGoalBlitz.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_ultimateGoalBlitz&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_ultimateGoalBlitz&languageCode=en&host=mobile",
  },
  {
    title: "Wrath of Seth – Split",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/smg_wrathofSethSplit.JPG",
    desktopUrl:
      "https://sfggame.qfconnect.net/as-lobby/demoSession/launch?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnYW1lSWQiOiIxMzIwIiwibGFuZ0NvZGUiOiJlbiIsImF1ZCI6Ii9kZW1vU2Vzc2lvbi9sYXVuY2giLCJleHAiOjE3ODA4NDE2NzUsImlhdCI6MTc4MDgzODA3NSwibmJmIjoxNzgwODM4MDc1fQ.D6PoVxqh2912ElbNEZaAwlm7xEzkDCRJlHXMIKpXI3c",
    mobileUrl:
      "https://sfggame.qfconnect.net/as-lobby/demoSession/launch?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnYW1lSWQiOiIxMzIwIiwibGFuZ0NvZGUiOiJlbiIsImF1ZCI6Ii9kZW1vU2Vzc2lvbi9sYXVuY2giLCJleHAiOjE3ODA4NDE2NzUsImlhdCI6MTc4MDgzODA3NSwibmJmIjoxNzgwODM4MDc1fQ.D6PoVxqh2912ElbNEZaAwlm7xEzkDCRJlHXMIKpXI3c",
  },
  {
    title: "123 Soccer",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_123SoccerLinkMerge.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_123SoccerLinkMerge&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_123SoccerLinkMerge&languageCode=en&host=mobile",
  },
  {
    title: "Almighty Zeus Wilds",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_almightyZeusWildsLinkMerge.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_almightyZeusWildsLinkMerge&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_almightyZeusWildsLinkMerge&languageCode=en&host=mobile",
  },
  {
    title: "Lucky Twins Wild",
    imageUrl:
      "https://AIiTGNuAPvSpmLDzUi4pD1vmUiALBQqedVRcnQxjtGA.bithe.net/ImageBuilder/v1/images/en/Square/600x600/SMG_luckyTwinsWildsLinkMerge.JPG",
    desktopUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_luckyTwinsWildsLinkMerge&languageCode=en&host=desktop",
    mobileUrl:
      "https://aiitgnuapvspmldzui4pd1vmuialbqqedvrcnqxjtga.goplaylaunch.com/?gameId=SMG_luckyTwinsWildsLinkMerge&languageCode=en&host=mobile",
  },
];

function checkIsMobile() {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    ) || window.innerWidth < 768
  );
}

export function MicrogamingGameList() {
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
    <section id="microgaming-games" className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-primary">
            Provider Games
          </p>

          <h2 className="text-2xl font-black text-white md:text-3xl">
            Microgaming
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Klik gambar game untuk mulai bermain.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {microgamingGames.map((game) => {
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