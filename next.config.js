const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development', // Fix startup noise and potential dev crashes
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use static export for Android builds to keep API routes working on Web/Vercel
  output: process.env.BUILD_TARGET === 'android' ? 'export' : undefined,
  images: {
    unoptimized: true, // Required for static exports/Capacitor
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 300,
  trailingSlash: true,
};

module.exports = withPWA(nextConfig);
