/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'node:async_hooks': false,
        'async_hooks': false,
        'perf_hooks': false,
        'fs': false,
        'path': false,
        'crypto': false,
        '@opentelemetry/context-async-hooks': false,
      };
    }

    // Exclude problematic packages from bundling in client builds
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
      {
        '@opentelemetry/context-async-hooks': 'commonjs @opentelemetry/context-async-hooks',
      },
    ];

    // Add loaders for better module handling
    config.module.rules.push({
      test: /node_modules\/@opentelemetry.*\.js$/,
      use: 'null-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
