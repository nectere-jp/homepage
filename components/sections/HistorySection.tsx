'use client';

import { useTranslations } from 'next-intl';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BaseCard } from '@/components/ui/BaseCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

interface HistorySectionProps {
  backgroundColor?: 'white' | 'pink-light' | 'beige' | 'transparent';
}

export function HistorySection({ backgroundColor = 'white' }: HistorySectionProps) {
  const t = useTranslations('company');
  const tHistory = useTranslations('company.history');

  const historyItems = [0, 1, 2, 3, 4].map((index) => {
    const date = tHistory(`items.${index}.date`);
    const title = tHistory(`items.${index}.title`);
    const captionKey = `items.${index}.caption`;
    const caption = tHistory(captionKey, { defaultValue: '' });
    const isValidCaption =
      caption &&
      caption.trim() !== '' &&
      !caption.includes('company.history.items.') &&
      caption !== captionKey;
    return {
      date,
      title,
      caption: isValidCaption ? caption : undefined,
    };
  });

  return (
    <Section backgroundColor={backgroundColor} padding="md">
      <Container>
        <SectionHeader
          englishTitle={t('history.title')}
          japaneseTitle={t('history.japaneseTitle')}
        />
        <div className="relative">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-2 md:w-3 bg-pink rounded-full" />
          <div className="space-y-8 md:space-y-10">
            {historyItems.map((item, index) => (
              <ScrollReveal key={index} delay={0.2 + index * 0.1}>
                <div className="relative pl-12 md:pl-20">
                  <div className="absolute left-5 md:left-9 top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-pink border-4 border-white shadow-md" />
                  </div>
                  <p className="text-pink font-semibold text-base md:text-lg mb-1.5 ml-2">
                    {item.date}
                  </p>
                  <BaseCard className="py-4 px-4 md:py-5 md:px-5">
                    <div>
                      <h3 className="text-text font-bold text-lg md:text-xl mb-1.5">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-caption text-sm leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </BaseCard>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
