'use client';

import { useTranslations, useLocale } from 'next-intl';
import { SectionHeader } from '../ui/SectionHeader';
import { ServiceCard } from '../cards/ServiceCard';

export function ServiceSection() {
  const t = useTranslations('services');
  const locale = useLocale();

  const services = [
    {
      key: 'translation',
      href: `/${locale}/services/translation`,
    },
    {
      key: 'webDesign',
      href: `/${locale}/services/web-design`,
    },
    {
      key: 'print',
      href: `/${locale}/services/print`,
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-beige">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <SectionHeader>{t('title')}</SectionHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.key}
              title={t(`${service.key}.title`)}
              description={t(`${service.key}.description`)}
              cta={t(`${service.key}.cta`)}
              href={service.href}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
