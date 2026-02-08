import type { Metadata } from "next";
import { Noto_Sans_JP, M_PLUS_Rounded_1c } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"], // クリティカルweightのみをpreload（500と900は必要時に読み込まれる）
  variable: "--font-sans",
  display: "swap",
  preload: true,
  subsets: ["latin"],
  adjustFontFallback: true, // フォント読み込み前のレイアウトシフト削減
});
const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-rounded",
  display: "swap",
  preload: false, // Teach Itページとnot-foundページのみで使用されるため、クリティカルパスから除外
  subsets: ["latin"],
  adjustFontFallback: false, // M PLUS Rounded 1cはフォントメトリクスが見つからないためfalseに設定
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  ),
  title: "Nectere",
  description: "Bringing humanity back to technology.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${mPlusRounded.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Fontsへの事前接続 */}
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
