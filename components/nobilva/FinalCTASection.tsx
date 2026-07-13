import { Section } from "./Section";
import { CTABanner } from "./CTABanner";

interface FinalCTASectionProps {
  diagnosisHref?: string;
  onCTAClick?: () => void;
  hideLine?: boolean;
  monitorTeamBadge?: boolean;
  hideMonthlyLimit?: boolean;
}

export function FinalCTASection({
  diagnosisHref,
  onCTAClick,
  hideLine,
  monitorTeamBadge,
  hideMonthlyLimit,
}: FinalCTASectionProps = {}) {
  return (
    <Section>
      <CTABanner
        variant="final"
        diagnosisHref={diagnosisHref}
        onCTAClick={onCTAClick}
        hideLine={hideLine}
        monitorTeamBadge={monitorTeamBadge}
        hideMonthlyLimit={hideMonthlyLimit}
      />
    </Section>
  );
}
