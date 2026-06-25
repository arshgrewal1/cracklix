import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true, // Forces the new service worker to take over immediately
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/, /_next\/static\/chunks\/.*\.map$/],
  reloadOnOnline: true,
});

/**
 * @fileOverview Next.js 15 Configuration.
 * FIXED: Hardened build settings to prevent stale chunk errors and authorized image domains.
 */
const nextConfig: NextConfig = {
  output: 'export',
  
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "i.ibb.co", pathname: "/**" },
      { protocol: "https", hostname: "ibb.co", pathname: "/**" },
    ],
  },

  // Ensures unique build IDs to prevent browser chunk caching issues
  generateBuildId: async () => {
    return `cracklix-prod-${Date.now()}`;
  },

  poweredByHeader: false,
  compress: true,
};

export default withPWA(nextConfig);
