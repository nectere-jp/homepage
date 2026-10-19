import type { Metadata } from "next";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";
import { PARENT_FAQ, STUDENT_FAQ, TEAM_FAQ, flattenFaqs } from "./_data";

export const metadata: Metadata = {
  title: "よくあるご質問（FAQ） - Nobilva | Nectere",
  description:
    "Nobilva のサービス内容・料金・申込・解約・進路などに関するよくあるご質問をまとめました。保護者・生徒・チーム関係者向けに分かりやすく回答しています。",
  alternates: {
    canonical: getCanonicalUrl("/services/nobilva/faq"),
    languages: getAlternatesLanguages("/services/nobilva/faq"),
  },
};

// 保護者・生徒・チーム関係者の3タブすべての Q&A をフラット化。
// page.tsx と同じ _data.ts を参照することで、表示と構造化データの乖離を防ぐ。
const allFaqItems = [
  ...flattenFaqs(PARENT_FAQ),
  ...flattenFaqs(STUDENT_FAQ),
  ...flattenFaqs(TEAM_FAQ),
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
