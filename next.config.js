/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {},
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  eslint: {
    dirs: ['app'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
      },
    ],
    formats: ['image/webp'],
  },
};

module.exports = nextConfig;
