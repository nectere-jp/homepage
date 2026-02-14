import { getTranslations, getMessages } from "next-intl/server";
import { HeroSection } from "@/components/teachit/HeroSection";
import { MessageSection } from "@/components/teachit/MessageSection";
import { FeaturesSection } from "@/components/teachit/FeaturesSection";
import { FlowSection } from "@/components/teachit/FlowSection";
import { FAQSection } from "@/components/teachit/FAQSection";
import { ContactSection } from "@/components/teachit/ContactSection";
import { FixedCTAButton } from "@/components/teachit/FixedCTAButton";
import { getAlternatesLanguages } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "metadata.teachit" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { languages: getAlternatesLanguages("/services/teachit") },
  };
}

export default async function TeachItPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const messages = await getMessages({ locale });
  const teachitMessages = messages.teachit as any;

  // Helper to ensure we have an array from messages
  const getArray = (key: string) => {
    const keys = key.split(".");
    let value: any = teachitMessages;
    for (const k of keys) {
      value = value?.[k];
    }
    if (!value) return [];
    return Array.isArray(value) ? value : Object.values(value);
  };

  const flowItems = getArray("flow.items");
  const faqItems = getArray("faq.items");

  return (
    <div className="bg-teachit-light min-h-screen font-rounded">
      <HeroSection />
      <FixedCTAButton />
      <MessageSection />
      <FeaturesSection />
      <FlowSection flowItems={flowItems} />
      <FAQSection faqItems={faqItems} />
      <ContactSection />
    </div>
  );
}
