import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig: NextConfig = {
  // Static export is mandatory for high-performance Capacitor/Android builds
  output: 'export',
  
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Static export does not support default Next.js image optimization
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "sssb.punjab.gov.in", pathname: "/**" },
      { protocol: "https", hostname: "punjabpolice.gov.in", pathname: "/**" },
      { protocol: "https", hostname: "joinindianarmy.nic.in", pathname: "/**" },
      { protocol: "https", hostname: "www.mapsofindia.com", pathname: "/**" },
      { protocol: "https", hostname: "highcourtchd.gov.in", pathname: "/**" },
      { protocol: "https", hostname: "i.ibb.co", pathname: "/**" },
      { protocol: "https", hostname: "ibb.co", pathname: "/**" },
    ],
  },

  poweredByHeader: false,
  compress: true,
};

export default withPWA(nextConfig);
