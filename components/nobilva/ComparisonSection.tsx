import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { NobilvaLogo } from "./Icons";
import { wb } from "@/lib/wb";

type Rating = "doubleCircle" | "circle" | "triangle" | "cross";

interface CellData {
  text: string;
  rating: Rating;
}

interface ComparisonRow {
  item: string;
  nobilva: CellData;
  studyTrainer: CellData;
  majorPrepW: CellData;
  studySapuri: CellData;
  studyAthlete: CellData;
}

const columns = [
  { key: "nobilva" as const, label: "__logo__", sub: "野球特化/オンライン/学習管理", highlight: true },
  { key: "studyAthlete" as const, label: "STUDY/ ATHLETE", sub: "アスリート向け/学習支援", highlight: false, href: "https://www.study-athlete.com/" },
  { key: "studyTrainer" as const, label: "スタディ/トレーナー", sub: "オンライン/学習/コーチング", highlight: false, href: "https://study-trainer.com/" },
  { key: "majorPrepW" as const, label: "早稲田/アカデミー", sub: "大手学習塾", highlight: false, href: "https://www.waseda-ac.co.jp/" },
  { key: "studySapuri" as const, label: "スタディ/サプリ", sub: "動画配信型/学習", highlight: false, href: "https://studysapuri.jp/" },
];

const rows: ComparisonRow[] = [
  {
    item: "サービス/形態",
    nobilva: { text: "学習管理型/／学校の授業を/軸に/自学を設計", rating: "doubleCircle" },
    studyAthlete: { text: "授業型/／独自カリキュラムで/指導", rating: "triangle" },
    studyTrainer: { text: "コーチング型", rating: "circle" },
    majorPrepW: { text: "集団授業型", rating: "triangle" },
    studySapuri: { text: "動画配信型", rating: "triangle" },
  },
  {
    item: "5科目の/月額",
    nobilva: { text: "18,000〜/26,000円/（何科目でも/定額）", rating: "circle" },
    studyAthlete: { text: "39,600〜/45,100円/（科目追加で/加算）", rating: "cross" },
    studyTrainer: { text: "約3万円〜", rating: "triangle" },
    majorPrepW: { text: "約4〜8万円", rating: "cross" },
    studySapuri: { text: "2,178円〜", rating: "doubleCircle" },
  },
  {
    item: "学校の授業/との連携",
    nobilva: { text: "学校の進度・/教材に合わせて/計画を/毎週調整", rating: "doubleCircle" },
    studyAthlete: { text: "独自授業が中心/／学校と/重複の/可能性あり", rating: "cross" },
    studyTrainer: { text: "学校教材に/対応可", rating: "circle" },
    majorPrepW: { text: "独自/カリキュラム", rating: "cross" },
    studySapuri: { text: "自分で選択", rating: "triangle" },
  },
  {
    item: "練習・遠征への/スケジュール/対応",
    nobilva: { text: "練習・遠征日程に/合わせて/日割りで/柔軟に調整", rating: "doubleCircle" },
    studyAthlete: { text: "試合日程に/合わせて調整", rating: "circle" },
    studyTrainer: { text: "考慮なし", rating: "cross" },
    majorPrepW: { text: "欠席は/自己対応", rating: "cross" },
    studySapuri: { text: "自分で調整", rating: "cross" },
  },
  {
    item: "毎日の/サポート",
    nobilva: { text: "チャットで/学習報告/／メンターが/フィードバック", rating: "circle" },
    studyAthlete: { text: "LINE/出欠監視/／不参加時に/通知", rating: "triangle" },
    studyTrainer: { text: "プランに/よる", rating: "triangle" },
    majorPrepW: { text: "なし", rating: "cross" },
    studySapuri: { text: "なし", rating: "cross" },
  },
  {
    item: "自学力の/定着",
    nobilva: { text: "自分で学ぶ力を/育てる/／卒業後も/続く/習慣づくり", rating: "doubleCircle" },
    studyAthlete: { text: "授業への/出席が前提/／管理が外れると/続きにくい", rating: "triangle" },
    studyTrainer: { text: "コーチングで/習慣化", rating: "circle" },
    majorPrepW: { text: "授業依存に/なりやすい", rating: "cross" },
    studySapuri: { text: "自己管理が/必要", rating: "triangle" },
  },
  {
    item: "対象/スポーツ",
    nobilva: { text: "野球特化/（硬式・軟式・/高校野球）", rating: "circle" },
    studyAthlete: { text: "スポーツ全般/（サッカー中心）", rating: "triangle" },
    studyTrainer: { text: "なし", rating: "cross" },
    majorPrepW: { text: "なし", rating: "cross" },
    studySapuri: { text: "なし", rating: "cross" },
  },
];

function RatingIcon({ rating, highlight }: { rating: Rating; highlight: boolean }) {
  const size = "w-8 h-8";
  if (rating === "doubleCircle") {
    const color = highlight ? "border-nobilva-accent" : "border-gray-400";
    return (
      <div className={`${size} rounded-full border-[3px] ${color} flex items-center justify-center mx-auto`}>
        <div className={`w-4 h-4 rounded-full border-[2.5px] ${color}`} />
      </div>
    );
  }
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
    <Section bg="light" id="comparison">
      <SectionHeading center>他サービスとの/比較</SectionHeading>

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
                  className={`text-center text-sm md:text-base font-bold p-3 ${
                    col.highlight
                      ? "bg-nobilva-accent text-white rounded-t-lg min-w-[180px]"
                      : "text-gray-700 min-w-[120px]"
                  }`}
                >
                  {col.label === "__logo__" ? (
                    <NobilvaLogo height={30} />
                  ) : col.href ? (
                    <a href={col.href} target="_blank" rel="noopener noreferrer" className="underline decoration-gray-300 hover:decoration-gray-700 transition-colors">
                      {wb(col.label)}
                    </a>
                  ) : wb(col.label)}
                  {col.sub && (
                    <span className={`block text-[10px] font-normal mt-0.5 ${col.highlight ? "text-white/70" : "text-gray-400"}`}>
                      ({wb(col.sub)})
                    </span>
                  )}
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
                  {wb(row.item)}
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
                        <span>{wb(cell.text)}</span>
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
    </Section>
  );
}
