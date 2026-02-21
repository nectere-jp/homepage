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
  const t = await getTranslations({ locale, namespace: "metadata.nobilvaTokushoho" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/tokushoho"),
      languages: getAlternatesLanguages("/services/nobilva/tokushoho"),
    },
  };
}

const SECTION_KEYS = [
  "operator",
  "price",
  "otherCharges",
  "delivery",
  "paymentTiming",
  "paymentMethods",
  "validity",
  "returnPolicy",
  "specifiedContract",
  "specialConditions",
] as const;

export default async function NobilvaTokushohoPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "nobilvaTokushoho" });

  return (
    <div className="bg-white min-h-screen text-black">
      <Container>
        <div className="pt-32 md:pt-48 pb-16 md:pb-24 max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12 md:mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-5 md:mb-6 tracking-tight">
                {t("title")}
              </h1>
            </div>
          </ScrollReveal>

          <div className="space-y-10 md:space-y-12">
            {SECTION_KEYS.map((sectionKey, index) => (
              <ScrollReveal key={sectionKey} delay={0.05 * index}>
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">
                    {t(`sections.${sectionKey}.title`)}
                  </h2>
                  <div className="text-black text-base md:text-lg leading-relaxed whitespace-pre-line max-w-none">
                    {sectionKey === "operator" ? (
                      <dl className="grid gap-2 sm:grid-cols-[auto_1fr]">
                        <dt className="font-medium text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.fields.seller")}
                        </dt>
                        <dd className="text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.values.seller")}
                        </dd>
                        <dt className="font-medium text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.fields.responsible")}
                        </dt>
                        <dd className="text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.values.responsible")}
                        </dd>
                        <dt className="font-medium text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.fields.address")}
                        </dt>
                        <dd className="text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.values.address")}
                        </dd>
                        <dt className="font-medium text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.fields.phone")}
                        </dt>
                        <dd className="text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.values.phone")}
                        </dd>
                        <dt className="font-medium text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.fields.email")}
                        </dt>
                        <dd className="sm:border-b sm:border-gray-300 sm:pb-1">
                          <a
                            href={`mailto:${t("sections.operator.values.email")}`}
                            className="text-black hover:underline"
                          >
                            {t("sections.operator.values.email")}
                          </a>
                        </dd>
                        <dt className="font-medium text-black sm:border-b sm:border-gray-300 sm:pb-1">
                          {t("sections.operator.fields.url")}
                        </dt>
                        <dd className="sm:border-b sm:border-gray-300 sm:pb-1">
                          <a
                            href="https://nectere.jp/nobilva"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black hover:underline"
                          >
                            https://nectere.jp/nobilva
                          </a>
                        </dd>
                      </dl>
                    ) : (
                      <div>{t(`sections.${sectionKey}.content`)}</div>
                    )}
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
