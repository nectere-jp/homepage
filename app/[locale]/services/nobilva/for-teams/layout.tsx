import type { Metadata } from "next";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export const metadata: Metadata = {
  title:
    "チーム導入 - Nobilva | Nectere",
  description:
    "リトルシニア・ボーイズ・ポニー・ヤング・高校野球部向けのチーム導入案内。チーム特別価格・紹介手数料制をご用意。監督・運営側の負担はゼロです。",
  alternates: {
    canonical: getCanonicalUrl("/services/nobilva/for-teams"),
    languages: getAlternatesLanguages("/services/nobilva/for-teams"),
  },
};

export default function ForTeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
