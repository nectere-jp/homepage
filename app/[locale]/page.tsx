import { Hero } from "@/components/Hero";
import { ServiceSection } from "@/components/sections/ServiceSection";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { HistorySection } from "@/components/sections/HistorySection";
import { NewsSection } from "@/components/sections/NewsSection";
import { getTranslations } from "next-intl/server";
import { getAlternatesLanguages } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { languages: getAlternatesLanguages("") },
  };
}

export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  return (
    <>
      <Hero />
      <ServiceSection />
      <HistorySection />
      <NewsSection locale={locale} />
      <ContactCTASection />
    </>
  );
}
