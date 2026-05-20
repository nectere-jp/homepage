import Image from "next/image";
import { wb } from "@/lib/wb";

export function EmpathySection() {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center">
          {/* 左側: 写真風画像（プレースホルダー） */}
          <div className="w-full md:w-2/5 aspect-[4/5] relative rounded-2xl overflow-hidden">
            <Image
              src="/images/nobilva/hero-desk.jpg"
              alt="机に並んだ野球グローブと教科書"
              fill
              className="object-cover"
            />
          </div>

          {/* 右側: テキスト */}
          <div className="w-full md:w-3/5 space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight text-center md:text-left">
              <span className="text-nobilva-accent">&ldquo;学校の成績が足りない&rdquo;</span>で
              <br />
              チャンスを逃すわけに
              <br />
              いかないから。
            </h2>

            <div className="border-t border-gray-200 pt-6 md:pt-8 space-y-4 text-base md:text-lg text-gray-700 leading-relaxed md:leading-loose">
              <p className="font-medium text-gray-900">
                {wb("野球をがんばる中高生の、/将来の選択肢を広げる。")}
                <br className="hidden md:inline" />
                {wb("専属メンターが/1人ひとりに合わせて、")}
                <br className="hidden md:inline" />
                {wb("毎週の計画から/日々の実行まで完全サポート。")}
              </p>

              <p>
                {wb("近年、推薦・内申の比重が上がり、")}
                <br className="hidden md:inline" />
                {wb("\u201C成績が足りない\u201D ことで/希望進路を諦めるケースが/増えています。")}
              </p>

              <p>
                {wb("練習で疲れて、/机に向かう体力が残らない。")}
                <br className="hidden md:inline" />
                {wb("遠征で授業を欠席し、/戻った頃には授業が先に進んでいる。")}
                <br className="hidden md:inline" />
                {wb("気づけば、/勉強の時間も気力も、/削られていく。")}
              </p>

              <p>{wb("そんな日々を過ごす/中高生のために。")}</p>

              <p>
                {wb("Nobilva は、/野球に全力で取り組む中高生を、")}
                <br className="hidden md:inline" />
                {wb("勉強を「続けられる仕組み」で/支える学習サポートです。")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
