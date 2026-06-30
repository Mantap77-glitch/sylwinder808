import type { Metadata } from "next";
import { headers } from "next/headers";

import { PublicTopbar } from "@/components/site/public-topbar";
import { FloatingContact } from "@/components/site/floating-contact";
import { PublicFooter } from "@/components/site/public-footer";
import { HomeBannerSlider } from "@/components/site/home-banner-slider";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { GameProviderSection } from "@/components/site/game-provider-section";

type PublicSiteData = {
  success?: boolean;
  message?: string;
  setting?: {
    siteName?: string;
    logoUrl?: string | null;
    whatsappUrl?: string | null;
    telegramUrl?: string | null;
    liveChatUrl?: string | null;
    tenant?: {
      status?: string | null;
    } | null;
    template?: {
      primaryColor?: string | null;
      secondaryColor?: string | null;
      loginBackground?: string | null;
      registerBackground?: string | null;
    } | null;
  };
  banners?: {
    id: string;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    href?: string;
  }[];
};

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

type PublicGamesData = {
  success?: boolean;
  message?: string;
  error?: string;
  games?: ProviderCard[];
  providers?: ProviderCard[];
  data?: ProviderCard[];
  providerGames?: Record<string, ProviderGame[]>;
  allGames?: ProviderGame[];
};

type HomeBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  href?: string | null;
};

const defaultBackgroundClass =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(32,214,181,.22),transparent_30rem),hsl(var(--background))]";

const fallbackGames: ProviderCard[] = [
  {
    id: "provider-pragmatic-play",
    name: "Pragmatic Play",
    slug: "pragmatic-play",
    category: "Slots",
    provider: "PRAGMATIC PLAY",
    imageUrl: "",
    thumbnailUrl: "",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "provider-pg-soft",
    name: "PG Soft",
    slug: "pg-soft",
    category: "Slots",
    provider: "PG SOFT",
    imageUrl: "",
    thumbnailUrl: "",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "provider-hacksaw-gaming",
    name: "Hacksaw Gaming",
    slug: "hacksaw-gaming",
    category: "Slots",
    provider: "HACKSAW GAMING",
    imageUrl: "",
    thumbnailUrl: "",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "provider-microgaming",
    name: "Microgaming",
    slug: "microgaming",
    category: "Slots",
    provider: "MICROGAMING",
    imageUrl: "",
    thumbnailUrl: "",
    isActive: true,
    sortOrder: 4,
  },
];

async function getBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") || "http";

  return `${protocol}://${host}`;
}

async function getPublicSiteData(): Promise<PublicSiteData> {
  try {
    const baseUrl = await getBaseUrl();

    const response = await fetch(`${baseUrl}/api/public/site`, {
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      return {
        success: false,
        message:
          result?.message || result?.error || "Public site tidak ditemukan.",
      };
    }

    return result;
  } catch {
    return {
      success: false,
      message: "Public site tidak dapat dihubungi.",
    };
  }
}

async function getPublicGamesData(): Promise<PublicGamesData | null> {
  try {
    const baseUrl = await getBaseUrl();

    const response = await fetch(`${baseUrl}/api/public/games`, {
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

function getPublicBackground(
  template: PublicSiteData["setting"] extends infer S
    ? S extends { template?: infer T }
      ? T
      : never
    : never
) {
  if (!template || typeof template !== "object") {
    return undefined;
  }

  const primaryColor =
    "primaryColor" in template && typeof template.primaryColor === "string"
      ? template.primaryColor
      : "#14b8a6";

  const secondaryColor =
    "secondaryColor" in template && typeof template.secondaryColor === "string"
      ? template.secondaryColor
      : "#4f46e5";

  const loginBackground =
    "loginBackground" in template && typeof template.loginBackground === "string"
      ? template.loginBackground
      : "";

  if (!loginBackground) return undefined;

  return `radial-gradient(circle at top left, ${primaryColor}55, transparent 32rem), radial-gradient(circle at top right, ${secondaryColor}44, transparent 30rem), ${loginBackground}`;
}

function normalizeHomeBanners(
  banners: PublicSiteData["banners"] | null | undefined
): HomeBanner[] {
  if (!Array.isArray(banners)) return [];

  return banners
    .map((banner, index) => ({
      id: String(banner.id || `banner-${index}`),
      title: banner.title || "Banner",
      subtitle: banner.subtitle || null,
      imageUrl: banner.imageUrl || null,
      href: banner.href || null,
    }))
    .filter((banner) => banner.id);
}

function normalizeProviderCards(result: PublicGamesData | null) {
  const source =
    result?.providers ||
    result?.games ||
    result?.data ||
    fallbackGames;

  return source
    .map((game, index) => ({
      id: String(game.id || `provider-${game.slug || index}`),
      name: game.name || game.provider || game.slug || "Provider",
      slug: game.slug || "",
      category: game.category || "Slots",
      provider: game.provider || game.name || "PROVIDER",
      imageUrl: game.imageUrl || "",
      thumbnailUrl: game.thumbnailUrl || "",
      isActive: game.isActive ?? true,
      sortOrder: Number(game.sortOrder || index + 1),
    }))
    .filter((game) => game.slug && game.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeProviderGames(result: PublicGamesData | null) {
  const rawProviderGames = result?.providerGames;

  if (!rawProviderGames || typeof rawProviderGames !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawProviderGames).map(([providerSlug, games]) => [
      providerSlug,
      Array.isArray(games) ? games : [],
    ])
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const publicSite = await getPublicSiteData();

  const siteName = publicSite.setting?.siteName || "Frontend Website";
  const logoUrl = publicSite.setting?.logoUrl || undefined;

  return {
    title: {
      absolute: siteName,
    },
    description: `${siteName} - Frontend Website`,
    icons: logoUrl
      ? {
          icon: logoUrl,
          shortcut: logoUrl,
          apple: logoUrl,
        }
      : undefined,
  };
}

export default async function LandingPage() {
  const [publicSite, publicGames] = await Promise.all([
    getPublicSiteData(),
    getPublicGamesData(),
  ]);

  if (!publicSite.success || !publicSite.setting) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-black">Domain tidak terdaftar</h1>
          <p className="mt-3 text-slate-300">
            {publicSite.message ||
              "Domain website ini belum terhubung ke client mana pun."}
          </p>
        </div>
      </main>
    );
  }

  if (publicSite.setting.tenant?.status === "INACTIVE") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-black">Website Tidak Aktif</h1>
          <p className="mt-3 text-slate-300">
            Client sedang tidak aktif. Silakan hubungi team support.
          </p>
        </div>
      </main>
    );
  }

  const games = normalizeProviderCards(publicGames);
  const providerGames = normalizeProviderGames(publicGames);

  const siteName = publicSite.setting.siteName || "NAMA";
  const background = getPublicBackground(publicSite.setting.template ?? null);
  const homeBanners = normalizeHomeBanners(publicSite.banners);

  return (
    <main
      className={background ? "min-h-screen" : defaultBackgroundClass}
      style={background ? { background } : undefined}
    >
      <PublicTopbar
        siteName={siteName}
        logoUrl={publicSite.setting.logoUrl}
        isAuthenticated={false}
      />

      <AnnouncementBar siteName={siteName} />

      <FloatingContact
        whatsappUrl={publicSite.setting.whatsappUrl}
        telegramUrl={publicSite.setting.telegramUrl}
      />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <HomeBannerSlider banners={homeBanners} />
      </section>

      <GameProviderSection games={games} providerGames={providerGames} />

      <PublicFooter siteName={siteName} />
    </main>
  );
}