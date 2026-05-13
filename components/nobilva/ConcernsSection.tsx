import { DiagnosisCTA } from "./DiagnosisCTA";

const concerns = [
  {
    title: "練習で疲れて、机に向かえない",
    voice:
      "練習から帰ってきたら、ご飯を食べてそのまま倒れるように寝てしまう。机に向かうのを見たことが、最近ほとんどない気がする。",
    solution:
      "1日15分から始められる、疲労度を考慮した日割り計画。短時間集中で続けられる単位に分解します。",
  },
  {
    title: "遠征・大会で授業を欠席し、追いつけない",
    voice:
      "大会や遠征が重なる時期は、平日に学校を休む日が出てくる。戻った頃には、授業がどんどん先に進んでしまっている。",
    solution:
      "遠征・試合スケジュールを共有し、計画を週単位で柔軟に調整。戻ってからの追い上げをメンターと一緒に設計します。",
  },
  {
    title: "内申点が、思うように上がらない",
    voice:
      "テスト勉強は本人なりに頑張っているのに、評定が上がらない。提出物や授業態度の積み上げが、見えていないのかもしれない。",
    solution:
      "提出物・小テスト・授業ノートまで、毎日の進捗確認でカバー。評定の構成要素を可視化して取り組みます。",
  },
  {
    title: "スポーツ推薦と一般進学、両方の選択肢を残したい",
    voice:
      "推薦も視野にあるけれど、絶対ではない。一般進学の道も残したいけれど、どう動けばいいのかわからない。",
    solution:
      "週1面談で、推薦基準（評定・英検）と一般受験準備を並行設計。進路選択を「先送り」できるように学習を組み立てます。",
  },
  {
    title: "塾に通う時間と体力がない",
    voice:
      "平日は練習が遅くまで、土日は試合や遠征。通塾の時間と体力を捻出するのが、現実的に難しい。",
    solution:
      "完全オンライン。送迎ゼロ・通塾ゼロ。練習後の自宅で、面談もチャットも完結します。",
  },
  {
    title: "自分で計画を立てても、続かない",
    voice:
      "春休みやテスト前に計画は立てる。でも、3日でうまくいかなくなる。本人もそれで自信をなくしている。",
    solution:
      "メンターが日割りで計画を作り、毎日進捗を確認。「続かない原因」を毎週一緒に見直します。",
  },
];

export function ConcernsSection() {
  return (
    <section className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex justify-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight">
            野球家庭の6つの悩み
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {concerns.map((concern, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 悩みタイトル */}
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main flex items-center justify-center text-sm font-bold text-gray-800">
                  {index + 1}
                </span>
                {concern.title}
              </h3>

              {/* 保護者の声 */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  保護者の声
                </p>
                <blockquote className="text-sm md:text-base text-gray-600 leading-relaxed border-l-2 border-gray-200 pl-3">
                  {concern.voice}
                </blockquote>
              </div>

              {/* Nobilvaの仕組み */}
              <div>
                <p className="text-xs font-bold text-nobilva-accent uppercase tracking-wide mb-2">
                  Nobilvaの仕組み
                </p>
                <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">
                  {concern.solution}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 軽いCTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            他にもこんな悩みはありませんか？
          </p>
          <DiagnosisCTA variant="secondary" />
        </div>
      </div>
    </section>
  );
}
