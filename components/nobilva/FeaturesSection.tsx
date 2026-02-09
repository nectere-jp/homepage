import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import Image from "next/image";
import { addSoftBreaks } from "@/utils/softBreak";

interface FeatureItem {
  title: string;
  description: string;
  image: string;
}

interface FeaturesSectionProps {
  title: string;
  items: FeatureItem[];
}

export function FeaturesSection({ title, items }: FeaturesSectionProps) {
  return (
    <>
      <Section
        id="features"
        backgroundColor="transparent"
        className="bg-nobilva-light"
        padding="md"
      >
        <Container>
          <SectionHeader
            englishTitle="Solution"
            japaneseTitle={title}
            theme="nobilva"
          />
          <div className="flex flex-col gap-8 md:gap-10">
            {items.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div
                    className={`flex flex-col ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    } gap-8 md:gap-6 items-center hover-trigger`}
                  >
                    {/* 画像 */}
                    <div className="w-full md:w-1/3 flex items-center justify-center flex-shrink-0 coin-wrapper">
                      <div className="relative w-48 h-48 md:w-48 md:h-48 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center p-6 md:p-6 coin-animation">
                        <div className="relative w-full h-full">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* テキスト */}
                    <div className="w-full md:w-2/3 md:flex-shrink md:min-w-0">
                      <h3 className="text-2xl md:text-3xl font-bold text-nobilva-accent mb-4">
                        {item.title}
                      </h3>
                      <p className="text-text/80 text-base md:text-base leading-relaxed">
                        {addSoftBreaks(item.description)}
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
