type Pillar = "計画" | "チャット";

const pillarStyle: Record<Pillar, string> = {
  計画: "bg-nobilva-main text-gray-900",
  チャット: "bg-gray-800 text-white",
};

const moments: {
  time: string;
  heading: string;
  body: string;
  pillar: Pillar;
}[] = [
  {
    time: "朝 7:00",
    heading: "今日やることは、もう決まっている。",
    body: "起きたらチャットを開くだけ。メンターが前夜に送った「今日のやることリスト」を確認して、通学中に英単語15分。",
    pillar: "計画",
  },
  {
    time: "夜 21:00",
    heading: "練習で疲れていても、30分だけ。",
    body: "帰宅後の学習は30分。何をやるかはリストに書いてあるから、迷わず机に向かえる。",
    pillar: "計画",
  },
  {
    time: "夜 21:30",
    heading: "「やった」と送るだけで、翌日が変わる。",
    body: "チャットで「数学3問やった、1問詰まった」と報告。メンターがその日のうちに確認し、明日の計画に類題を追加。",
    pillar: "チャット",
  },
];

export function DayFlowSection() {
  return (
    <section className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block">
            練習で疲れて帰っても、やることは決まっている。
          </h2>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {moments.map((m, i) => (
            <div key={i} className="bg-white rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-nobilva-accent">
                  {m.time}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pillarStyle[m.pillar]}`}
                >
                  {m.pillar}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                {m.heading}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          中学3年生・硬式野球クラブチーム所属の選手の例です
        </p>
      </div>
    </section>
  );
}
