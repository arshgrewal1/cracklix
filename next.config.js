
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // Only use static export for Android builds to keep API routes working on Web/Vercel
  // This resolves the 404 error on /api/razorpay routes when running in production web mode.
  output: process.env.BUILD_TARGET === 'android' ? 'export' : undefined,
  images: {
    unoptimized: true, // Required for static exports/Capacitor
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 300,
};

module.exports = nextConfig;
