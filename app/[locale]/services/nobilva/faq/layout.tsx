import type { Metadata } from "next";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export const metadata: Metadata = {
  title: "よくあるご質問（FAQ） - Nobilva | Nectere",
  description:
    "Nobilva のサービス内容・料金・申込・解約・進路などに関するよくあるご質問をまとめました。保護者・生徒・チーム関係者向けに分かりやすく回答しています。",
  alternates: {
    canonical: getCanonicalUrl("/services/nobilva/faq"),
    languages: getAlternatesLanguages("/services/nobilva/faq"),
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
