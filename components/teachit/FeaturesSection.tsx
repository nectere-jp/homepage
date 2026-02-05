"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  HiOutlineSearch,
  HiOutlineSpeakerphone,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { addSoftBreaks } from "@/utils/softBreak";

const animationStyle = `
  @keyframes flipAnimation {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
  .flip-animation {
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
  }
  .flip-wrapper {
    perspective: 1000px;
  }
  .hover-trigger:hover .flip-animation {
    animation: flipAnimation 0.8s ease-in-out;
  }
`;

export function FeaturesSection() {
  const t = useTranslations("teachit");

  const features = [
    {
      index: 0,
      icon: HiOutlineSearch,
    },
    {
      index: 1,
      icon: HiOutlineSpeakerphone,
    },
    {
      index: 2,
      icon: HiOutlineAcademicCap,
    },
    {
      index: 3,
      icon: HiOutlineBriefcase,
    },
    {
      index: 4,
      icon: HiOutlineLightningBolt,
    },
  ];

  return (
    <>
      <style jsx>{animationStyle}</style>
      <Section
        id="features"
        backgroundColor="transparent"
        className="bg-teachit-light"
        padding="md"
      >
        <Container>
          <SectionHeader
            englishTitle="Features"
            japaneseTitle={t("features.title")}
            theme="teachit"
            className="ml-0"
          />
          <div className="flex flex-col gap-8 md:gap-10">
            {features.map(({ index, icon: Icon }) => {
              const isEven = index % 2 === 0;
              const title = t(`features.items.${index}.title`);
              const description = t(`features.items.${index}.description`);

              return (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div
                    className={`flex flex-col ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    } gap-8 md:gap-12 items-center hover-trigger`}
                  >
                    {/* アイコン */}
                    <div className="w-full md:w-1/3 flex items-center justify-center flex-shrink-0 flip-wrapper">
                      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center flip-animation">
                        <Icon className="w-20 h-20 md:w-24 md:h-24 text-teachit-accent" />
                      </div>
                    </div>

                    {/* テキスト */}
                    <div className="w-full md:w-2/3">
                      <h3 className="text-2xl md:text-3xl font-bold text-teachit-main mb-4">
                        {title}
                      </h3>
                      <p className="text-text/80 text-base md:text-lg leading-relaxed">
                        {addSoftBreaks(description)}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
