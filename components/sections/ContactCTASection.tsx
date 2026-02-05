'use client';

import { useTranslations, useLocale } from 'next-intl';
import { SectionHeader } from '../ui/SectionHeader';
import { BaseCard } from '../ui/BaseCard';
import { CTAButton } from '../ui/CTAButton';
import { ScrollReveal } from '../animations/ScrollReveal';
import { Container } from '../layout/Container';

export function ContactCTASection() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <section className="py-16 md:py-24 bg-pink-light">
      <Container>
        <SectionHeader englishTitle={t('title')} japaneseTitle={tCommon('contact')} />
        
        <ScrollReveal delay={0.2}>
          <BaseCard className="text-center">
            <p className="text-lg md:text-xl text-text mb-6">
              {t('ctaMessage')}
            </p>
            <CTAButton href={`/${locale}/contact`} className="text-lg md:text-xl">
              {t('cta')}
            </CTAButton>
          </BaseCard>
        </ScrollReveal>
      </Container>
    </section>
  );
}
