import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getAlternatesLanguages, getCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "metadata.terms" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: getCanonicalUrl("/terms"), languages: getAlternatesLanguages("/terms") },
  };
}

export default async function TermsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "terms" });

  const sections = [
    "preamble",
    "article_1",
    "article_2",
    "article_3",
    "article_4",
    "article_5",
    "article_6",
    "article_7",
    "article_8",
    "article_9",
    "article_10",
    "article_11",
    "article_12",
    "article_13",
    "article_14",
    "article_15",
    "article_16",
    "article_17",
    "article_18",
    "article_19",
    "article_20",
    "article_21",
    "article_22",
    "article_23",
    "article_24",
    "article_25",
    "article_26",
    "article_27",
    "article_28",
    "article_29",
    "article_30",
    "article_31",
    "enacted",
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
            {sections.map((sectionKey, index) => {
              const sectionTitle = t(`sections.${sectionKey}.title`);
              return (
                <ScrollReveal key={sectionKey} delay={0.05 * index}>
                  <section>
                    {sectionTitle ? (
                      <h2 className="text-2xl md:text-3xl font-bold text-blue mb-4 md:mb-6">
                        {sectionTitle}
                      </h2>
                    ) : null}
                    <div className="text-text text-base md:text-lg leading-relaxed whitespace-pre-line">
                      {t(`sections.${sectionKey}.content`)}
                    </div>
                  </section>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
