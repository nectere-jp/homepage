import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "metadata.privacy" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PrivacyPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const sections = [
    "introduction",
    "collection",
    "usage",
    "management",
    "disclosure",
    "cookies",
    "rights",
    "changes",
    "contact",
  ];

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="pt-32 md:pt-48 pb-16 md:pb-24 max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12 md:mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue mb-5 md:mb-6 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm md:text-base text-text/60">
                {t("lastUpdated")}
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-10 md:space-y-12">
            {sections.map((sectionKey, index) => (
              <ScrollReveal key={sectionKey} delay={0.05 * index}>
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue mb-4 md:mb-6">
                    {t(`sections.${sectionKey}.title`)}
                  </h2>
                  <div className="text-text text-base md:text-lg leading-relaxed whitespace-pre-line">
                    {t(`sections.${sectionKey}.content`)}
                  </div>
                </section>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
