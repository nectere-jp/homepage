import Image from "next/image";
import { DiagnosisCTA } from "./DiagnosisCTA";
import { ChevronDownIcon, TagIcon, ShieldCheckIcon, BoltIcon } from "./Icons";
import { wb } from "@/lib/wb";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white min-h-[600px] md:min-h-[700px]">
      {/* 背景画像 */}
      <Image
        src="/images/nobilva/hero.jpg"
        alt="ベンチで単語帳を読む野球部員"
        fill
        priority
        className="object-cover object-center blur-sm scale-105"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24 lg:pb-28">
        <div className="max-w-3xl">
          {/* コピーカード（黄色背景 + 斜め塗り分け） */}
          <div className="inline-block mb-8 md:mb-10 p-6 md:p-8 lg:p-10 bg-split-yellow">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-snug tracking-tight mb-4">
                <span className="text-nobilva-accent">野球</span>をがんばる
                <br />
                中高生のための、
                <br />
                <span className="text-nobilva-accent">学習管理</span>サービス。
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-900 leading-relaxed">
                {wb("練習で時間がない、/遠征で授業を欠席する、/疲れて勉強に手がつかない。")}
                <br className="hidden md:inline" />
                {wb("同じ毎日を過ごす中高生に、/続けられる仕組みを届けます。")}
              </p>
          </div>

          {/* バッジ群 */}
          <div className="flex flex-wrap gap-3 mb-8 md:mb-10">
            <span className="inline-flex items-center gap-1.5 text-gray-900 font-bold text-sm md:text-base px-4 py-2 rounded-full bg-split-yellow">
              <TagIcon />
              {wb("月20名限定 /無料学習相談")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-gray-800 font-bold text-sm md:text-base px-4 py-2 rounded-full bg-split-gray">
              <ShieldCheckIcon />
              30日全額返金保証
            </span>
            <span className="inline-flex items-center gap-1.5 text-gray-800 font-bold text-sm md:text-base px-4 py-2 rounded-full bg-split-gray">
              <BoltIcon />
              {wb("全科目まとめて /月18,000〜26,000円")}
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <DiagnosisCTA variant="hero" />
            <a
              href="#how-we-work"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-nobilva-accent font-medium text-base md:text-lg transition-colors px-6 py-3 rounded-lg bg-split-white"
            >
              まずはサービスの
              <br />
              仕組みを見る
              <ChevronDownIcon />
            </a>
          </div>
        </div>

      </div>

      {/* スクロール促進チェブロン */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDownIcon size="lg" className="text-gray-400" />
      </div>
    </section>
  );
}
