/** @type {import('next').NextConfig} */

// When building the Capacitor/Android bundle we must emit a static `out/`
// directory (that is what capacitor.config.ts references via `webDir: 'out'`
// and what `npx cap sync android` copies). We only enable static export for
// that build target so the normal server build keeps its API routes
// (Razorpay, coupons, health, etc.) fully functional.
const isAndroidBuild = process.env.BUILD_TARGET === 'android';

const nextConfig = {
  reactStrictMode: true,
  ...(isAndroidBuild ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
