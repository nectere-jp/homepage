/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

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
    // スクロールの復元を最適化
    scrollRestoration: true,
  },
  // 本番環境でのReactエラーを詳細表示
  reactStrictMode: true,
  // バンドルサイズの最適化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドのバンドル最適化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // 共通のベンダーライブラリを分離
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // framer-motionを別チャンクに分離（まだ使用されている場合）
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // react-iconsを別チャンクに分離
            reactIcons: {
              name: 'react-icons',
              test: /[\\/]node_modules[\\/]react-icons[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // 共通のコンポーネントを分離
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  async redirects() {
    return [
      // 野球外記事（削除済み）→ Nobilva LP へ
      {
        source: '/:locale/blog/soccer-study-balance',
        destination: '/:locale/services/nobilva',
        permanent: true,
      },
      {
        source: '/:locale/blog/basketball-study-balance-junior-high',
        destination: '/:locale/services/nobilva',
        permanent: true,
      },
      {
        source: '/:locale/blog/suisogaku-bu-benkyou-ryouritsu',
        destination: '/:locale/services/nobilva',
        permanent: true,
      },
      // 旧法的ページ → 新 /legal/ 以下へ
      {
        source: '/:locale/privacy',
        destination: '/:locale/legal/privacy-policy',
        permanent: true,
      },
      {
        source: '/:locale/terms',
        destination: '/:locale/legal/nobilva/terms-of-service',
        permanent: true,
      },
      {
        source: '/:locale/services/nobilva/tokushoho',
        destination: '/:locale/legal/nobilva/commercial-disclosure',
        permanent: true,
      },
      {
        source: '/nobilva',
        destination: '/services/nobilva',
        permanent: true,
      },
      // トップの別表記を正規URLへ（SEO・リンク切れ防止）
      {
        source: '/index.html',
        destination: '/ja',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/ja',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
