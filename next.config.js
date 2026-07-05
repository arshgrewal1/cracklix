
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // Only trigger static export when explicitly building for Android
  output: process.env.BUILD_TARGET === 'android' ? 'export' : undefined,
  images: {
    unoptimized: true, // Required for static exports/Capacitor
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 300,
};

module.exports = nextConfig;
