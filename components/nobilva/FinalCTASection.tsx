import { DiagnosisCTA } from "./DiagnosisCTA";
import { LINE_ADD_URL } from "@/lib/constants";

export function FinalCTASection() {
  return (
    <section className="relative bg-gradient-to-b from-nobilva-light to-amber-50 py-20 md:py-28 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center">
        {/* メインコピー */}
        <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-black tracking-tight inline-block leading-snug mb-6 md:mb-8">
          この子に合った計画を、
          <br />
          一度、一緒に作ってみませんか。
        </h2>

        {/* サブコピー */}
        <div className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto space-y-2">
          <p>
            月20名限定の無料学習診断では、練習スケジュール、得意・苦手、志望進路を伺ったうえで、ご家庭の状況に合わせた学習プランを具体的にお見せします。
          </p>
          <p>判断材料として、お持ち帰りください。</p>
        </div>

        {/* バッジ */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="inline-flex items-center gap-1.5 bg-nobilva-main text-gray-900 font-bold text-sm px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            月20名限定
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            30日全額返金保証
          </span>
        </div>

        {/* プライマリCTA */}
        <div className="mb-6">
          <DiagnosisCTA variant="hero" />
        </div>

        {/* セカンダリ（LINE） */}
        <p className="text-sm text-gray-500">
          まずは LINE で質問だけしてみたい方は
          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-nobilva-accent hover:underline ml-1"
          >
            こちら
          </a>
        </p>
      </div>
    </section>
  );
}
