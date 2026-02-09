/**
 * CaseStudySection - 指導実績セクション
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CaseStudyCard } from "./CaseStudyCard";

interface CaseStudySectionProps {
  cases: any[];
  title: string;
}

export function CaseStudySection({ cases, title }: CaseStudySectionProps) {
  return (
    <Section
      id="case-study"
      backgroundColor="transparent"
      className="bg-nobilva-light"
      padding="md"
    >
      <Container>
        <SectionHeader
          englishTitle="Case Study"
          japaneseTitle={title}
          theme="nobilva"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {cases.map((caseItem: any, index: number) => (
            <CaseStudyCard key={index} caseItem={caseItem} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
