export const API_ENDPOINTS = {
  auth: {
    superLogin: "/api/adm-super/login",
    superMe: "/api/adm-super/me",

    adminLogin: "/api/admin/login",
    adminMe: "/api/admin/me",
  },

  admin: {
    dashboard: "/api/admin/dashboard",
    dashboardChart: "/api/admin/dashboard/chart",

    adminClients: "/api/admin/admin-clients",
    adminClientStatus: "/api/admin/admin-clients/status",

    players: "/api/admin/players",
    playerChangePassword: (id: string | number) =>
      `/api/admin/players/${id}/change-password`,
    playerAdjustment: (id: string | number) =>
      `/api/admin/players/${id}/adjustment`,

    transactions: "/api/admin/transactions",

    deposits: "/api/admin/deposits",
    withdrawals: "/api/admin/withdrawals",

    depositApprove: (id: string | number) => `/api/admin/deposit/${id}/approve`,
    depositReject: (id: string | number) => `/api/admin/deposit/${id}/reject`,

    withdrawalApprove: (id: string | number) =>
      `/api/admin/withdrawal/${id}/approve`,
    withdrawalReject: (id: string | number) =>
      `/api/admin/withdrawal/${id}/reject`,

    banks: "/api/admin/settings/banks",
    bankDetail: (id: string | number) => `/api/admin/settings/banks/${id}`,

    banners: "/api/admin/settings/banners",
    bannerDetail: (id: string | number) => `/api/admin/settings/banners/${id}`,

    brandingSetting: "/api/admin/settings/branding",

    domains: "/api/admin/settings/domain",
    domainPrimary: "/api/admin/settings/domain/primary",

    contactSetting: "/api/admin/settings/contact",

    templateSetting: "/api/admin/settings/template",
    templateReset: "/api/admin/settings/template/reset",

    changePassword: "/api/admin/change-password",
  },

  public: {
    site: "/api/public/site",
    banners: "/api/public/banners",
    paymentTargets: "/api/public/payment-targets",
    games: "/api/public/games",
  },

  player: {
    login: "/api/player/login",
    register: "/api/player/register",
    me: "/api/player/me",
    transactions: "/api/player/transactions",
    deposit: "/api/player/deposit",
    withdraw: "/api/player/withdraw",
  },
} as const;