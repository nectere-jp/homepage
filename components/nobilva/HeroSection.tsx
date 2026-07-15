import Image from "next/image";

export function HeroSection() {
  return (
    <section className="bg-white pt-6 md:pt-10 pb-10 md:pb-14">
      <div className="px-4 md:px-6">
        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-nobilva-main">
          {/* 装飾 SVG（あしらい: オレンジの三角・線・ドット） */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 600 300"
            aria-hidden="true"
          >
            {/* 大きな三角形 */}
            <polygon points="0,0 160,0 60,300" fill="#ea5614" opacity="0.07" />
            <polygon points="120,0 280,0 200,180" fill="#ea5614" opacity="0.05" />
            <polygon points="0,200 100,300 0,300" fill="#ea5614" opacity="0.08" />
            <polygon points="220,300 340,200 280,300" fill="#ea5614" opacity="0.05" />
            <polygon points="450,30 600,0 600,140" fill="#ea5614" opacity="0.05" />
            {/* 小さなアクセント三角形 */}
            <polygon points="60,300 180,180 140,300" fill="#ea5614" opacity="0.08" />
            <polygon points="20,100 80,40 60,180" fill="#ea5614" opacity="0.05" />
            <polygon points="240,80 300,20 320,120" fill="#ea5614" opacity="0.04" />
            <polygon points="500,200 580,140 600,260" fill="#ea5614" opacity="0.05" />
            {/* 線（ノード間接続風） */}
            <line x1="60" y1="300" x2="200" y2="180" stroke="#ea5614" strokeWidth="0.6" opacity="0.15" />
            <line x1="200" y1="180" x2="300" y2="60" stroke="#ea5614" strokeWidth="0.6" opacity="0.12" />
            <line x1="80" y1="180" x2="200" y2="180" stroke="#ea5614" strokeWidth="0.6" opacity="0.1" />
            <line x1="300" y1="60" x2="480" y2="80" stroke="#ea5614" strokeWidth="0.6" opacity="0.08" />
            {/* 小さなドット（ノード） */}
            <circle cx="200" cy="180" r="2.5" fill="#ea5614" opacity="0.22" />
            <circle cx="300" cy="60" r="2.5" fill="#ea5614" opacity="0.18" />
            <circle cx="80" cy="180" r="2" fill="#ea5614" opacity="0.15" />
            <circle cx="180" cy="80" r="1.8" fill="#ea5614" opacity="0.14" />
            <circle cx="480" cy="80" r="2" fill="#ea5614" opacity="0.16" />
          </svg>

          {/* 右側の選手画像（デスクトップのみ） */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-[42%] lg:w-[38%] xl:w-[35%] pointer-events-none">
            <Image
              src="/images/nobilva/hero_transparent.png"
              alt="背番号17の野球部員（後ろ姿）"
              fill
              priority
              className="object-contain object-right-bottom"
            />
          </div>

          {/* オーバーレイコンテンツ（見出し） */}
          <div className="relative px-6 md:px-12 lg:px-16 py-14 md:py-20 lg:py-28 md:pr-[42%] lg:pr-[38%] xl:pr-[35%] flex flex-col gap-6 md:gap-8">
            {/* メインコピー（3行構造: kicker → 野球と勉強の両立を → サポートします） */}
            <div className="font-black text-gray-900 tracking-tight">
              {/* Line 1: kicker */}
              <p className="text-base md:text-2xl lg:text-3xl xl:text-4xl leading-none">
                本気で野球に取り組む中学生の
              </p>

              {/* Line 2: 野球 / 勉強 を白ボックス+オレンジ文字で強調 */}
              <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-none mt-2 md:mt-3">
                <span className="inline-block bg-white text-nobilva-accent px-2 md:px-3 pt-0.5 pb-1.5 md:pt-1 md:pb-2.5 mr-1">
                  野球
                </span>
                と
                <span className="inline-block bg-white text-nobilva-accent px-2 md:px-3 pt-0.5 pb-1.5 md:pt-1 md:pb-2.5 mx-1">
                  勉強
                </span>
                の両立を
              </p>

              {/* Line 3 */}
              <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-none mt-2 md:mt-3">
                サポートします
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
