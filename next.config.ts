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

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  poweredByHeader: false,
  compress: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Hardened fallbacks for Node.js modules in client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        dns: false,
        child_process: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        zlib: false,
        'node:async_hooks': false,
        async_hooks: false,
        perf_hooks: false,
      };

      // Explicitly exclude Genkit and Opentelemetry from client-side compilation
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        {
          '@opentelemetry/context-async-hooks': 'commonjs @opentelemetry/context-async-hooks',
          'genkit': 'commonjs genkit',
          '@genkit-ai/google-genai': 'commonjs @genkit-ai/google-genai',
          '@genkit-ai/core': 'commonjs @genkit-ai/core',
          '@genkit-ai/ai': 'commonjs @genkit-ai/ai'
        },
      ];
    }
    return config;
  },
};

export default withPWA(nextConfig);