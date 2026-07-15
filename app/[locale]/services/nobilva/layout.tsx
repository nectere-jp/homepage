import { M_PLUS_Rounded_1c } from "next/font/google";
import { NobilvaTracker } from "@/components/analytics/NobilvaTracker";

// Nobilva の一部要素（チームページのオファーバナー等）で円ゴシックを使うため読み込む
const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["700", "900"],
  variable: "--font-rounded",
  display: "swap",
  preload: false,
  subsets: ["latin"],
  adjustFontFallback: false,
});

export default function NobilvaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={mPlusRounded.variable}>
      <NobilvaTracker />
      {children}
    </div>
  );
}
