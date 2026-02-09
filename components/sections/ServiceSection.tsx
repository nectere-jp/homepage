"use client";

import { useTranslations, useLocale } from "next-intl";
import { SectionHeader } from "../ui/SectionHeader";
import { ServiceCard } from "../cards/ServiceCard";
import { Container } from "../layout/Container";

export function ServiceSection() {
  const t = useTranslations("services");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const services = [
    {
      key: "translation",
      href: `/${locale}/services/translation`,
    },
    {
      key: "webDesign",
      href: `/${locale}/services/web-design`,
    },
    {
      key: "print",
      href: `/${locale}/services/print`,
    },
    {
      key: "nobilva",
      href: `/${locale}/services/nobilva`,
    },
    {
      key: "teachit",
      href: `/${locale}/services/teachit`,
    },
  ];

  return (
    <section id="business" className="py-16 md:py-24 bg-pink-light">
      <Container>
        <SectionHeader
          mainTitle={
            locale === "ja" ? tCommon("services") : t("title")
          }
          accentTitle={t("title")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard
              key={service.key}
              title={t(`${service.key}.title`)}
              catchphrase={t(`${service.key}.catchphrase`)}
              description={t(`${service.key}.description`)}
              cta={t(`${service.key}.cta`)}
              href={service.href}
              delay={index * 0.1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
