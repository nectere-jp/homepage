/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig = {
  images: {
    domains: [],
  },
  compiler: {
    // 開発環境ではコンソールを保持してエラーデバッグを容易にする
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error', 'warn'],
    } : false,
    // React Compiler を有効化してリフローを削減
    reactRemoveProperties: process.env.NODE_ENV === "production" ? { properties: ['^data-test'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "framer-motion",
      "@heroicons/react",
    ],
    // CSSチャンクの最適化
    optimizeCss: true,
    // スクロールの復元を最適化
    scrollRestoration: true,
  },
  // 本番環境でのReactエラーを詳細表示
  reactStrictMode: true,
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
