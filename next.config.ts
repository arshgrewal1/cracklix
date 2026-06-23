import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sssb.punjab.gov.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "punjabpolice.gov.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "joinindianarmy.nic.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.mapsofindia.com",
        pathname: "/**",
      },
    ],
  },

  poweredByHeader: false,
  compress: true,
};

export default withPWA(nextConfig);