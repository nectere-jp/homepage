"use client";

import { useTranslations, useLocale } from "next-intl";
import { SectionHeader } from "../ui/SectionHeader";
import { BaseCard } from "../ui/BaseCard";
import { CTAButton } from "../ui/CTAButton";
import { ScrollReveal } from "../animations/ScrollReveal";
import { Container } from "../layout/Container";
import {
  HiOutlineSparkles,
  HiOutlineChatAlt2,
  HiOutlinePhone,
  HiOutlineMail,
} from "react-icons/hi";

export function ContactCTASection() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const inquiryTypes = [
    {
      id: "business",
      icon: HiOutlineSparkles,
      label: t("inquiryTypeLabels.business"),
      description: t("inquiryTypeDescriptions.business"),
    },
    {
      id: "interview",
      icon: HiOutlineChatAlt2,
      label: t("inquiryTypeLabels.interview"),
      description: t("inquiryTypeDescriptions.interview"),
    },
    {
      id: "other",
      icon: HiOutlinePhone,
      label: t("inquiryTypeLabels.other"),
      description: t("inquiryTypeDescriptions.other"),
    },
  ];

  const contactMethods = [
    {
      icon: HiOutlinePhone,
      label: tCommon("phone"),
      value: t("phone"),
      href: `tel:${t("phone").replace(/[^0-9+]/g, "")}`,
    },
    {
      icon: HiOutlineMail,
      label: tCommon("email"),
      value: t("email"),
      href: `mailto:${t("email")}`,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        <SectionHeader
          englishTitle={t("title")}
          japaneseTitle={tCommon("contact")}
        />

        <ScrollReveal delay={0.2}>
          <div className="text-center mb-12">
            <p className="text-lg md:text-xl text-text mb-4">
              {t("detailedMessage")}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink/10 rounded-full">
              <span className="text-sm font-bold text-pink">
                {t("freeConsultation")}
              </span>
              <span className="text-sm text-text">・</span>
              <span className="text-sm text-text">{t("responseTime")}</span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mb-12">
            <h3 className="text-xl md:text-2xl font-bold text-blue mb-6 text-center">
              {t("inquiryCategories")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {inquiryTypes.map((type) => (
                <BaseCard
                  key={type.id}
                  className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-pink/10 rounded-2xl">
                      <type.icon className="w-8 h-8 text-pink" />
                    </div>
                    <h4 className="font-bold text-blue text-base">
                      {type.label}
                    </h4>
                    <p className="text-sm text-text/80">{type.description}</p>
                  </div>
                </BaseCard>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="text-center">
            <CTAButton
              href={`/${locale}/contact`}
              className="text-lg md:text-xl mb-8"
            >
              {t("cta")}
            </CTAButton>

            <div className="flex items-center justify-center gap-6 text-sm text-text/70">
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.href}
                  className="flex items-center gap-2 hover:text-pink transition-colors"
                >
                  <method.icon className="w-4 h-4" />
                  <span>{method.value}</span>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
