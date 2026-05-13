type Rating = "circle" | "triangle" | "cross";

interface CellData {
  text: string;
  rating: Rating;
}

interface ComparisonRow {
  item: string;
  nobilva: CellData;
  studyCoach: CellData;
  studyTrainer: CellData;
  studySapuri: CellData;
  studyAthlete: CellData;
}

const columns = [
  { key: "nobilva" as const, label: "Nobilva", highlight: true },
  { key: "studyCoach" as const, label: "スタディコーチ", highlight: false },
  { key: "studyTrainer" as const, label: "スタディトレーナー", highlight: false },
  { key: "studySapuri" as const, label: "スタディサプリ", highlight: false },
  { key: "studyAthlete" as const, label: "STUDY ATHLETE", highlight: false },
];

const rows: ComparisonRow[] = [
  {
    item: "主対象",
    nobilva: { text: "野球をがんばる中高生", rating: "circle" },
    studyCoach: { text: "大学受験生全般", rating: "triangle" },
    studyTrainer: { text: "中高生全般", rating: "triangle" },
    studySapuri: { text: "中高生・社会人全般", rating: "triangle" },
    studyAthlete: { text: "サッカー選手中心", rating: "circle" },
  },
  {
    item: "価格帯（月額）",
    nobilva: { text: "18,000円〜（全科目）", rating: "circle" },
    studyCoach: { text: "約3〜5万円", rating: "triangle" },
    studyTrainer: { text: "約3万円〜", rating: "triangle" },
    studySapuri: { text: "2,178円〜", rating: "circle" },
    studyAthlete: { text: "要問合せ", rating: "triangle" },
  },
  {
    item: "科目数",
    nobilva: { text: "全科目まとめて", rating: "circle" },
    studyCoach: { text: "科目数で変動", rating: "triangle" },
    studyTrainer: { text: "全科目可", rating: "circle" },
    studySapuri: { text: "全科目（動画）", rating: "circle" },
    studyAthlete: { text: "全科目", rating: "circle" },
  },
  {
    item: "学習計画",
    nobilva: { text: "週1面談で日割り作成", rating: "circle" },
    studyCoach: { text: "コーチが作成", rating: "circle" },
    studyTrainer: { text: "トレーナーが作成", rating: "circle" },
    studySapuri: { text: "自己作成", rating: "cross" },
    studyAthlete: { text: "コーチが作成", rating: "circle" },
  },
  {
    item: "毎日の進捗確認",
    nobilva: { text: "あり", rating: "circle" },
    studyCoach: { text: "プランによる", rating: "triangle" },
    studyTrainer: { text: "プランによる", rating: "triangle" },
    studySapuri: { text: "なし", rating: "cross" },
    studyAthlete: { text: "あり", rating: "circle" },
  },
  {
    item: "通塾の有無",
    nobilva: { text: "なし（完全オンライン）", rating: "circle" },
    studyCoach: { text: "なし", rating: "circle" },
    studyTrainer: { text: "なし", rating: "circle" },
    studySapuri: { text: "なし", rating: "circle" },
    studyAthlete: { text: "なし", rating: "circle" },
  },
  {
    item: "スポーツ両立特化",
    nobilva: { text: "野球特化", rating: "circle" },
    studyCoach: { text: "なし", rating: "cross" },
    studyTrainer: { text: "なし", rating: "cross" },
    studySapuri: { text: "なし", rating: "cross" },
    studyAthlete: { text: "サッカー特化", rating: "circle" },
  },
];

function RatingIcon({ rating, highlight }: { rating: Rating; highlight: boolean }) {
  const size = "w-8 h-8";
  if (rating === "circle") {
    return (
      <div className={`${size} rounded-full border-[3px] ${highlight ? "border-nobilva-accent" : "border-gray-400"} mx-auto`} />
    );
  }
  if (rating === "triangle") {
    return (
      <svg className={`${size} mx-auto text-gray-400`} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={3}>
        <path d="M16 4L2 28h28L16 4z" strokeLinejoin="round" />
      </svg>
    );
  }
  // cross
  return (
    <svg className={`${size} mx-auto text-gray-400`} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={3}>
      <path d="M6 6l20 20M26 6L6 26" strokeLinecap="round" />
    </svg>
  );
}

export function ComparisonSection() {
  return (
    <section id="comparison" className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex justify-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight">
            他サービスとの比較
          </h2>
        </div>

        {/* テーブル（横スクロール対応） */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full min-w-[700px] border-collapse">
            {/* ヘッダー */}
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 p-3 min-w-[120px]" />
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-center text-sm md:text-base font-bold p-3 min-w-[120px] ${
                      col.highlight
                        ? "bg-nobilva-accent text-white rounded-t-lg"
                        : "text-gray-700"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ボディ */}
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="text-sm font-medium text-gray-700 p-3 border-b border-gray-100">
                    {row.item}
                  </td>
                  {columns.map((col) => {
                    const cell = row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`text-center text-sm p-3 border-b border-gray-100 ${
                          col.highlight
                            ? "bg-nobilva-accent/5 font-bold text-gray-900 border-l-2 border-r-2 border-nobilva-accent/20"
                            : "text-gray-600"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <RatingIcon rating={cell.rating} highlight={col.highlight} />
                          <span>{cell.text}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 注記 */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          ※価格・サービス内容は各社サイト掲載の情報をもとに2026年5月時点で整理しています。最新情報は各社にてご確認ください。
        </p>
      </div>
    </section>
  );
}
