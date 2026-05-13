interface ComparisonRow {
  item: string;
  nobilva: string;
  studyCoach: string;
  studyTrainer: string;
  studySapuri: string;
  studyAthlete: string;
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
    nobilva: "野球をがんばる中高生",
    studyCoach: "大学受験生全般",
    studyTrainer: "中高生全般",
    studySapuri: "中高生・社会人全般",
    studyAthlete: "サッカー選手中心",
  },
  {
    item: "価格帯（月額）",
    nobilva: "18,000円〜",
    studyCoach: "約3〜5万円",
    studyTrainer: "約3万円〜",
    studySapuri: "2,178円〜",
    studyAthlete: "要問合せ",
  },
  {
    item: "科目",
    nobilva: "全科目まとめて",
    studyCoach: "全科目可（科目数で変動）",
    studyTrainer: "全科目可",
    studySapuri: "全科目（動画）",
    studyAthlete: "全科目",
  },
  {
    item: "学習計画",
    nobilva: "週1面談で日割り作成",
    studyCoach: "コーチが作成",
    studyTrainer: "トレーナーが作成",
    studySapuri: "自己作成",
    studyAthlete: "コーチが作成",
  },
  {
    item: "毎日の進捗確認",
    nobilva: "あり",
    studyCoach: "プランによる",
    studyTrainer: "プランによる",
    studySapuri: "なし",
    studyAthlete: "あり",
  },
  {
    item: "通塾の有無",
    nobilva: "なし（完全オンライン）",
    studyCoach: "なし",
    studyTrainer: "なし",
    studySapuri: "なし",
    studyAthlete: "なし",
  },
  {
    item: "スポーツ両立特化",
    nobilva: "◎（野球特化）",
    studyCoach: "×",
    studyTrainer: "×",
    studySapuri: "×",
    studyAthlete: "◎（サッカー特化）",
  },
];

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
                    const value = row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`text-center text-sm p-3 border-b border-gray-100 ${
                          col.highlight
                            ? "bg-nobilva-accent/5 font-bold text-gray-900 border-l-2 border-r-2 border-nobilva-accent/20"
                            : "text-gray-600"
                        }`}
                      >
                        {value}
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
