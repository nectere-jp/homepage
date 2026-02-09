import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import Image from "next/image";
import { addSoftBreaks } from "@/utils/softBreak";

interface ProblemItem {
  problem: string;
  description: string;
  solution: string;
  solutionDescription: string;
  image: string;
}

interface ProblemsSectionProps {
  title: string;
  items: ProblemItem[];
}

export function ProblemsSection({ title, items }: ProblemsSectionProps) {
  return (
    <>
      <Section
        id="problems"
        backgroundColor="white"
        padding="md"
      >
        <Container>
          <SectionHeader
            englishTitle="Problems"
            japaneseTitle={title}
            theme="nobilva"
          />
          <div className="flex flex-col gap-28 md:gap-20">
            {items.map((item, index) => {
              return (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-stretch">
                    {/* 左側：お悩み部分 */}
                    <div className="flex flex-col gap-2 md:gap-4 md:w-[30%] lg:w-[40%] md:flex-none">
                      {/* お悩み画像とテキスト */}
                      <div className="flex flex-col items-center gap-2 md:gap-4">
                        {/* お悩み画像 */}
                        <div className="flex items-center justify-center coin-wrapper">
                          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100/80 backdrop-blur-sm flex items-center justify-center p-6 coin-animation">
                            <div className="relative w-full h-full">
                              <Image
                                src={item.image}
                                alt={item.problem}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        </div>

                        {/* お悩みテキスト */}
                        <div className="text-center">
                          <h3
                            className="text-lg md:text-xl font-bold text-gray-700 mb-2"
                            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                          >
                            {addSoftBreaks(item.problem)}
                          </h3>
                          <p
                            className="text-gray-600 text-sm md:text-base"
                            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                          >
                            {addSoftBreaks(item.description)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 矢印アイコン（モバイルは下向き、デスクトップは右向き） */}
                    <div className="flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-8 h-8 md:w-10 md:h-10 text-nobilva-accent animate-bounce md:animate-pulse md:rotate-[-90deg]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>

                    {/* 右側：解決策部分 */}
                    <div className="flex-1 flex items-center">
                      <div className="w-full text-center md:text-left">
                        <div className="mb-3">
                          {item.solution.split("\n").map((line, i) => (
                            <div
                              key={i}
                              className={
                                i === 0
                                  ? "text-lg md:text-xl font-bold text-gray-900"
                                  : "text-3xl md:text-4xl font-bold text-nobilva-accent"
                              }
                              style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                            >
                              {addSoftBreaks(line)}
                            </div>
                          ))}
                        </div>
                        <p
                          className="text-text/80 text-sm md:text-base leading-relaxed"
                          style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                        >
                          {addSoftBreaks(item.solutionDescription)}
                        </p>
                      </div>
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
