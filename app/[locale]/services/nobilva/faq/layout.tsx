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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Nobilva はどんなサービスですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "野球をがんばる中高生のための、オンライン学習管理サービスです。「日割り学習計画」「週1回オンライン面談」「毎日の進捗確認」の3つの仕組みで、練習と勉強の両立をサポートします。",
      },
    },
    {
      "@type": "Question",
      name: "料金プランは何種類ありますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "月額プランは2種類（エッセンシャル 18,000円／ベーシック 26,000円）と、オプションで1対1個別指導があります。どちらのプランも全科目対応・追加料金なしが基本です。",
      },
    },
    {
      "@type": "Question",
      name: "30日全額返金保証の条件は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "入会から30日以内であれば、ご利用いただいた月額料金を全額返金いたします。申し出のみで処理し、理由は問いません。教材費（市販書）は対象外です。",
      },
    },
    {
      "@type": "Question",
      name: "野球以外のスポーツでも利用できますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい。Nobilva は野球をがんばる中高生を主な対象として設計していますが、他のスポーツや部活動に取り組まれている方も歓迎しています。無料学習面談で具体的な状況を伺ったうえで、最適なご提案をします。",
      },
    },
    {
      "@type": "Question",
      name: "解約はいつでもできますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい。月単位でいつでも解約可能です。解約希望月の前月25日までにメールでご連絡ください。違約金は一切ありません。",
      },
    },
    {
      "@type": "Question",
      name: "練習で疲れていても勉強できますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい。メンターが疲労度や体調も考慮して、1日15分から始められる無理のない計画を立てます。短時間でも効果的な学習方法を提案し、徐々に学習時間を増やしていきます。",
      },
    },
    {
      "@type": "Question",
      name: "野球推薦と一般進学、両方の選択肢を残せますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい。Nobilva は「進路は最後まで先送りできる」状態を目指して学習を設計します。週1面談で、推薦基準（評定・英検）と一般受験準備を並行設計します。",
      },
    },
  ],
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
