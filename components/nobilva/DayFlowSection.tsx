import Image from "next/image";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { DiagnosisCTA } from "./DiagnosisCTA";

const moments = [
  { time: "7:20", label: "起床→朝食", image: "/images/nobilva/dayflow/0720-wakeup.webp" },
  { time: "7:42", label: "メンターからの\nコメントを確認", image: "/images/nobilva/dayflow/0742-check-mentor.webp" },
  { time: "8:05", label: "学校へ", image: "/images/nobilva/dayflow/0805-school.webp" },
  { time: "15:40", label: "練習開始", image: "/images/nobilva/dayflow/1540-practice.webp" },
  { time: "20:29", label: "帰宅→夕食", image: "/images/nobilva/dayflow/2029-dinner.webp" },
  { time: "21:15", label: "メンターのコメント\nに従って勉強", image: "/images/nobilva/dayflow/2115-study.webp" },
  { time: "22:38", label: "メンターに\n今日の進捗を送る", image: "/images/nobilva/dayflow/2238-report.webp" },
  { time: "23:35", label: "風呂→就寝", image: "/images/nobilva/dayflow/2335-sleep.webp" },
];

export function DayFlowSection() {
  return (
    <Section>
      <SectionHeading center>Nobilvaユーザーの一日</SectionHeading>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {moments.map((m, i) => (
          <div key={i} className="relative flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
              <Image
                src={m.image}
                alt={m.label.replace("\n", "")}
                fill
                className="object-cover brightness-[1.15]"
              />
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-xl md:text-2xl font-medium text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                  {m.time}
                </span>
                <span className="text-[10px] md:text-xs text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)] leading-snug whitespace-pre-line text-center">
                  {m.label}
                </span>
              </div>
            </div>
            {i < moments.length - 1 && i % 2 !== 1 && (
              <span className="absolute top-1/2 -right-3 md:hidden -translate-y-1/2 text-nobilva-accent text-lg font-bold select-none">
                &gt;
              </span>
            )}
            {i < moments.length - 1 && i % 4 !== 3 && (
              <span className="absolute top-1/2 -right-4 hidden md:block -translate-y-1/2 text-nobilva-accent text-xl font-bold select-none">
                &gt;
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
