'use client';

import { useTranslations, useLocale } from 'next-intl';
import { CTAButton } from './ui/CTAButton';
import { FadeIn } from './animations/FadeIn';
import { ScrollReveal } from './animations/ScrollReveal';

export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center bg-beige">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal delay={0.3}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue mb-6">
              {t('catchphrase')}
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.5}>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.7}>
            <CTAButton href={`/${locale}/#services`} className="text-lg md:text-xl">
              {t('cta')}
            </CTAButton>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
