import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { serverApi } from "@/lib/api/server-api";
import { PublicTopbar } from "@/components/site/public-topbar";
import { GameProviderSection } from "@/components/site/game-provider-section";
import { HomeBannerSlider } from "@/components/site/home-banner-slider";
import { FloatingContact } from "@/components/site/floating-contact";
import { PublicFooter } from "@/components/site/public-footer";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { JackpotPlayCard } from "@/components/site/jackpot-play-card";
import { SlotWinnerCard } from "@/components/site/slot-winner-card";

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
      id?: string | null;
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

type PlayerMeResponse = {
  success?: boolean;
  player?: {
    id?: string | number;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    wallet?: {
      balance?: number | string | null;
      loyaltyPoint?: number | string | null;
    } | null;
    bankAccount?: unknown;
    tenant?: unknown;
  } | null;
};

type PlayerUser = {
  username: string;
  balance: string;
  loyaltyPoint: string;
  level: string;
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

async function getTenantHost() {
  const headerStore = await headers();
  const requestHost =
    headerStore.get("x-forwarded-host") || headerStore.get("host") || "";

  return process.env.PUBLIC_TENANT_HOST || requestHost;
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

function makePublicHeaders(tenantHost: string) {
  return {
    host: tenantHost,
    "x-forwarded-host": tenantHost,
    "x-tenant-host": tenantHost,
    "x-public-domain": tenantHost,
  };
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

async function getPlayerMe(token: string): Promise<PlayerMeResponse | null> {
  try {
    const tenantHost = await getTenantHost();

    return await serverApi<PlayerMeResponse>(API_ENDPOINTS.player.me, {
      method: "GET",
      token,
      headers: makePublicHeaders(tenantHost),
    });
  } catch {
    return null;
  }
}

function formatIDR(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function formatPoint(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function getPlayerLevel(balance: number | string | null | undefined) {
  const amount = Number(balance || 0);

  if (amount >= 10_000_000) return "Diamond";
  if (amount >= 5_000_000) return "Platinum";
  if (amount >= 1_000_000) return "Gold";
  if (amount >= 100_000) return "Silver";

  return "Bronze";
}

function getPlayerUser(
  playerMe: PlayerMeResponse | null,
  fallbackUsername: string
): PlayerUser {
  const player = playerMe?.player;
  const balance = player?.wallet?.balance ?? 0;
  const loyaltyPoint = player?.wallet?.loyaltyPoint ?? 0;

  return {
    username: player?.username || fallbackUsername,
    balance: formatIDR(balance),
    loyaltyPoint: formatPoint(loyaltyPoint),
    level: getPlayerLevel(balance),
  };
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

export default async function HomePage() {
  const cookieStore = await cookies();

  const playerToken = cookieStore.get("player_token")?.value;
  const playerSession = cookieStore.get("player_session")?.value;

  if (!playerToken || !playerSession) {
    redirect("/");
  }

  const [publicSite, playerMe, publicGames] = await Promise.all([
    getPublicSiteData(),
    getPlayerMe(playerToken),
    getPublicGamesData(),
  ]);

  if (!playerMe?.success || !playerMe.player) {
    redirect("/");
  }

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
  const playerUser = getPlayerUser(playerMe, playerSession);

  return (
    <main
      className={background ? "min-h-screen" : "min-h-screen"}
      style={background ? { background } : undefined}
    >
      <PublicTopbar
        siteName={siteName}
        logoUrl={publicSite.setting.logoUrl}
        isAuthenticated
        user={playerUser}
      />

      <AnnouncementBar siteName={siteName} />

      <FloatingContact
        whatsappUrl={publicSite.setting.whatsappUrl}
        telegramUrl={publicSite.setting.telegramUrl}
      />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,.6fr)]">
          <HomeBannerSlider banners={homeBanners} className="lg:h-full" />

          <div className="grid min-w-0 gap-4 lg:grid-rows-2">
            <JackpotPlayCard />
            <SlotWinnerCard />
          </div>
        </div>
      </section>

      <GameProviderSection
        games={games}
        providerGames={providerGames}
        isAuthenticated
      />

      <PublicFooter siteName={siteName} />
    </main>
  );
}