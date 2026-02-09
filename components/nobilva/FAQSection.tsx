/**
 * FAQSection - よくある質問セクション
 * 
 * アコーディオン形式でFAQを表示
 * クリックで開閉可能、チーム利用専用の質問にはバッジを表示
 */

"use client";

import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { addSoftBreaks } from "@/utils/softBreak";

interface FAQItem {
  question: string;
  answer: string;
  teamOnly?: boolean;
}

interface FAQSectionProps {
  faqItems: FAQItem[];
  title: string;
  mainTitle: string;
  teamOnlyBadge: string;
}

export function FAQSection({
  faqItems,
  title,
  mainTitle,
  teamOnlyBadge,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqItems.length === 0) return null;

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section id="faq" backgroundColor="white" padding="md">
      <Container>
        <SectionHeader mainTitle={mainTitle} theme="nobilva" />

        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left p-6 focus:outline-none rounded-2xl"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-baseline gap-3 flex-1">
                      <span className="text-2xl md:text-3xl font-black text-nobilva-main flex-shrink-0">
                        Q{index + 1}
                      </span>
                      <div className="flex flex-col md:flex-row items-start gap-2 flex-1 min-w-0">
                        <h3 
                          className="text-xl md:text-2xl font-bold text-black break-words"
                        >
                          {addSoftBreaks(item.question)}
                        </h3>
                        {item.teamOnly && (
                          <span className="bg-nobilva-accent text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap self-start mt-1 md:ml-3">
                            {teamOnlyBadge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main/10 flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-nobilva-main"
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
