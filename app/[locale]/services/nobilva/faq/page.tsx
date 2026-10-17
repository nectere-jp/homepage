"use client";

import { useState } from "react";
import Image from "next/image";
import { CTABanner } from "@/components/nobilva/CTABanner";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { PARENT_FAQ, STUDENT_FAQ, TEAM_FAQ } from "./_data";

type TabKey = "parent" | "student" | "team";

const TABS: { key: TabKey; label: string; description: string }[] = [
  { key: "parent", label: "保護者の方", description: "サービス内容・料金・申込・解約・進路など" },
  { key: "student", label: "生徒の方", description: "始め方・日常の使い方・困った時" },
  { key: "team", label: "チーム関係者の方", description: "導入の流れ・お金の流れ・責任の所在" },
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("parent");

  const currentFAQ =
    activeTab === "parent"
      ? PARENT_FAQ
      : activeTab === "student"
        ? STUDENT_FAQ
        : TEAM_FAQ;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero: how-it-works と同じ画像＋ロゴ＋"の〜" パターン */}
      <section className="bg-white pb-4">
        <div className="px-5 pt-10 md:pt-5">
          <div className="relative aspect-[3/1] md:aspect-[4/1] rounded-2xl overflow-hidden">
            <Image
              src="/images/nobilva/hero.jpg"
              alt="ベンチで単語帳を読む野球部員"
              fill
              priority
              className="object-cover object-top"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 md:px-12 lg:px-16 flex items-center gap-2 md:gap-3">
                <Image
                  src="/images/logo_nobilva.png"
                  alt="Nobilva"
                  width={300}
                  height={72}
                  className="h-12 md:h-14 lg:h-16 w-auto"
                />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                  のよくあるご質問
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* タブセレクター */}
      <section className="bg-white pt-6 md:pt-8">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-nobilva-main text-gray-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ本体 */}
      <section className="bg-white pt-8 md:pt-10 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="space-y-10">
            {currentFAQ.map((category) => (
              <div key={category.category}>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  {category.category}
                </h2>
                <SubpageFAQ
                  bare
                  items={category.items.map((item) => ({
                    question: item.q,
                    answer: item.a,
                  }))}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — how-it-works と同じパターン */}
      <section className="bg-white pt-8 md:pt-12 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
          <CTABanner variant="final" />
        </div>
      </section>
    </div>
  );
}
