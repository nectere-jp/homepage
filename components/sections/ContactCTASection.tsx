'use client';

import { useTranslations, useLocale } from 'next-intl';
import { SectionHeader } from '../ui/SectionHeader';
import { BaseCard } from '../ui/BaseCard';
import { CTAButton } from '../ui/CTAButton';
import { ScrollReveal } from '../animations/ScrollReveal';

export function ContactCTASection() {
  const t = useTranslations('contact');
  const locale = useLocale();

  return (
    <section className="py-16 md:py-24 bg-beige">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <SectionHeader>{t('title')}</SectionHeader>
        
        <ScrollReveal delay={0.2}>
          <BaseCard className="text-center">
            <p className="text-lg md:text-xl text-gray-700 mb-6">
              {t('ctaMessage')}
            </p>
            <CTAButton href={`/${locale}/contact`} className="text-lg md:text-xl">
              {t('cta')}
            </CTAButton>
          </BaseCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
