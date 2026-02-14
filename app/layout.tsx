import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const VALID_LANGS = ['ja', 'en', 'de'] as const;

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700", "900"], // クリティカルweightのみをpreload（400, 700, 900は使用頻度が高い）
  variable: "--font-sans",
  display: "swap", // フォント読み込み中もテキストを表示
  preload: true,
  subsets: ["latin"], // Next.jsは自動的に日本語文字を含むフォントをダウンロード
  adjustFontFallback: true, // フォント読み込み前のレイアウトシフト削減
  fallback: ["system-ui", "arial"], // フォールバックフォントを指定
});
// M PLUS Rounded 1cはteach itページでのみ使用されるため、app/[locale]/services/teachit/layout.tsxで読み込む

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  ),
  title: "Nectere",
  description: "Bringing humanity back to technology.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const headersList = await headers();
  const locale = headersList.get('x-next-locale') || 'ja';
  const lang = VALID_LANGS.includes(locale as (typeof VALID_LANGS)[number]) ? locale : 'ja';

  return (
    <html
      lang={lang}
      className={notoSansJP.variable}
      suppressHydrationWarning
    >
      <head>
        {/* 自サイトのドメインへの事前接続（フォントファイルが自サイトから提供されるため） */}
        <link rel="preconnect" href="https://www.nectere.jp" />
        <link rel="dns-prefetch" href="https://www.nectere.jp" />
        {/* Google Fontsへの事前接続（Next.jsがフォントをダウンロードする際に使用） */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
