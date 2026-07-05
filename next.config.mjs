
/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'media.graphassets.com'
    ],
  },
  // PWA configuration
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: !isProd,
    runtimeCaching: [
      // Your runtime caching strategies here
    ],
  },
};

export default withPWA(nextConfig);
