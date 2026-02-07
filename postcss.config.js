module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Tailwind CSS v3+ はJITモードで自動的に未使用CSSを削除するため、
    // PurgeCSSは不要。本番環境ではcssnanoでさらに最適化
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          minifyFontValues: true,
          minifySelectors: true,
          // CSSの重複を削除
          mergeRules: true,
          // 未使用のキーフレームを削除
          discardUnused: true,
          // 空のルールを削除
          discardEmpty: true,
        }],
      },
    } : {}),
  },
};
