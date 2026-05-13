import { DiagnosisCTA } from "./DiagnosisCTA";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* 背景画像（プレースホルダー） */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 to-white/90 z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 pt-20 md:pt-28 lg:pt-32 pb-16 md:pb-24 lg:pb-28">
        <div className="max-w-3xl">
          {/* H1 メインヘッドライン */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
            野球をがんばる中高生のための、
            <br />
            学習管理サービス。
          </h1>

          {/* サブヘッドライン */}
          <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mb-8 md:mb-10">
            練習で時間がない、遠征で授業を欠席する、疲れて勉強に手がつかない。
            <br className="hidden md:inline" />
            同じ毎日を過ごす中高生に、続けられる仕組みを届けます。
          </p>

          {/* バッジ群 */}
          <div className="flex flex-wrap gap-3 mb-8 md:mb-10">
            <span className="inline-flex items-center gap-1.5 bg-nobilva-main text-gray-900 font-bold text-sm md:text-base px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              月20名限定 無料学習診断
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm md:text-base px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              30日全額返金保証
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm md:text-base px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              全科目まとめてサポート 月18,000円〜
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <DiagnosisCTA variant="hero" />
            <a
              href="#how-we-work"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-nobilva-accent font-medium text-base md:text-lg transition-colors py-3"
            >
              まずはサービスの仕組みを見る
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* スクロール促進チェブロン */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-gray-400"
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
    </section>
  );
}
