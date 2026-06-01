import { OutlineLink } from "./OutlineLink";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import {
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import type { IconType } from "react-icons";

interface Pillar {
  icon: IconType;
  name: string;
  subtitle: string;
  description: string[];
  relatedConcerns: number[];
}

const pillars: Pillar[] = [
  {
    icon: HiOutlineCalendar,
    name: "日割り学習計画",
    subtitle: "週末ではなく「明日のやること」を、メンターと作る。",
    description: [
      "練習スケジュールと得意・苦手を踏まえて、メンターが翌週の日割り計画を作成。",
      "毎週調整するため、遠征・試合期・テスト前後でも無理なく続けられます。",
      "「何から手をつければいいかわからない」状態が、毎朝なくなります。",
    ],
    relatedConcerns: [1, 2, 6],
  },
  {
    icon: HiOutlineVideoCamera,
    name: "週1回オンライン面談",
    subtitle: "30分の面談で、計画と気持ちを整える。",
    description: [
      "専属メンターと毎週30分、Zoomで対話。",
      "進捗の振り返り、来週の計画、進路の不安まで一緒に整理します。",
      "「迷ったら週1回、必ず話せる人がいる」状態を作ります。",
    ],
    relatedConcerns: [4, 6],
  },
  {
    icon: HiOutlineChatAlt2,
    name: "毎日の進捗確認",
    subtitle: "やった／やれなかったを、毎日メンターと共有する。",
    description: [
      "専用チャットで、その日の学習結果をひとこと報告。",
      "続かない日は理由を一緒に分解、できた日はちゃんと積み上げます。",
      "「自分ひとりで頑張る」ではない毎日になります。",
    ],
    relatedConcerns: [1, 3, 6],
  },
];

export function ThreePillarsSection() {
  return (
    <Section id="how-we-work">
      {/* リード文 */}
      <SectionHeading center className="mb-6" description={
        <p>
          派手なサービスを増やすのではなく、続けられる仕組みを、確実に回すこと。
          <br className="hidden md:inline" />
          それが、忙しい中高生の毎日を、一番遠くまで運んでくれると考えています。
        </p>
      }>Nobilva は、/3つの仕組みで/できています。</SectionHeading>

      {/* 三本柱 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <div
              key={index}
              className="bg-nobilva-light rounded-2xl p-6 md:p-8"
            >
              {/* アイコン */}
              <div className="w-14 h-14 rounded-full bg-nobilva-main/30 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-nobilva-accent" />
              </div>

              {/* 柱名 */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {pillar.name}
              </h3>

              {/* サブタイトル */}
              <p className="text-sm md:text-base text-nobilva-accent font-medium mb-4">
                {pillar.subtitle}
              </p>

              {/* 説明 */}
              <div className="space-y-2">
                {pillar.description.map((line, i) => (
                  <p
                    key={i}
                    className="text-sm md:text-base text-gray-700 leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* 関連する悩み */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  関連する悩み：
                  {pillar.relatedConcerns.map((num, i) => (
                    <span key={num}>
                      {i > 0 && " "}
                      <a
                        href={`#concern-${num}`}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-nobilva-main/40 text-xs font-bold text-gray-700 hover:bg-nobilva-main hover:scale-110 transition-all"
                      >
                        {num}
                      </a>
                    </span>
                  ))}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 詳細ページリンク */}
      <div className="text-center mt-10">
        <OutlineLink href="/ja/services/nobilva/how-it-works">
          仕組みの詳細を見る
        </OutlineLink>
      </div>
    </Section>
  );
}
