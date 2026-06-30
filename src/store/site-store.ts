import { create } from "zustand";

export type PublicTemplateSetting = {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  loginBackground?: string | null;
  registerBackground?: string | null;
};

export type PublicSiteSetting = {
  siteName: string;
  logoUrl?: string | null;
  liveChatUrl?: string | null;
  whatsappUrl?: string | null;
  telegramUrl?: string | null;
  email?: string | null;
  activeTemplate?: string;
  template?: PublicTemplateSetting | null;
  tenant?: {
    id?: string | null;
    name?: string | null;
    code?: string | null;
    status?: string | null;
  } | null;
};

type SiteStore = {
  setting: PublicSiteSetting | null;
  setSetting: (setting: PublicSiteSetting) => void;
};

export const useSiteStore = create<SiteStore>((set) => ({
  setting: null,
  setSetting: (setting) => set({ setting }),
}));