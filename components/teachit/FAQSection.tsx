"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqItems: FAQItem[];
}

export function FAQSection({ faqItems }: FAQSectionProps) {
  const t = useTranslations("teachit");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqItems.length === 0) return null;

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section id="faq" backgroundColor="white" padding="md">
      <Container>
        <SectionHeader
          englishTitle="FAQ"
          japaneseTitle={t("faq.title")}
          theme="teachit"
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left p-6 focus:outline-none rounded-[2rem]"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-baseline gap-3 flex-1 min-w-0">
                      <span className="text-2xl md:text-3xl font-black text-teachit-main flex-shrink-0">
                        Q{index + 1}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-black flex-1 break-words">
                        {item.question}
                      </h3>
                    </div>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-teachit-main/10 flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-teachit-main"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pl-12 md:pl-16">
                    <p className="text-text/80 leading-relaxed text-lg">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
