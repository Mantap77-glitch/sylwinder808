import {
  PrismaClient,
  BankType,
  Role,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = "admin123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  /**
   * =========================================================
   * 1. TENANT / CLIENT
   * =========================================================
   */

  const client1 = await prisma.tenant.upsert({
    where: { code: "client_pertama" },
    create: {
      name: "Client Pertama",
      code: "client_pertama",
      status: "ACTIVE",
    },
    update: {
      name: "Client Pertama",
      status: "ACTIVE",
    },
  });

  const client2 = await prisma.tenant.upsert({
    where: { code: "client_kedua" },
    create: {
      name: "Client Kedua",
      code: "client_kedua",
      status: "ACTIVE",
    },
    update: {
      name: "Client Kedua",
      status: "ACTIVE",
    },
  });

  /**
   * =========================================================
   * 2. DOMAIN PER CLIENT
   * =========================================================
   */

  const domains = [
    { tenantId: client1.id, host: "pertama1.xyz", isPrimary: true },
    { tenantId: client1.id, host: "pertama1.top", isPrimary: false },
    { tenantId: client1.id, host: "pertama1.org", isPrimary: false },
    { tenantId: client1.id, host: "pertama1.net", isPrimary: false },

    { tenantId: client2.id, host: "kedua2.xyz", isPrimary: true },
    { tenantId: client2.id, host: "kedua2.top", isPrimary: false },
  ];

  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { host: domain.host },
      create: {
        tenantId: domain.tenantId,
        host: domain.host,
        isPrimary: domain.isPrimary,
        status: "ACTIVE",
      },
      update: {
        tenantId: domain.tenantId,
        isPrimary: domain.isPrimary,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Untuk local development.
   * Nanti bisa kamu tambahkan ke hosts Windows:
   * 127.0.0.1 pertama1.local
   * 127.0.0.1 kedua2.local
   */
  const localDomains = [
    { tenantId: client1.id, host: "pertama1.local", isPrimary: false },
    { tenantId: client2.id, host: "kedua2.local", isPrimary: false },
  ];

  for (const domain of localDomains) {
    await prisma.domain.upsert({
      where: { host: domain.host },
      create: {
        tenantId: domain.tenantId,
        host: domain.host,
        isPrimary: domain.isPrimary,
        status: "ACTIVE",
      },
      update: {
        tenantId: domain.tenantId,
        isPrimary: domain.isPrimary,
        status: "ACTIVE",
      },
    });
  }

  /**
   * =========================================================
   * 3. SITE SETTING PER CLIENT
   * =========================================================
   */

  await prisma.siteSetting.upsert({
    where: { tenantId: client1.id },
    create: {
      tenantId: client1.id,
      siteName: "NAMA CLIENT 1",
      liveChatUrl: "/contact-us",
      whatsappUrl: "https://api.whatsapp.com/send?phone=6280000000000&text=halo",
      telegramUrl: "https://t.me/username_kamu",
      activeTemplate: "default",
      maintenanceMode: false,
    },
    update: {
      siteName: "NAMA CLIENT 1",
      liveChatUrl: "/contact-us",
      whatsappUrl: "https://api.whatsapp.com/send?phone=6280000000000&text=halo",
      telegramUrl: "https://t.me/username_kamu",
      activeTemplate: "default",
      maintenanceMode: false,
    },
  });

  await prisma.siteSetting.upsert({
    where: { tenantId: client2.id },
    create: {
      tenantId: client2.id,
      siteName: "NAMA CLIENT 2",
      liveChatUrl: "/contact-us",
      whatsappUrl: "https://api.whatsapp.com/send?phone=6280000000000&text=halo",
      telegramUrl: "https://t.me/username_kamu",
      activeTemplate: "default",
      maintenanceMode: false,
    },
    update: {
      siteName: "NAMA CLIENT 2",
      liveChatUrl: "/contact-us",
      whatsappUrl: "https://api.whatsapp.com/send?phone=6280000000000&text=halo",
      telegramUrl: "https://t.me/username_kamu",
      activeTemplate: "default",
      maintenanceMode: false,
    },
  });

  /**
   * =========================================================
   * 4. BANK / EWALLET PER CLIENT
   * =========================================================
   */

  const bankMaster = [
    ["BCA", "BCA", BankType.BANK],
    ["BRI", "BRI", BankType.BANK],
    ["Mandiri", "MANDIRI", BankType.BANK],
    ["BNI", "BNI", BankType.BANK],
    ["DANA", "DANA", BankType.EWALLET],
    ["OVO", "OVO", BankType.EWALLET],
    ["GoPay", "GOPAY", BankType.EWALLET],
    ["QRIS", "QRIS", BankType.QRIS],
  ] as const;

  for (const tenant of [client1, client2]) {
    for (const [name, code, type] of bankMaster) {
      await prisma.bank.upsert({
        where: {
          tenantId_code: {
            tenantId: tenant.id,
            code,
          },
        },
        create: {
          tenantId: tenant.id,
          name,
          code,
          type,
          isActive: true,
        },
        update: {
          name,
          type,
          isActive: true,
        },
      });
    }
  }

  /**
   * =========================================================
   * 5. BANNER PER CLIENT
   * =========================================================
   */

  const bannerData = [
    {
      title: "Banner Landing",
      subtitle: "Ganti dari Admin Panel",
      placement: "landing",
      sortOrder: 1,
    },
    {
      title: "Banner Home",
      subtitle: "Beranda setelah login",
      placement: "home",
      sortOrder: 1,
    },
  ];

  for (const tenant of [client1, client2]) {
    for (const banner of bannerData) {
      const existingBanner = await prisma.banner.findFirst({
        where: {
          tenantId: tenant.id,
          title: banner.title,
          placement: banner.placement,
        },
      });

      if (!existingBanner) {
        await prisma.banner.create({
          data: {
            tenantId: tenant.id,
            ...banner,
          },
        });
      }
    }
  }

  /**
   * =========================================================
   * 6. TEMPLATE PER CLIENT
   * =========================================================
   */

  for (const tenant of [client1, client2]) {
    await prisma.template.upsert({
      where: {
        tenantId_key: {
          tenantId: tenant.id,
          key: "default",
        },
      },
      create: {
        tenantId: tenant.id,
        key: "default",
        name: "Default Template",
        isActive: true,
        config: {
          accent: "cyan",
        },
      },
      update: {
        name: "Default Template",
        isActive: true,
        config: {
          accent: "cyan",
        },
      },
    });
  }

  /**
   * =========================================================
   * 7. SUPER ADMIN GLOBAL
   * =========================================================
   *
   * SUPER_ADMIN boleh tenantId null.
   */

const superAdminEmail = process.env.ADMIN_SEED_EMAIL || "admin@example.com";

let superAdmin = await prisma.user.findFirst({
  where: {
    email: superAdminEmail,
    role: Role.SUPER_ADMIN,
  },
});

if (!superAdmin) {
  superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      username: "superadmin",
      role: Role.SUPER_ADMIN,
      isActive: true,
      passwordHash,
    },
  });
} else {
  superAdmin = await prisma.user.update({
    where: {
      id: superAdmin.id,
    },
    data: {
      role: Role.SUPER_ADMIN,
      isActive: true,
      passwordHash,
    },
  });
}

  /**
   * =========================================================
   * 8. ADMIN CLIENT DAN STAFF
   * =========================================================
   */

  const adminClient1 = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: client1.id,
        email: "adminclient1@example.com",
      },
    },
    create: {
      tenantId: client1.id,
      email: "adminclient1@example.com",
      username: "adminclient1",
      role: Role.CLIENT_ADMIN,
      isActive: true,
      passwordHash,
    },
    update: {
      role: Role.CLIENT_ADMIN,
      isActive: true,
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: client1.id,
        email: "subadmin1@example.com",
      },
    },
    create: {
      tenantId: client1.id,
      email: "subadmin1@example.com",
      username: "subadmin1",
      role: Role.STAFF,
      isActive: true,
      passwordHash,
    },
    update: {
      role: Role.STAFF,
      isActive: true,
      passwordHash,
    },
  });

  const adminClient2 = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: client2.id,
        email: "adminclient2@example.com",
      },
    },
    create: {
      tenantId: client2.id,
      email: "adminclient2@example.com",
      username: "adminclient2",
      role: Role.CLIENT_ADMIN,
      isActive: true,
      passwordHash,
    },
    update: {
      role: Role.CLIENT_ADMIN,
      isActive: true,
      passwordHash,
    },
  });

  /**
   * =========================================================
   * 9. PLAYER SAMPLE PER CLIENT
   * =========================================================
   */

  const playerClient1 = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: client1.id,
        email: "player1@example.com",
      },
    },
    create: {
      tenantId: client1.id,
      email: "player1@example.com",
      username: "autowin12",
      role: Role.PLAYER,
      isActive: true,
      passwordHash,
      playerProfile: {
        create: {
          phone: "6280000000000",
          balance: 465.6,
          loyaltyXp: 448215,
          loyaltyPoint: 85408,
        },
      },
    },
    update: {
      role: Role.PLAYER,
      isActive: true,
    },
  });

  const playerClient2 = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: client2.id,
        email: "player2@example.com",
      },
    },
    create: {
      tenantId: client2.id,
      email: "player2@example.com",
      username: "playerclient2",
      role: Role.PLAYER,
      isActive: true,
      passwordHash,
      playerProfile: {
        create: {
          phone: "6281111111111",
          balance: 100000,
          loyaltyXp: 1200,
          loyaltyPoint: 300,
        },
      },
    },
    update: {
      role: Role.PLAYER,
      isActive: true,
    },
  });

  /**
   * =========================================================
   * 10. TRANSACTION SAMPLE PER CLIENT
   * =========================================================
   */

  const existingTrx1 = await prisma.transaction.findFirst({
    where: {
      tenantId: client1.id,
      invoiceNo: "TRX-C1-0001",
    },
  });

  if (!existingTrx1) {
    await prisma.transaction.create({
      data: {
        tenantId: client1.id,
        invoiceNo: "TRX-C1-0001",
        playerId: playerClient1.id,
        adminId: adminClient1.id,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.APPROVED,
        amount: 250000,
      },
    });
  }

  const existingTrx2 = await prisma.transaction.findFirst({
    where: {
      tenantId: client2.id,
      invoiceNo: "TRX-C2-0001",
    },
  });

  if (!existingTrx2) {
    await prisma.transaction.create({
      data: {
        tenantId: client2.id,
        invoiceNo: "TRX-C2-0001",
        playerId: playerClient2.id,
        adminId: adminClient2.id,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        amount: 100000,
      },
    });
  }

  /**
   * =========================================================
   * 11. GAME GLOBAL
   * =========================================================
   */

  const games = [
    "Pragmatic Play",
    "Jili",
    "PG Soft",
    "Live Casino",
    "Arcade",
    "Crash Game",
  ];

  const providerGames = [
  {
    name: "Pragmatic Play",
    slug: "pragmatic-play",
    provider: "Pragmatic Play",
    category: "Provider",
  },
  {
    name: "PG Soft",
    slug: "pg-soft",
    provider: "PG Soft",
    category: "Provider",
  },
  {
    name: "Hacksaw Gaming",
    slug: "hacksaw-gaming",
    provider: "Hacksaw Gaming",
    category: "Provider",
  },
  {
    name: "Microgaming",
    slug: "microgaming",
    provider: "Microgaming",
    category: "Provider",
  },
];

await prisma.game.updateMany({
  where: {
    slug: {
      notIn: providerGames.map((game) => game.slug),
    },
  },
  data: {
    isActive: false,
  },
});

for (const game of providerGames) {
  await prisma.game.upsert({
    where: {
      slug: game.slug,
    },
    create: {
      name: game.name,
      slug: game.slug,
      provider: game.provider,
      category: game.category,
      isActive: true,
    },
    update: {
      name: game.name,
      provider: game.provider,
      category: game.category,
      isActive: true,
    },
  });
}

  /**
   * =========================================================
   * 12. AUDIT LOG SAMPLE
   * =========================================================
   */

  await prisma.auditLog.create({
    data: {
      tenantId: client1.id,
      actorId: superAdmin.id,
      action: "SEED_DATABASE",
      entity: "System",
      metadata: {
        message: "Initial multi-tenant seed data created.",
      },
    },
  });
}

main()
  .then(() => {
    console.log("Seed selesai.");
  })
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });