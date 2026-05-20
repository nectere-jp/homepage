import { OutlineLink } from "./OutlineLink";
import { SectionHeading } from "./SectionHeading";

export function CareerPathSection() {
  return (
    <section className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          {/* 左: 画像プレースホルダー */}
          <div className="w-full md:w-2/5 aspect-video md:aspect-auto bg-gradient-to-br from-amber-50 to-nobilva-light flex items-center justify-center min-h-[200px]">
            <div className="text-center text-gray-400 text-sm p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200" />
              Adobe Firefly Web
              <br />
              午後の自然光に照らされた校舎・図書室
            </div>
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
      </div>
    </section>
  );
}
