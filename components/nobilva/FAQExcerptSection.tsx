"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "練習で疲れていても勉強できますか？",
    answer:
      "はい。メンターが疲労度や体調も考慮して、1日15分から始められる無理のない計画を立てます。短時間でも効果的な学習方法を提案し、徐々に学習時間を増やしていきます。疲れている日は量を減らすなど、柔軟に調整できます。",
  },
  {
    question: "遠征や大会で学校を欠席することが多くても大丈夫ですか？",
    answer:
      "はい、むしろそのような選手こそ Nobilva のサポートが役立ちます。遠征スケジュールを共有していただき、計画を週単位で調整します。戻った後の追い上げもメンターと一緒に設計します。",
  },
  {
    question: "今から対策しても評定は上がりますか？",
    answer:
      "提出物の管理徹底や授業態度の改善など、今すぐ始められる対策から着手します。定期テストまでの期間に応じて、最適な学習計画を立てます。中3の2学期から始めて評定を改善した実績もあります。",
  },
  {
    question: "スポーツ推薦と一般進学、両方の準備はできますか？",
    answer:
      "はい。週1面談で、推薦基準（評定・英検）と一般受験準備を並行設計します。進路選択を「先送り」できるように学習を組み立てるのが Nobilva の特徴です。",
  },
  {
    question: "30日全額返金保証の条件は？",
    answer:
      "入会から30日以内であれば、申し出のみで全額返金いたします（理由不要）。ただし教材費（市販書）は返金対象外、面談・チャット利用がある場合は日割り返金となる場合があります。詳しくは料金ページの規約をご確認ください。",
  },
  {
    question: "無料学習診断はどんな内容ですか？",
    answer:
      "オンラインで30分程度の面談です。お子さんの現状（部活スケジュール・得意苦手・志望進路）を伺ったうえで、現実的な学習プランを具体的にご提案します。判断材料を持ち帰っていただく場で、無理な勧誘はしません。月20名までの限定枠です。",
  },
];

export function FAQExcerptSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex justify-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight">
            よくある質問
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-4 p-5 md:p-6 text-left"
                >
                  <span className="text-xl md:text-2xl font-black text-nobilva-main flex-shrink-0">
                    Q{index + 1}
                  </span>
                  <span className="flex-1 text-sm md:text-base font-medium text-gray-900">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
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

        {/* FAQすべて見る */}
        <div className="text-center mt-10">
          <Link
            href="/ja/services/nobilva/faq"
            className="inline-flex items-center gap-2 text-nobilva-accent font-bold hover:underline text-base md:text-lg"
          >
            FAQをすべて見る
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
