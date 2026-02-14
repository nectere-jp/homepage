import Link from "next/link";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700", "900"],
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootNotFound() {
  return (
    <html lang="ja" className={notoSansJP.variable} suppressHydrationWarning>
      <body
        style={{
          fontFamily: "'M PLUS Rounded 1c', system-ui, sans-serif",
          backgroundColor: "#FFF5F6",
          color: "#374151",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div
              style={{
                fontSize: "8rem",
                fontWeight: 900,
                color: "#FA6B82",
                marginBottom: "1.5rem",
                lineHeight: 1,
              }}
            >
              404
            </div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "#374151",
              }}
            >
              ページが見つかりません
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                marginBottom: "2rem",
                lineHeight: 1.6,
              }}
            >
              お探しのページは存在しないか、移動した可能性があります。
            </p>
            <Link
              href="/ja"
              style={{
                display: "inline-block",
                backgroundColor: "#FA6B82",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1.125rem",
                transition: "all 0.3s ease",
              }}
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
