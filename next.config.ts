import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'dp-dv-assets.s3.ca-east-tor.io.cloud.ovh.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dp-user-assets.s3.ca-east-tor.io.cloud.ovh.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dp-shop-assets.s3.ca-east-tor.io.cloud.ovh.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.heycafecdn.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
