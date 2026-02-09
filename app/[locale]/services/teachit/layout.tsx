import { M_PLUS_Rounded_1c } from "next/font/google";

// Teach Itページでのみ使用されるフォントを読み込む
const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "700", "900"], // 使用頻度の高いweightのみを読み込む
  variable: "--font-rounded",
  display: "swap",
  preload: false, // Teach Itページのみで使用されるため、クリティカルパスから除外
  subsets: ["latin"],
  adjustFontFallback: false, // M PLUS Rounded 1cはフォントメトリクスが見つからないためfalseに設定
});

export default function TeachItLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={mPlusRounded.variable}>
      {children}
    </div>
  );
}
