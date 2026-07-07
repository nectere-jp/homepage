import Link from "next/link";

export function SolutionIntroSection() {
  return (
    <section className="bg-white pt-4 md:pt-8 pb-16 md:pb-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
          {/* 左: 写真プレースホルダー */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="aspect-[4/5] bg-gray-200 rounded-2xl" />
          </div>

          {/* 右: テキスト */}
          <div className="w-full md:w-3/5 space-y-5">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-snug">
              私たちNobilvaと一緒に
              <br />
              やってみませんか？
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-relaxed">
              野球と勉強の両立を
              <br />
              全力でサポートします！
            </p>
            <Link
              href="/ja/services/nobilva/how-it-works"
              className="inline-flex items-center gap-1 text-nobilva-accent font-bold text-base md:text-lg hover:underline transition-colors"
            >
              Nobilvaの指導方針
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
