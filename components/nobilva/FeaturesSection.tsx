"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import Image from "next/image";
import { addSoftBreaks } from "@/utils/softBreak";

const animationStyle = `
  @keyframes coinFlip {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
  .coin-animation {
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
  }
  .coin-wrapper {
    perspective: 1000px;
  }
  .hover-trigger:hover .coin-animation {
    animation: coinFlip 0.8s ease-in-out;
  }
`;

export function FeaturesSection() {
  const t = useTranslations("nobilva");

  const features = [
    {
      index: 0,
      image: "/images/nobilva/features-point1.svg",
    },
    {
      index: 1,
      image: "/images/nobilva/features-point2.svg",
    },
    {
      index: 2,
      image: "/images/nobilva/features-point3.svg",
    },
    {
      index: 3,
      image: "/images/nobilva/features-point4.svg",
    },
  ];

  return (
    <>
      <style jsx>{animationStyle}</style>
      <Section
        id="features"
        backgroundColor="transparent"
        className="bg-nobilva-light"
        padding="md"
      >
        <Container>
          <SectionHeader
            englishTitle="Solution"
            japaneseTitle={t("features.title")}
            theme="nobilva"
          />
          <div className="flex flex-col gap-8 md:gap-10">
            {features.map(({ index, image }) => {
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
                    {/* 画像 */}
                    <div className="w-full md:w-1/3 flex items-center justify-center flex-shrink-0 coin-wrapper">
                      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center p-8 coin-animation">
                        <div className="relative w-full h-full">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* テキスト */}
                    <div className="w-full md:w-2/3">
                      <h3 className="text-2xl md:text-3xl font-bold text-nobilva-accent mb-4">
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
