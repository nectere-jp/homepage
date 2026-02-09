import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FlowList } from "./FlowList";

interface FlowItem {
  step: number;
  title: string;
  description: string;
  optional?: boolean;
}

interface FlowSectionProps {
  individualItems: FlowItem[];
  teamItems: FlowItem[];
  title: string;
  individualTitle: string;
  teamTitle: string;
  lineButtonLabel: string;
}

export function FlowSection({
  individualItems,
  teamItems,
  title,
  individualTitle,
  teamTitle,
  lineButtonLabel,
}: FlowSectionProps) {
  return (
    <Section
      id="flow"
      backgroundColor="transparent"
      className="bg-yellow-50"
      padding="md"
    >
      <Container>
        <SectionHeader
          englishTitle="Flow"
          japaneseTitle={title}
          theme="nobilva"
        />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* 個人利用 */}
            <div className="relative">
              <div className="sticky top-8">
                <h3 className="text-2xl md:text-3xl font-bold text-nobilva-accent mb-6 md:mb-8 text-center">
                  {individualTitle}
                </h3>
                <div className="rounded-lg p-6 md:p-8">
                  <FlowList
                    items={individualItems}
                    lineButtonLabel={lineButtonLabel}
                    isTeam={false}
                  />
                </div>
              </div>
            </div>

            {/* チーム利用 */}
            <div className="relative">
              <div className="sticky top-8">
                <h3 className="text-2xl md:text-3xl font-bold text-nobilva-accent mb-6 md:mb-8 text-center">
                  {teamTitle}
                </h3>
                <div className="rounded-lg p-6 md:p-8">
                  <FlowList
                    items={teamItems}
                    lineButtonLabel={lineButtonLabel}
                    isTeam={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
