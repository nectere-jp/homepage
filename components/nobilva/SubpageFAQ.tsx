"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface SubpageFAQProps {
  items: FAQItem[];
  heading?: string;
}

export function SubpageFAQ({ items, heading }: SubpageFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
        {heading && (
          <h2 className="bg-nobilva-main px-8 py-3 text-xl md:text-2xl font-black text-black tracking-tight inline-block mb-8">
            {heading}
          </h2>
        )}
        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
                >
                  <span className="text-lg font-black text-nobilva-main flex-shrink-0">
                    Q{index + 1}
                  </span>
                  <span className="flex-1 text-sm md:text-base font-medium text-gray-900">
                    {item.question}
                  </span>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[500px]" : "max-h-0"}`}>
                  <div className="px-4 md:px-5 pb-4 md:pb-5 pl-12 md:pl-14">
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
