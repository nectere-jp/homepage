"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

interface FlowSectionProps {
  flowItems: any[];
}

export function FlowSection({ flowItems }: FlowSectionProps) {
  const t = useTranslations("teachit");

  return (
    <Section id="flow" backgroundColor="white" padding="md">
      <Container>
        <SectionHeader
          englishTitle="Flow"
          japaneseTitle={t("flow.title")}
          theme="teachit"
        />
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {flowItems.map((item: any, i: number, arr: any[]) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="flex gap-6 mb-8 relative">
                  <div className="flex-shrink-0 w-10 h-10 bg-teachit-main rounded-[2rem] flex items-center justify-center text-white font-bold z-10">
                    {i + 1}
                  </div>
                  {i !== arr.length - 1 && (
                    <div className="absolute left-[19px] top-10 w-0.5 h-full bg-teachit-main/20" />
                  )}
                  <div className="pt-1">
                    <p className="text-lg text-blue font-semibold">{item}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
