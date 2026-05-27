"use client";

import { useState } from "react";
import { wb } from "@/lib/wb";
import { ChevronDownIcon } from "./Icons";
import { OutlineLink } from "./OutlineLink";
import { SectionHeading } from "./SectionHeading";

interface FAQItem {
  question: string;
  answer: string;
}

interface SubpageFAQProps {
  items: FAQItem[];
  heading?: string;
  headingAlign?: "left" | "center";
  seeAllHref?: string;
  id?: string;
  /** true にするとセクションラッパーを省略し、アコーディオンリストだけを描画する */
  bare?: boolean;
  /** bare 時に Q1, Q2… の番号を付けるか（デフォルト false） */
  numbered?: boolean;
}

export function SubpageFAQ({
  items,
  heading,
  headingAlign = "left",
  seeAllHref,
  id,
  bare = false,
  numbered = false,
}: SubpageFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const list = (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-4 p-5 md:p-6 text-left"
            >
              <span className="text-xl md:text-2xl font-black text-nobilva-main flex-shrink-0">
                Q{numbered ? index + 1 : ""}
              </span>
              <span className="flex-1 text-base md:text-lg font-bold text-gray-900">
                {wb(item.question)}
              </span>
              <ChevronDownIcon
                className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? "max-h-[500px]" : "max-h-0"
              }`}
            >
              <div className="px-5 md:px-6 pb-5 md:pb-6 pl-14 md:pl-16">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (bare) return list;

  return (
    <section id={id} className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
        {heading &&
          (headingAlign === "center" ? (
            <SectionHeading center>{heading}</SectionHeading>
          ) : (
            <SectionHeading className="mb-8">{heading}</SectionHeading>
          ))}

        {list}

        {seeAllHref && (
          <div className="text-center mt-10">
            <OutlineLink href={seeAllHref}>
              FAQをすべて見る
            </OutlineLink>
          </div>
        )}
      </div>
    </section>
  );
}
