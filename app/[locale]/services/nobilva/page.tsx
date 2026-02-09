/**
 * Nobilvaサービスページ
 *
 * スポーツ選手向けの学習サポートサービス「Nobilva」のランディングページ
 * 複数のセクションで構成され、動的インポートによるコード分割を実装
 */

import { getTranslations, getMessages } from "next-intl/server";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/nobilva/HeroSection";
import { MessageSection } from "@/components/nobilva/MessageSection";
import { PricingSection } from "@/components/nobilva/PricingSection";
import { FlowSection } from "@/components/nobilva/FlowSection";
import { ContactSection } from "@/components/nobilva/ContactSection";
import { FixedCTAButtonClient } from "@/components/nobilva/FixedCTAButtonClient";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import {
  getArray,
  getValue,
  getString,
} from "@/components/nobilva/utils/dataHelpers";
import {
  transformFeatureItems,
  transformProblemItems,
  transformHeroTitle,
  transformHeroPrice,
  transformHeroBenefits,
} from "@/components/nobilva/utils/transformData";

// 非クリティカルなセクションを動的インポート（コード分割）
const ProblemsSection = dynamic(
  () =>
    import("@/components/nobilva/ProblemsSection").then((mod) => ({
      default: mod.ProblemsSection,
    })),
  {
    ssr: true,
    loading: () => null,
  },
);

const FeaturesSection = dynamic(
  () =>
    import("@/components/nobilva/FeaturesSection").then((mod) => ({
      default: mod.FeaturesSection,
    })),
  {
    ssr: true,
    loading: () => null,
  },
);

const CaseStudySection = dynamic(
  () =>
    import("@/components/nobilva/CaseStudySection").then((mod) => ({
      default: mod.CaseStudySection,
    })),
  {
    ssr: true,
    loading: () => null,
  },
);

const FAQSection = dynamic(
  () =>
    import("@/components/nobilva/FAQSection").then((mod) => ({
      default: mod.FAQSection,
    })),
  {
    ssr: true,
    loading: () => null,
  },
);

const ArticlesSection = dynamic(
  () =>
    import("@/components/nobilva/ArticlesSection").then((mod) => ({
      default: mod.ArticlesSection,
    })),
  {
    ssr: true,
    loading: () => null,
  },
);

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "metadata.nobilva" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function NobilvaPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const messages = await getMessages({ locale });
  const nobilvaMessages = messages.nobilva as any;

  // メッセージデータから各種データを取得・変換
  const plans = getArray(nobilvaMessages, "pricing.plans");
  const caseStudies = getArray(nobilvaMessages, "caseStudy.cases");
  const individualItems =
    getValue(nobilvaMessages, "flow.individual.items") || [];
  const teamItems = getValue(nobilvaMessages, "flow.team.items") || [];
  const faqItems = getArray(nobilvaMessages, "faq.items");
  const sports = getArray(nobilvaMessages, "heroSports");

  // データ変換関数を使用して構造化データを生成
  const featureItems = transformFeatureItems(nobilvaMessages);
  const problemItems = transformProblemItems(nobilvaMessages);
  const heroTitle = transformHeroTitle(nobilvaMessages);
  const heroPrice = transformHeroPrice(nobilvaMessages);
  const heroBenefits = transformHeroBenefits(nobilvaMessages);

  // Nobilva関連のブログ記事を取得
  const allPosts = await getAllPosts(locale);
  const nobilvaArticles = allPosts.filter(
    (post) => post.relatedBusiness && post.relatedBusiness.includes("nobilva"),
  );

  return (
    <div className="bg-nobilva-light min-h-screen">
      <HeroSection
        sports={sports}
        isJapanese={locale === "ja"}
        heroTitle={heroTitle}
        heroPrice={heroPrice}
        heroBadgeText={getString(nobilvaMessages, "hero.badge.text")}
        heroBenefits={heroBenefits}
        heroCtaMain={getString(nobilvaMessages, "hero.cta.main")}
        heroCtaLine={getString(nobilvaMessages, "hero.cta.line")}
        heroImageAlt={getString(nobilvaMessages, "hero.imageAlt")}
      />
      <FixedCTAButtonClient
        label={getString(nobilvaMessages, "hero.ctaButton")}
        isJapanese={locale === "ja"}
      />
      <MessageSection
        title={getString(nobilvaMessages, "title")}
        subtitle={getString(nobilvaMessages, "subtitle")}
        description={getString(nobilvaMessages, "description")}
        titleHighlight={getValue(nobilvaMessages, "titleHighlight")}
        subtitleHighlight={getValue(nobilvaMessages, "subtitleHighlight")}
        descriptionHighlight={getValue(nobilvaMessages, "descriptionHighlight")}
      />
      <FeaturesSection
        title={getString(nobilvaMessages, "features.title")}
        mainTitle={
          locale === "ja"
            ? getString(nobilvaMessages, "features.title")
            : getString(nobilvaMessages, "sections.solution")
        }
        items={featureItems}
      />
      <PricingSection
        plans={plans}
        title={getString(nobilvaMessages, "pricing.title")}
        mainTitle={
          locale === "ja"
            ? getString(nobilvaMessages, "pricing.title")
            : getString(nobilvaMessages, "sections.pricing")
        }
        optionName={getString(nobilvaMessages, "pricing.option.name")}
        optionDescription={getString(
          nobilvaMessages,
          "pricing.option.description",
        )}
        optionPriceVaries={getString(
          nobilvaMessages,
          "pricing.option.priceVaries",
        )}
        lineCtaButton={getString(nobilvaMessages, "pricing.lineCtaButton")}
        recommendedText={getString(nobilvaMessages, "pricing.recommended")}
      />
      <FlowSection
        individualItems={individualItems}
        teamItems={teamItems}
        title={getString(nobilvaMessages, "flow.title")}
        mainTitle={
          locale === "ja"
            ? getString(nobilvaMessages, "flow.title")
            : getString(nobilvaMessages, "sections.flow")
        }
        individualTitle={getString(nobilvaMessages, "flow.individual.title")}
        teamTitle={getString(nobilvaMessages, "flow.team.title")}
        lineButtonLabel={getString(nobilvaMessages, "flow.lineButton")}
        optionalText={getString(nobilvaMessages, "flow.optional")}
        lineQRCodeAlt={getString(nobilvaMessages, "lineQRCode.alt")}
      />
      <ProblemsSection
        title={getString(nobilvaMessages, "problems.title")}
        mainTitle={
          locale === "ja"
            ? getString(nobilvaMessages, "problems.title")
            : getString(nobilvaMessages, "sections.problems")
        }
        items={problemItems}
      />
      <CaseStudySection
        cases={caseStudies}
        title={getString(nobilvaMessages, "caseStudy.title")}
        mainTitle={
          locale === "ja"
            ? getString(nobilvaMessages, "caseStudy.title")
            : getString(nobilvaMessages, "sections.caseStudy")
        }
        periodLabel={getString(nobilvaMessages, "caseStudy.periodLabel")}
      />
      <ContactSection
        ctaMain={getString(nobilvaMessages, "hero.cta.main")}
        ctaLine={getString(nobilvaMessages, "hero.cta.line")}
      />
      <FAQSection
        faqItems={faqItems}
        title={getString(nobilvaMessages, "faq.title")}
        mainTitle={
          locale === "ja"
            ? getString(nobilvaMessages, "faq.title")
            : getString(nobilvaMessages, "sections.faq")
        }
        teamOnlyBadge={getString(nobilvaMessages, "faq.teamOnlyBadge")}
      />
      <ArticlesSection
        articles={nobilvaArticles}
        title={getString(nobilvaMessages, "articles.title")}
        mainTitle={
          locale === "ja"
            ? getString(nobilvaMessages, "articles.title")
            : getString(nobilvaMessages, "sections.articles")
        }
        viewAllLabel={getString(nobilvaMessages, "articles.viewAll")}
        noArticlesLabel={getString(nobilvaMessages, "articles.noArticles")}
        locale={locale}
      />
    </div>
  );
}
