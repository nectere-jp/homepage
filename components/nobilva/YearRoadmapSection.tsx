const phases = [
  {
    label: "4〜6月",
    title: "習慣を切らさない",
    body: "大会シーズンで忙しい時期。平日15分・土日30分の最低ラインを守り、提出物や小テストなど評定に直結するものだけをこなす。",
    accent: "bg-nobilva-main/20 border-nobilva-main",
  },
  {
    label: "7〜8月",
    title: "引退、そして切り替え",
    body: "夏の大会を全力で戦い抜く。引退後は学習時間を段階的に増やし、夏休み後半から受験の比重を上げていく。",
    accent: "bg-nobilva-accent/10 border-nobilva-accent",
  },
  {
    label: "9〜11月",
    title: "評定をひと押し",
    body: "平日2時間・土日4時間を目安に、中間・期末テストで評定を積み上げる。推薦狙いなら英検や書類準備もメンターが伴走。",
    accent: "bg-nobilva-accent/10 border-nobilva-accent",
  },
  {
    label: "12〜2月",
    title: "受験本番、毎日伴走",
    body: "出願・面接・受験当日まで、計画は「焦らずリズムを崩さない」ための装置。毎日メンターがそばにいる。",
    accent: "bg-gray-100 border-gray-300",
  },
  {
    label: "3月〜",
    title: "合格、その先へ",
    body: "高校入学後も、希望があれば学習計画づくりを継続サポート。",
    accent: "bg-gray-100 border-gray-300",
  },
];

export function YearRoadmapSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block">
            1年間、ずっと隣にいます。
          </h2>
        </div>

        {/* 横スクロール on mobile, グリッド on desktop */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible">
          {phases.map((phase, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-[260px] md:w-auto rounded-2xl border-2 p-5 md:p-6 flex flex-col ${phase.accent}`}
            >
              <span className="text-xs font-bold text-gray-500 mb-2">{phase.label}</span>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 leading-snug">
                {phase.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {phase.body}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          中3野球部員の例です。学年・部活の状況に合わせてメンターが計画を調整します。
        </p>
      </div>
    </section>
  );
}
