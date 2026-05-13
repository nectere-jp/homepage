/**
 * Nobilva メインLP
 *
 * 野球をがんばる中高生のための学習管理サービス「Nobilva」のランディングページ
 * 14セクション構成、日本語ハードコード（多言語非対応）
 */

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/nobilva/HeroSection";
import { EmpathySection } from "@/components/nobilva/EmpathySection";
import { FixedDiagnosisCTA } from "@/components/nobilva/FixedDiagnosisCTA";
import { getAllPosts } from "@/lib/blog";
import { getAlternatesLanguages, getCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";

// 非クリティカルなセクションを動的インポート
const ConcernsSection = dynamic(
  () =>
    import("@/components/nobilva/ConcernsSection").then((mod) => ({
      default: mod.ConcernsSection,
    })),
  { ssr: true, loading: () => null },
);

const ThreePillarsSection = dynamic(
  () =>
    import("@/components/nobilva/ThreePillarsSection").then((mod) => ({
      default: mod.ThreePillarsSection,
    })),
  { ssr: true, loading: () => null },
);

const DayFlowSection = dynamic(
  () =>
    import("@/components/nobilva/DayFlowSection").then((mod) => ({
      default: mod.DayFlowSection,
    })),
  { ssr: true, loading: () => null },
);

const YearRoadmapSection = dynamic(
  () =>
    import("@/components/nobilva/YearRoadmapSection").then((mod) => ({
      default: mod.YearRoadmapSection,
    })),
  { ssr: true, loading: () => null },
);

const ResultsSnippetSection = dynamic(
  () =>
    import("@/components/nobilva/ResultsSnippetSection").then((mod) => ({
      default: mod.ResultsSnippetSection,
    })),
  { ssr: true, loading: () => null },
);

const PricingSection = dynamic(
  () =>
    import("@/components/nobilva/PricingSection").then((mod) => ({
      default: mod.PricingSection,
    })),
  { ssr: true, loading: () => null },
);

const ComparisonSection = dynamic(
  () =>
    import("@/components/nobilva/ComparisonSection").then((mod) => ({
      default: mod.ComparisonSection,
    })),
  { ssr: true, loading: () => null },
);

const CoachMessageSection = dynamic(
  () =>
    import("@/components/nobilva/CoachMessageSection").then((mod) => ({
      default: mod.CoachMessageSection,
    })),
  { ssr: true, loading: () => null },
);

const CareerPathSection = dynamic(
  () =>
    import("@/components/nobilva/CareerPathSection").then((mod) => ({
      default: mod.CareerPathSection,
    })),
  { ssr: true, loading: () => null },
);

const TeamReferralSection = dynamic(
  () =>
    import("@/components/nobilva/TeamReferralSection").then((mod) => ({
      default: mod.TeamReferralSection,
    })),
  { ssr: true, loading: () => null },
);

const FAQExcerptSection = dynamic(
  () =>
    import("@/components/nobilva/FAQExcerptSection").then((mod) => ({
      default: mod.FAQExcerptSection,
    })),
  { ssr: true, loading: () => null },
);

const ArticlesSection = dynamic(
  () =>
    import("@/components/nobilva/ArticlesSection").then((mod) => ({
      default: mod.ArticlesSection,
    })),
  { ssr: true, loading: () => null },
);

const FinalCTASection = dynamic(
  () =>
    import("@/components/nobilva/FinalCTASection").then((mod) => ({
      default: mod.FinalCTASection,
    })),
  { ssr: true, loading: () => null },
);

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      "Nobilva - 野球をがんばる中高生のための学習管理サービス | Nectere",
    description:
      "練習で時間がない、遠征で授業を欠席する、疲れて勉強に手がつかない。野球をがんばる中高生に、日割り学習計画・週1オンライン面談・毎日の進捗確認で伴走します。月18,000円〜、30日全額返金保証。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva"),
      languages: getAlternatesLanguages("/services/nobilva"),
    },
  };
}

export default async function NobilvaPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;

  // Nobilva関連のブログ記事を取得
  const allPosts = await getAllPosts(locale);
  const nobilvaArticles = allPosts.filter(
    (post) => post.relatedBusiness && post.relatedBusiness.includes("nobilva"),
  );

  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー */}
      <HeroSection />

      {/* 固定CTA（デスクトップ右下） */}
      <FixedDiagnosisCTA />

      {/* 2. サービスの背景・スタンス */}
      <EmpathySection />

      {/* 3. 6つの悩み */}
      <ConcernsSection />

      {/* 4. 三本柱 */}
      <ThreePillarsSection />

      {/* 5. ある選手の1日 */}
      <DayFlowSection />

      {/* 6. 実績スニペット */}
      <ResultsSnippetSection />

      {/* 7. 1年間のロードマップ */}
      <YearRoadmapSection />

      {/* 8. 料金プラン */}
      <PricingSection />

      {/* 8. 競合比較 */}
      <ComparisonSection />

      {/* 9. コーチメッセージ */}
      <CoachMessageSection />

      {/* 10. 進路ガイド誘導 */}
      <CareerPathSection />

      {/* 11. チーム導入誘導 */}
      <TeamReferralSection />

      {/* 12. FAQ抜粋 */}
      <FAQExcerptSection />

      {/* 13. お役立ち情報 */}
      <ArticlesSection articles={nobilvaArticles} />

      {/* 14. 最終CTA */}
      <FinalCTASection />
    </div>
  );
}
