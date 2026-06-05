
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
        hostname: 'pspcl.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pstcl.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'highcourtchd.gov.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.pseb.ac.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pstet.pseb.ac.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.punjabteched.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'joinindianarmy.nic.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.indianarmy.nic.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnbbsr.s3waas.gov.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.mapsofindia.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
