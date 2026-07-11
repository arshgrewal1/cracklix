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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 300,
  trailingSlash: true,
  experimental: {
    allowedDevOrigins: [
      '6000-firebase-studio-1780356784378.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev',
      '9000-firebase-studio-1780356784378.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev'
    ]
  }
};

module.exports = withPWA(nextConfig);
