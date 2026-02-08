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

  // Helper to ensure we have an array from messages
  const getArray = (key: string) => {
    const keys = key.split(".");
    let value: any = nobilvaMessages;
    for (const k of keys) {
      value = value?.[k];
    }
    if (!value) return [];
    return Array.isArray(value) ? value : Object.values(value);
  };

  // Helper to get nested object values
  const getValue = (key: string) => {
    const keys = key.split(".");
    let value: any = nobilvaMessages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  const getString = (key: string) => {
    const value = getValue(key);
    if (typeof value === "string") return value;
    if (value == null) return "";
    return String(value);
  };

  const plans = getArray("pricing.plans");
  const caseStudies = getArray("caseStudy.cases");
  const individualItems = getValue("flow.individual.items") || [];
  const teamItems = getValue("flow.team.items") || [];
  const faqItems = getArray("faq.items");
  const sports = getArray("heroSports");
  const featureItems = getArray("features.items").map(
    (item: any, index: number) => ({
      title: item?.title ?? getString(`features.items.${index}.title`),
      description:
        item?.description ?? getString(`features.items.${index}.description`),
      image: `/images/nobilva/features-point${index + 1}.svg`,
    }),
  );
  const problemItems = getArray("problems.items").map(
    (item: any, index: number) => ({
      problem: item?.problem ?? getString(`problems.items.${index}.problem`),
      description:
        item?.description ?? getString(`problems.items.${index}.description`),
      solution: item?.solution ?? getString(`problems.items.${index}.solution`),
      solutionDescription:
        item?.solutionDescription ??
        getString(`problems.items.${index}.solutionDescription`),
      image: `/images/nobilva/problems-${index + 1}.svg`,
    }),
  );
  const heroTitle = {
    prefix: getString("hero.title.prefix"),
    suffix: getString("hero.title.suffix"),
    service: getString("hero.title.service"),
  };
  const heroPrice = {
    label: getString("hero.price.label"),
    amount: getString("hero.price.amount"),
    currency: getString("hero.price.currency"),
    from: getString("hero.price.from"),
    note: getString("hero.price.note"),
  };
  const heroBenefits = {
    weekly: getString("hero.benefits.weekly"),
    chat: getString("hero.benefits.chat"),
    tutoring: getString("hero.benefits.tutoring"),
  };

  // Get Nobilva-related articles
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
        heroBadgeText={getString("hero.badge.text")}
        heroBenefits={heroBenefits}
        heroCtaMain={getString("hero.cta.main")}
        heroCtaLine={getString("hero.cta.line")}
        heroImageAlt={getString("hero.imageAlt")}
      />
      <FixedCTAButtonClient
        label={getString("hero.ctaButton")}
        isJapanese={locale === "ja"}
      />
      <MessageSection
        title={getString("title")}
        subtitle={getString("subtitle")}
        description={getString("description")}
        titleHighlight={getValue("titleHighlight")}
        subtitleHighlight={getValue("subtitleHighlight")}
        descriptionHighlight={getValue("descriptionHighlight")}
      />
      <FeaturesSection
        title={getString("features.title")}
        items={featureItems}
      />
      <PricingSection
        plans={plans}
        title={getString("pricing.title")}
        optionName={getString("pricing.option.name")}
        optionDescription={getString("pricing.option.description")}
      />
      <FlowSection
        individualItems={individualItems}
        teamItems={teamItems}
        title={getString("flow.title")}
        individualTitle={getString("flow.individual.title")}
        teamTitle={getString("flow.team.title")}
        lineButtonLabel={getString("flow.lineButton")}
      />
      <ProblemsSection
        title={getString("problems.title")}
        items={problemItems}
      />
      <CaseStudySection
        cases={caseStudies}
        title={getString("caseStudy.title")}
      />
      <ContactSection
        ctaMain={getString("hero.cta.main")}
        ctaLine={getString("hero.cta.line")}
      />
      <FAQSection faqItems={faqItems} title={getString("faq.title")} />
      <ArticlesSection
        articles={nobilvaArticles}
        title={getString("articles.title")}
        viewAllLabel={getString("articles.viewAll")}
        noArticlesLabel={getString("articles.noArticles")}
        locale={locale}
      />
    </div>
  );
}
