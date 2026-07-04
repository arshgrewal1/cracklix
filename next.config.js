
/** @type {import('next').NextConfig} */

// When building the Capacitor/Android bundle we must emit a static `out/`
// directory (that is what capacitor.config.ts references via `webDir: 'out'`).
const isAndroidBuild = process.env.BUILD_TARGET === 'android';

const nextConfig = {
  reactStrictMode: true,
  // Capacitor requires static export
  output: isAndroidBuild ? 'export' : undefined,
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
