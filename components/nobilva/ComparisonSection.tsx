/**
 * ComparisonSection - 他社との比較セクション
 *
 * 学習塾・オンライン個別・Nobilva の比較表と、料金表示の注意ブロックを表示する。
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PricingComparisonTable, type ComparisonRow } from "./PricingComparisonTable";
import { ComparisonCautionBlock } from "./ComparisonCautionBlock";

export interface ComparisonCautionData {
  heading: string;
  paragraph: string;
  items: string[];
}

export interface ComparisonSectionProps {
  mainTitle: string;
  columns: { cramSchoolA: string; onlineB: string; nobilva: string };
  rows: ComparisonRow[];
  caution?: ComparisonCautionData | null;
}

export function ComparisonSection({
  mainTitle,
  columns,
  rows,
  caution,
}: ComparisonSectionProps) {
  return (
    <Section id="comparison" backgroundColor="white" padding="md">
      <Container>
        <SectionHeader mainTitle={mainTitle} theme="nobilva" />
        <PricingComparisonTable
          columnLabels={columns}
          rows={rows}
        />
        {caution?.items?.length ? (
          <ComparisonCautionBlock
            heading={caution.heading}
            paragraph={caution.paragraph}
            items={caution.items}
          />
        ) : null}
      </Container>
    </Section>
  );
}
