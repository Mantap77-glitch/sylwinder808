import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  allowedDevOrigins: [
    "mantap77.local",
    "mantap77.local:3000",
    "http://mantap77.local:3000",
  ],
};


export default nextConfig;
