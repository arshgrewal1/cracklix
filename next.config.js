
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_TARGET === 'android' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  compress: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        '@opentelemetry/exporter-jaeger': false,
        '@opentelemetry/sdk-trace-node': false,
        '@opentelemetry/sdk-node': false,
        '@opentelemetry/api': false,
        '@opentelemetry/sdk-trace-base': false,
      };
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
