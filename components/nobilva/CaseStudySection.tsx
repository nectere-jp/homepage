'use client';

/**
 * CaseStudySection - 指導実績セクション
 */

import { useTranslations } from 'next-intl';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { HiOutlineUser } from 'react-icons/hi';
import { addSoftBreaks } from '@/utils/softBreak';
import { ServiceIconCard } from '@/components/ui/ServiceIconCard';
import { NumberHighlight } from '@/components/ui/NumberHighlight';

interface CaseStudySectionProps {
  cases: any[];
}

export function CaseStudySection({ cases }: CaseStudySectionProps) {
  const t = useTranslations('nobilva');

  return (
    <Section id="case-study" backgroundColor="transparent" className="bg-nobilva-light" padding="md">
      <Container>
        <SectionHeader
          englishTitle="Case Study"
          japaneseTitle={t('caseStudy.title')}
          theme="nobilva"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {cases.map((caseItem: any, index: number) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="bg-white shadow-sm p-6 md:p-8 h-full flex flex-col">
                {/* 生徒情報と指導期間 */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* 左側: 生徒情報 */}
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-blue mb-2">
                        {caseItem.name}
                      </h3>
                      <div className="text-text/70 text-sm">
                        {caseItem.grade}
                        {caseItem.club && ` / ${caseItem.club}`}
                      </div>
                    </div>
                    {/* 右側: 指導期間 */}
                    <div className="flex-shrink-0 md:text-right">
                      <div className="text-text/60 mb-1 text-sm font-medium">指導期間</div>
                      <div className="text-base text-text/70">
                        {(caseItem.period.split(/(\d+ヶ月)/) as string[]).map((part: string, index: number) => {
                          if (/\d+ヶ月/.test(part)) {
                            return (
                              <span key={index} className="text-lg font-semibold text-black">
                                {part}
                              </span>
                            );
                          }
                          return <span key={index}>{part}</span>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 指導内容 */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {caseItem.services.map((service: string, i: number) => (
                      <ServiceIconCard
                        key={i}
                        service={service}
                        variant="case-study"
                        className="w-[calc((100%-1.5rem)/3)]"
                        iconColor="text-nobilva-accent"
                        backgroundColor="bg-nobilva-light/50"
                      />
                    ))}
                  </div>
                </div>

                {/* 指導結果 */}
                <div className="mb-6">
                  <div className="mb-4 flex justify-center">
                    {/* 下向きの矢印 */}
                    <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[30px] border-t-nobilva-accent"></div>
                  </div>
                  <ul className="space-y-2">
                    {caseItem.results.map((result: string, i: number) => (
                      <li key={i} className="flex items-center justify-center text-text/80 text-center">
                        <span className="font-medium">
                          <NumberHighlight 
                            text={result} 
                            highlightClassName="text-2xl md:text-3xl font-bold text-nobilva-accent inline"
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* コメント */}
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <div className="flex gap-3 items-center">
                    {/* 人のアイコン */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                        <HiOutlineUser className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    {/* 吹き出し */}
                    <div className="flex-1 p-4 rounded-none relative">
                      {/* 吹き出しのしっぽ */}
                      <div className="absolute left-0 top-6 -ml-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-transparent"></div>
                      <p className="text-text/80 leading-relaxed">
                        {caseItem.comment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
