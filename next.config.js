/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sssb.punjab.gov.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "punjabpolice.gov.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "joinindianarmy.nic.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.mapsofindia.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
