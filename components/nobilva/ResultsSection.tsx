'use client';

import { useTranslations } from 'next-intl';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { HiOutlineTrendingUp } from 'react-icons/hi';

interface ResultsSectionProps {
  results: any[];
}

export function ResultsSection({ results }: ResultsSectionProps) {
  const t = useTranslations('nobilva');

  return (
    <Section id="results" backgroundColor="transparent" className="bg-nobilva-light" padding="md">
      <Container>
        <SectionHeader
          englishTitle="Results"
          japaneseTitle={t('team.title')}
          theme="nobilva"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <ScrollReveal>
            <div className="h-full">
              <h3 className="text-2xl font-bold text-blue mb-6 border-l-4 border-nobilva-main pl-4">
                {t('team.mentors.title')}
              </h3>
              <p className="text-lg text-text/80 leading-relaxed mb-8">
                {t('team.mentors.description')}
              </p>
              <div className="bg-white p-8 shadow-sm">
                <h4 className="text-nobilva-accent font-bold mb-2">{t('team.headCoach.title')}</h4>
                <div className="text-2xl font-bold text-blue mb-1">{t('team.headCoach.name')}</div>
                <div className="text-text/60">{t('team.headCoach.description')}</div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div>
              <h3 className="text-2xl font-bold text-blue mb-6 border-l-4 border-nobilva-main pl-4">
                {t('team.results.title')}
              </h3>
              <div className="space-y-6">
                {results.map((result: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center bg-white p-6 shadow-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-nobilva-main/20 flex items-center justify-center text-nobilva-accent">
                      <HiOutlineTrendingUp className="w-7 h-7" />
                    </div>
                    <p className="text-lg text-blue font-medium whitespace-pre-line">{result}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
