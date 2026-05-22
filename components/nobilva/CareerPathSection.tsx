import Image from "next/image";
import { OutlineLink } from "./OutlineLink";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

export function CareerPathSection() {
  return (
    <Section bg="light">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          {/* 左: 画像 */}
          <div className="w-full md:w-2/5 aspect-video md:aspect-auto relative min-h-[200px]">
            <Image
              src="/images/nobilva/library-study.jpg"
              alt="図書室で勉強する野球部員の後ろ姿"
              fill
              className="object-cover"
            />
          </div>

          {/* 右: テキスト */}
          <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
            <SectionHeading className="mb-4 leading-snug">スポーツ推薦も、/一般進学も、/両方の選択肢を/残したい方へ。</SectionHeading>

            <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">
              野球をがんばる中高生の進路は、スポーツ推薦・指定校推薦・公募推薦・総合型選抜・一般入試と、複数の道があります。
              それぞれの準備のタイミングと条件を整理した進路ガイドを公開しています。
            </p>

            <OutlineLink href="/ja/services/nobilva/career-path">
              進路ガイドを読む
            </OutlineLink>
          </div>
      </div>
    </Section>
  );
}
