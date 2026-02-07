/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig = {
  images: {
    domains: [],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "framer-motion",
      "@heroicons/react",
    ],
  },
  async redirects() {
    return [
      {
        source: '/nobilva',
        destination: '/services/nobilva',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
