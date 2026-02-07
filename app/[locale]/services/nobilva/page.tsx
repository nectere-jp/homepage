import { getTranslations, getMessages } from "next-intl/server";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/nobilva/HeroSection";
import { MessageSection } from "@/components/nobilva/MessageSection";
import { PricingSection } from "@/components/nobilva/PricingSection";
import { FlowSection } from "@/components/nobilva/FlowSection";
import { ContactSection } from "@/components/nobilva/ContactSection";
import { FixedCTAButton } from "@/components/nobilva/FixedCTAButton";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

// 非クリティカルなセクションを動的インポート（コード分割）
const ProblemsSection = dynamic(() => import("@/components/nobilva/ProblemsSection").then(mod => ({ default: mod.ProblemsSection })), {
  ssr: true,
  loading: () => null,
});

const FeaturesSection = dynamic(() => import("@/components/nobilva/FeaturesSection").then(mod => ({ default: mod.FeaturesSection })), {
  ssr: true,
  loading: () => null,
});

const CaseStudySection = dynamic(() => import("@/components/nobilva/CaseStudySection").then(mod => ({ default: mod.CaseStudySection })), {
  ssr: true,
  loading: () => null,
});

const FAQSection = dynamic(() => import("@/components/nobilva/FAQSection").then(mod => ({ default: mod.FAQSection })), {
  ssr: true,
  loading: () => null,
});

const ArticlesSection = dynamic(() => import("@/components/nobilva/ArticlesSection").then(mod => ({ default: mod.ArticlesSection })), {
  ssr: true,
  loading: () => null,
});

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

  const plans = getArray("pricing.plans");
  const caseStudies = getArray("caseStudy.cases");
  const individualItems = getValue("flow.individual.items") || [];
  const teamItems = getValue("flow.team.items") || [];
  const faqItems = getArray("faq.items");
  const sports = getArray("heroSports");

  // Get Nobilva-related articles
  const allPosts = await getAllPosts(locale);
  const nobilvaArticles = allPosts.filter(
    (post) => post.relatedBusiness && post.relatedBusiness.includes("nobilva"),
  );

  return (
    <div className="bg-nobilva-light min-h-screen">
      <HeroSection sports={sports} />
      <FixedCTAButton />
      <MessageSection />
      <FeaturesSection />
      <PricingSection plans={plans} />
      <FlowSection individualItems={individualItems} teamItems={teamItems} />
      <ProblemsSection />
      <CaseStudySection cases={caseStudies} />
      <ContactSection />
      <FAQSection faqItems={faqItems} />
      <ArticlesSection articles={nobilvaArticles} />
    </div>
  );
}
