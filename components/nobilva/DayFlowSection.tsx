import Link from "next/link";
import { Section } from "./Section";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";

const moments = [
  { time: "7:20", label: "起床→朝食" },
  { time: "7:42", label: "メンターからの\nコメントを確認" },
  { time: "8:05", label: "学校へ" },
  { time: "15:40", label: "練習開始" },
  { time: "20:29", label: "帰宅→夕食" },
  { time: "21:15", label: "メンターのコメント\nに従って勉強" },
  { time: "22:38", label: "メンターに\n今日の進捗を送る" },
  { time: "23:35", label: "風呂→就寝" },
];

export function DayFlowSection() {
  return (
    <Section>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 text-center mb-10 md:mb-14">
        Nobilvaユーザーの一日
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {moments.map((m, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* 写真 + 時刻オーバーレイ */}
            <div className="relative w-full aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl font-black text-gray-900/80 select-none">
                {m.time}
              </span>
            </div>
            {/* キャプション */}
            <p className="mt-2 text-xs md:text-sm text-gray-700 text-center leading-snug whitespace-pre-line">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-12 md:mt-16">
        <p className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
          あなたの場合はどうなる！？
        </p>
        <Link
          href={DIAGNOSIS_PATH}
          className="inline-flex items-center gap-1 text-gray-700 font-bold text-sm md:text-base hover:underline"
        >
          無料でシミュレーションしてみる
          <span>&rarr;</span>
        </Link>
      </div>
    </Section>
  );
}
