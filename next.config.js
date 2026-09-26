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
  async rewrites() {
    // /blog/* を [locale=ja]/blog/* に内部書き換え。middleware (proxy.ts) の
    // matcher で /blog を除外しているため、locale prefix redirect には巻き込まれない。
    return {
      beforeFiles: [
        { source: '/blog', destination: '/ja/blog' },
        { source: '/blog/:slug*', destination: '/ja/blog/:slug*' },
      ],
    };
  },
  async redirects() {
    return [
      // 野球外記事（削除済み）→ Nobilva LP へ
      // NOTE: /:locale/blog/* → /blog/* の general redirect より必ず先に評価される必要がある
      {
        source: '/:locale/blog/soccer-study-balance',
        destination: '/ja/services/nobilva',
        permanent: true,
      },
      {
        source: '/:locale/blog/basketball-study-balance-junior-high',
        destination: '/ja/services/nobilva',
        permanent: true,
      },
      {
        source: '/:locale/blog/suisogaku-bu-benkyou-ryouritsu',
        destination: '/ja/services/nobilva',
        permanent: true,
      },
      // locale なしの正規URL版でも同じ削除済み記事は Nobilva LP へ
      {
        source: '/blog/soccer-study-balance',
        destination: '/ja/services/nobilva',
        permanent: true,
      },
      {
        source: '/blog/basketball-study-balance-junior-high',
        destination: '/ja/services/nobilva',
        permanent: true,
      },
      {
        source: '/blog/suisogaku-bu-benkyou-ryouritsu',
        destination: '/ja/services/nobilva',
        permanent: true,
      },
      // /ja/blog/* /en/blog/* /de/blog/* を正規URLの /blog/* に 301
      {
        source: '/:locale(ja|en|de)/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/:locale(ja|en|de)/blog/:slug*',
        destination: '/blog/:slug*',
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
      // Nobilva 廃止サブページ → LP へ
      {
        source: '/:locale/services/nobilva/coach',
        destination: '/:locale/services/nobilva',
        permanent: true,
      },
      {
        source: '/:locale/services/nobilva/results',
        destination: '/:locale/services/nobilva',
        permanent: true,
      },
      {
        source: '/:locale/services/nobilva/pricing',
        destination: '/:locale/services/nobilva',
        permanent: true,
      },
      {
        source: '/:locale/services/nobilva/career-path',
        destination: '/:locale/services/nobilva',
        permanent: true,
      },
      // Nobilva: 英語・ドイツ語 → 日本語（多言語非対応）
      {
        source: '/en/services/nobilva/:path*',
        destination: '/ja/services/nobilva/:path*',
        permanent: true,
      },
      {
        source: '/de/services/nobilva/:path*',
        destination: '/ja/services/nobilva/:path*',
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
