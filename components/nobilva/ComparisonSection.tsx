import Link from "next/link";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { NobilvaLogo } from "./Icons";
import { wb } from "@/lib/wb";

type ColumnKey = "nobilva" | "sportsTutoring" | "tutoring" | "video";

interface ComparisonRow {
  item: string;
  nobilva: string;
  sportsTutoring: string;
  tutoring: string;
  video: string;
}

const columns: { key: ColumnKey; label: string; highlight: boolean }[] = [
  { key: "nobilva", label: "__logo__", highlight: true },
  { key: "sportsTutoring", label: "スポーツをする子/向けの/オンライン/個別指導", highlight: false },
  { key: "tutoring", label: "個別指導塾・/オンライン/家庭教師", highlight: false },
  { key: "video", label: "映像授業", highlight: false },
];

const rows: ComparisonRow[] = [
  {
    item: "中心に/なるもの",
    nobilva: "全科目の/学習計画と/週1回の面談",
    sportsTutoring: "週1〜4回の/マンツーマン/授業",
    tutoring: "週1〜2回の/授業",
    video: "授業動画",
  },
  {
    item: "料金の/決まり方",
    nobilva: "何科目でも/定額/（月19,800円/または/28,600円）",
    sportsTutoring: "科目数と/回数で加算",
    tutoring: "科目数と/回数で加算",
    video: "定額/（月数千円）",
  },
  {
    item: "授業",
    nobilva: "計画に合わせて/単発でも/毎週でも/（別料金）",
    sportsTutoring: "毎週/決まった時間",
    tutoring: "毎週/決まった時間",
    video: "好きなときに/視聴",
  },
  {
    item: "授業のない日の/確認",
    nobilva: "毎日のチャット/（ベーシック/プラン）",
    sportsTutoring: "サービスや/コースによる",
    tutoring: "教室による",
    video: "基本は/本人任せ",
  },
  {
    item: "練習・遠征の/予定",
    nobilva: "先に伺って/日割りの計画に/反映",
    sportsTutoring: "サービスに/よる",
    tutoring: "振替は/教室による",
    video: "自分で調整",
  },
  {
    item: "学校の教材",
    nobilva: "学校の教材で/計画を立てる",
    sportsTutoring: "サービスごとの/教材",
    tutoring: "塾の教材が/多い",
    video: "自分で選ぶ",
  },
];

export function ComparisonSection() {
  return (
    <Section bg="light" id="comparison">
      <SectionHeading center>ほかの学習サービス/との違い</SectionHeading>

      {/* テーブル（横スクロール対応） */}
      <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-gray-500 p-3 min-w-[110px]" />
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-center text-sm md:text-base font-bold p-3 ${
                    col.highlight
                      ? "text-gray-900 border-t-[6px] border-l-[6px] border-r-[6px] border-nobilva-accent rounded-t-lg min-w-[170px]"
                      : "text-gray-700 min-w-[120px]"
                  }`}
                >
                  {col.label === "__logo__" ? <NobilvaLogo height={30} /> : wb(col.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="text-sm font-medium text-gray-700 p-3 border-b border-gray-100">
                  {wb(row.item)}
                </td>
                {columns.map((col) => {
                  const isLast = i === rows.length - 1;
                  return (
                    <td
                      key={col.key}
                      className={`text-center text-sm p-3 ${
                        col.highlight
                          ? `bg-nobilva-accent/5 font-bold text-gray-900 border-l-[6px] border-r-[6px] border-nobilva-accent ${
                              isLast ? "border-b-[6px] rounded-b-lg" : "border-b border-gray-100"
                            }`
                          : "text-gray-600 border-b border-gray-100"
                      }`}
                    >
                      {wb(row[col.key])}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        ※一般的な傾向を2026年11月時点で整理しています。Nobilva の月額は税込で、別途システム管理費（月1,100円・税込）がかかります。
      </p>
      <p className="text-sm text-center mt-3">
        <Link
          href="/blog/bukatsu-benkyou-ryoritsu-support-erabikata"
          className="underline decoration-gray-300 hover:decoration-gray-700 transition-colors text-gray-700"
        >
          サービスごとの料金と内容は選び方の記事で比べています
        </Link>
      </p>
    </Section>
  );
}
