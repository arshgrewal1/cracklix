import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig: NextConfig = {
  // REMOVED: output: "export" to allow Vercel API routes and dynamic payment gateway.
  // Static exports are incompatible with server-side payment verification.

  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    unoptimized: true,
  },

  poweredByHeader: false,
  compress: true,

  generateBuildId: async () => {
    return `cracklix-prod-${Date.now()}`;
  },
};

export default withPWA(nextConfig);
