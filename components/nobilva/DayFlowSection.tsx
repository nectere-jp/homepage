import Image from "next/image";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { DiagnosisCTA } from "./DiagnosisCTA";

const moments = [
  { time: "7:20", label: "起床→朝食", image: "/images/nobilva/dayflow/0720-wakeup.webp", comment: "今日もがんばるぞ！", rotate: "-2deg" },
  { time: "7:42", label: "メンターからの\nコメントを確認", image: "/images/nobilva/dayflow/0742-check-mentor.webp", comment: "今日は英単語からね", rotate: "1.5deg" },
  { time: "8:05", label: "学校へ", image: "/images/nobilva/dayflow/0805-school.webp", comment: "いってきまーす！", rotate: "-1deg" },
  { time: "15:40", label: "練習開始", image: "/images/nobilva/dayflow/1540-practice.webp", comment: "声出していこう！", rotate: "2deg" },
  { time: "20:29", label: "帰宅→夕食", image: "/images/nobilva/dayflow/2029-dinner.webp", comment: "お腹すいた〜！", rotate: "-1.5deg" },
  { time: "21:15", label: "メンターのコメント\nに従って勉強", image: "/images/nobilva/dayflow/2115-study.webp", comment: "集中、集中…！", rotate: "1deg" },
  { time: "22:38", label: "メンターに\n今日の進捗を送る", image: "/images/nobilva/dayflow/2238-report.webp", comment: "今日もやりきった！", rotate: "-2.5deg" },
  { time: "23:35", label: "風呂→就寝", image: "/images/nobilva/dayflow/2335-sleep.webp", comment: "おやすみ〜", rotate: "1.5deg" },
];

export function DayFlowSection() {
  return (
    <Section>
      <SectionHeading center>Nobilvaユーザーの一日</SectionHeading>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6">
        {moments.map((m, i) => (
          <div key={i} className="relative flex flex-col items-center">
            {/* 漫画風吹き出し */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              style={{ rotate: m.rotate }}
            >
              <div className="manga-bubble relative bg-white border-[2.5px] border-gray-900 rounded-[14px] px-2.5 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]">
                <span className="text-[10px] md:text-xs font-bold text-gray-900 whitespace-nowrap leading-tight">
                  {m.comment}
                </span>
                {/* 吹き出しの尾（しっぽ） */}
                <svg
                  className="absolute -bottom-[10px] left-1/2 -translate-x-1/2"
                  width="20" height="12" viewBox="0 0 20 12" fill="none"
                >
                  <path d="M0 0 L10 11 L20 0" fill="white" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
                  <rect x="1" y="0" width="18" height="3" fill="white" />
                </svg>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
              <Image
                src={m.image}
                alt={m.label.replace("\n", "")}
                fill
                className="object-cover brightness-[1.15]"
              />
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="bg-white border-[2px] border-gray-900 px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] min-w-[130%]">
                  <span className="block text-lg md:text-xl font-black text-orange-500 text-center leading-tight">
                    {m.time}
                  </span>
                  <span className="block text-[9px] md:text-[11px] font-bold text-gray-700 leading-snug whitespace-pre-line text-center">
                    {m.label}
                  </span>
                </div>
              </div>
            </div>
            {/* モバイル: 2列の間の矢印 */}
            {i < moments.length - 1 && i % 2 !== 1 && (
              <span className="absolute top-1/2 -right-2.5 md:hidden -translate-y-1/2 select-none z-10">
                <svg width="16" height="14" viewBox="0 0 24 14" fill="none">
                  <path d="M2 7H20M20 7L14 2M20 7L14 12" stroke="#ea5614" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
            {/* PC: 4列の間の矢印 */}
            {i < moments.length - 1 && i % 4 !== 3 && (
              <span className="absolute top-1/2 -right-4 hidden md:block -translate-y-1/2 select-none z-10">
                <svg width="22" height="18" viewBox="0 0 24 14" fill="none">
                  <path d="M2 7H20M20 7L14 2M20 7L14 12" stroke="#ea5614" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-12 md:mt-16">
        <p className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
          あなたの場合はどうなる！？
        </p>
        <DiagnosisCTA label="無料でシミュレーションしてみる" />
      </div>
    </Section>
  );
}
