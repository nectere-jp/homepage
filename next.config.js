/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig = {
  images: {
    domains: [],
  },
};

module.exports = withNextIntl(nextConfig);
