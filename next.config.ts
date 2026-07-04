import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "mantap77.site",
      },
      {
        protocol: "https",
        hostname: "www.mantap77.site",
      },
      {
        protocol: "https",
        hostname: "backend-engine-production-f63f.up.railway.app",
      },
    ],
  },

  allowedDevOrigins: [
    "mantap77.local",
    "mantap77.local:3000",
    "http://mantap77.local:3000",
  ],
};

export default nextConfig;