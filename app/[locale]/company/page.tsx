import { getTranslations } from "next-intl/server";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BaseCard } from "@/components/ui/BaseCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { HistorySection } from "@/components/sections/HistorySection";
import { HiBuildingOffice2, HiUser, HiPhone, HiMapPin } from "react-icons/hi2";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "metadata.company" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CompanyPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "company" });
  const tInfo = await getTranslations({ locale, namespace: "company.info" });
  const tValues = await getTranslations({
    locale,
    namespace: "company.values",
  });

  const values = [0, 1, 2, 3].map((index) => ({
    title: tValues(`items.${index}.title`),
    description: tValues(`items.${index}.description`),
  }));

  return (
    <div className="bg-pink-light min-h-screen">
      {/* Hero Section */}
      <Section
        backgroundColor="white"
        padding="none"
        className="pt-32 md:pt-48 pb-12 md:pb-16"
      >
        <Container>
          <ScrollReveal>
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue mb-5 md:mb-6 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-text/80 font-light leading-relaxed max-w-2xl mx-auto">
                {t("hero.subtitle")}
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </Section>

      {/* Vision, Mission, Values */}
      <Section id="mission" backgroundColor="pink-light" padding="md">
        <Container>
          <SectionHeader
            englishTitle={t("vision.title")}
            japaneseTitle={t("vision.japaneseTitle")}
            caption={t("vision.caption")}
            className="mb-10 md:mb-14"
          />
          <ScrollReveal delay={0.2}>
            <BaseCard>
              <div className="py-4 md:py-6 px-4 md:px-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-normal text-blue mb-6 text-center font-serif">
                  {t("vision.statement")}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t("vision.description")}
                </p>
              </div>
            </BaseCard>
          </ScrollReveal>
        </Container>
      </Section>

      <Section backgroundColor="white" padding="md">
        <Container>
          <SectionHeader
            englishTitle={t("mission.title")}
            japaneseTitle={t("mission.japaneseTitle")}
            caption={t("mission.caption")}
            className="mb-10 md:mb-14"
          />
          <ScrollReveal delay={0.2}>
            <BaseCard>
              <div className="py-4 md:py-6 px-4 md:px-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-normal text-blue mb-6 text-center font-serif">
                  {t("mission.statement")}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t("mission.description")}
                </p>
              </div>
            </BaseCard>
          </ScrollReveal>
        </Container>
      </Section>

      <Section backgroundColor="pink-light" padding="md">
        <Container>
          <SectionHeader
            englishTitle={t("values.title")}
            japaneseTitle={t("values.japaneseTitle")}
            caption={t("values.caption")}
            className="mb-10 md:mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {values.map((value, index) => (
              <ScrollReveal key={index} delay={0.2 + index * 0.1}>
                <BaseCard>
                  <div className="py-3 md:py-4 px-4 md:px-6">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-normal text-blue mb-6 text-center font-serif">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </BaseCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* History, Company Information */}
      <HistorySection backgroundColor="white" showCTA={false} />

      <Section backgroundColor="pink-light" padding="md">
        <Container>
          <SectionHeader
            englishTitle={tInfo("title")}
            japaneseTitle={tInfo("japaneseTitle")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <ScrollReveal delay={0.2}>
              <BaseCard>
                <div className="flex gap-4">
                  <div className="rounded-2xl py-3 md:py-4 px-2 md:px-3 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px]">
                    <HiBuildingOffice2 className="text-pink w-6 h-6 md:w-7 md:h-7 mb-2" />
                    <h3 className="text-pink font-semibold text-xs md:text-sm text-center">
                      {tInfo("tradeName")}
                    </h3>
                  </div>
                  <div className="flex items-center flex-1">
                    <p className="text-text text-lg md:text-xl">
                      {tInfo("tradeNameValue")}
                    </p>
                  </div>
                </div>
              </BaseCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <BaseCard>
                <div className="flex gap-4">
                  <div className="rounded-2xl py-3 md:py-4 px-2 md:px-3 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px]">
                    <HiUser className="text-pink w-6 h-6 md:w-7 md:h-7 mb-2" />
                    <h3 className="text-pink font-semibold text-xs md:text-sm text-center">
                      {tInfo("representative")}
                    </h3>
                  </div>
                  <div className="flex items-center flex-1">
                    <p className="text-text text-lg md:text-xl">
                      {tInfo("representativeValue")}
                    </p>
                  </div>
                </div>
              </BaseCard>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <BaseCard>
                <div className="flex gap-4">
                  <div className="rounded-2xl py-3 md:py-4 px-2 md:px-3 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px]">
                    <HiPhone className="text-pink w-6 h-6 md:w-7 md:h-7 mb-2" />
                    <h3 className="text-pink font-semibold text-xs md:text-sm text-center">
                      {tInfo("phone")}
                    </h3>
                  </div>
                  <div className="flex items-center flex-1">
                    <p className="text-text text-lg md:text-xl">
                      {tInfo("phoneValue")}
                    </p>
                  </div>
                </div>
              </BaseCard>
            </ScrollReveal>
            <ScrollReveal delay={0.5}>
              <BaseCard>
                <div className="flex gap-4">
                  <div className="rounded-2xl py-3 md:py-4 px-2 md:px-3 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px]">
                    <HiMapPin className="text-pink w-6 h-6 md:w-7 md:h-7 mb-2" />
                    <h3 className="text-pink font-semibold text-xs md:text-sm text-center">
                      {tInfo("address")}
                    </h3>
                  </div>
                  <div className="flex items-center flex-1">
                    <p className="text-text text-lg md:text-xl whitespace-pre-line">
                      {tInfo("addressValue")}
                    </p>
                  </div>
                </div>
              </BaseCard>
            </ScrollReveal>
          </div>
        </Container>
      </Section>
    </div>
  );
}
