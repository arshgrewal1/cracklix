
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'sssb.punjab.gov.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'punjabpolice.gov.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pspcl.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pspcl.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pstcl.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'highcourtchd.gov.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnbbsr.s3waas.gov.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.pseb.ac.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.markfedpunjab.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.verka.coop',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dte.punjab.gov.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'joinindianarmy.nic.in',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
