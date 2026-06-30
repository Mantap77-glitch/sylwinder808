type PublicFooterProps = {
  siteName: string;
};

const infoCards = [
  "Penyedia slot online dengan beragam pilihan game menarik yang memudahkan pemain untuk mencapai jackpot.",
  "Sportsbook Gaming Platform Terbaik menawarkan lebih banyak game, odds yang lebih tinggi, dan menyediakan pilihan yang lebih banyak untuk pemain.",
  "Platform Pilihan bagi perusahaan-perusahaan terbaik di dunia, dengan pilihan variasi game terbanyak.",
  "Platform togel yang menarik dari perusahan terbaik di dunia yang menawarkan hadiah kemenangan besar.",
];

const providerIcons = [
  "/providers/Pragmatic-play.webp",
  "/providers/PGsoft.webp",
  "/providers/FC.webp",
  "/providers/1.webp",
  "/providers/2.webp",
  "/providers/3.webp",
  "/providers/4.webp",
  "/providers/5.webp",
  "/providers/6.webp",
  "/providers/7.webp",
  "/providers/8.webp",
  "/providers/9.webp",
  "/providers/10.webp",
  "/providers/11.webp",
  "/providers/12.webp",
  "/providers/13.webp",
  "/providers/14.webp",
  "/providers/15.webp",
  "/providers/16.webp",
  "/providers/17.webp",
  "/providers/18.webp",
  "/providers/19.webp",
  "/providers/20.webp",
  "/providers/21.webp",
  "/providers/22.webp",
  "/providers/23.webp",
  "/providers/24.webp",
  "/providers/25.webp",
  "/providers/26.webp",
  "/providers/27.webp",
  "/providers/28.webp",
  "/providers/29.webp",
  "/providers/30.webp",
  "/providers/31.webp",
];

const responsibleIcons = [
  "/responsible/gambling-support-active.png",
  "/responsible/18-plus-active.png",
];

export function PublicFooter({ siteName }: PublicFooterProps) {
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950/80 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <h2 className="text-2xl font-black md:text-3xl">
            {siteName} : Situs Gacor Terlengkap Dengan Bonus Menarik
          </h2>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {infoCards.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75 shadow-soft backdrop-blur"
            >
              {item}
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-primary">
            Platform Penyedia Layanan
          </span>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft backdrop-blur">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {providerIcons.map((icon, index) => (
                <div
                  key={index}
                  className="grid h-16 place-items-center rounded-xl border border-white/10 bg-white/5 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={icon}
                    alt={`Provider ${index + 1}`}
                    className="max-h-10 max-w-full object-contain opacity-90"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
            Tanggung Jawab Bermain
          </h3>

          <div className="flex flex-wrap gap-3">
            {responsibleIcons.map((icon, index) => (
              <div
                key={index}
                className="grid h-14 w-24 place-items-center rounded-xl border border-white/10 bg-white/5 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={icon}
                  alt={`Tanggung jawab bermain ${index + 1}`}
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 pt-6 text-center text-sm text-white/55">
          ©2026 {siteName}. Hak cipta dilindungi | 18+
        </section>
      </div>
    </footer>
  );
}