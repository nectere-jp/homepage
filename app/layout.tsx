import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, M_PLUS_Rounded_1c } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700", "900"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  subsets: ["latin"],
});
const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
  subsets: ["latin"],
});
const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-rounded",
  display: "swap",
  preload: true,
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
      className={`${notoSansJP.variable} ${notoSerifJP.variable} ${mPlusRounded.variable}`}
    >
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
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
      <body>{children}</body>
    </html>
  );
}
