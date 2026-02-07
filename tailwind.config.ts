import type { Config } from 'tailwindcss';

const config: Config = {
  // JITモードで未使用CSSを自動削除
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './messages/**/*.json',
  ],
  // 未使用のデフォルトカラーを削除
  corePlugins: {
    // 使用していない機能を無効化してCSSサイズを削減
    preflight: true,
  },
  theme: {
    // Tailwindのデフォルトカラーを保持しつつ、カスタムカラーを追加
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FA6B82',
          dark: '#E85A6F',
        },
        pink: {
          DEFAULT: '#FA6B82',
          dark: '#E85A6F',
        },
        blue: {
          DEFAULT: '#316F94',
        },
        beige: {
          DEFAULT: '#ECD9CD',
        },
        'pink-light': {
          DEFAULT: 'rgb(255, 245, 246)',
        },
        nobilva: {
          main: '#f6ce4a',
          accent: '#ea5614',
          light: '#fef9e7',
        },
        teachit: {
          main: '#3B82F6',
          accent: '#FB8500',
          light: '#F0F9FF',
        },
        line: {
          DEFAULT: '#06C755',
        },
        text: {
          DEFAULT: '#374151', // 通常のテキスト用の絶妙なグレー
        },
        caption: {
          DEFAULT: '#9ca3af', // キャプション用の薄いグレー
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        rounded: ['var(--font-rounded)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        heavy: '900',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 20px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
export default config;
