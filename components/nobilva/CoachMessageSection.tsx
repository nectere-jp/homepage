import Image from "next/image";
import { DiagnosisCTA } from "./DiagnosisCTA";

export function CoachMessageSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex justify-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight">
            ヘッドコーチからのメッセージ
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* アバター */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/images/nobilva/ryuto.svg"
                alt="中村龍人"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center mt-3">
              <p className="text-sm text-gray-500">ヘッドコーチ</p>
              <p className="font-bold text-gray-900">中村龍人</p>
              <p className="text-xs text-gray-500">東京大学 計数工学科</p>
            </div>
          </div>

          {/* メッセージ */}
          <div className="flex-1 space-y-4 text-base md:text-lg text-gray-700 leading-relaxed md:leading-loose">
            <p>こんにちは。学習ヘッドコーチの中村龍人です。</p>

            <p>
              私は、高校3年生の9月までブラスバンド部で活動を続けて、引退後に本格的に受験勉強へ切り替えました。やりたいことと、進路のために必要なことを並行で進める難しさは、自分の身体でわかっているつもりです。
            </p>

            <p>
              小学生の頃には野球をやっていた時期もあります。練習で疲れて帰ってきて、宿題に手をつける気力が残らない感覚は、いまも覚えています。
            </p>

            <p>
              続けられない自分を責めるのではなく、続けられる仕組みを外側に作ること。それが結局、自分一人で頑張るより遠くまで連れて行ってくれる——Nobilva
              はその実感をもとに始めました。
            </p>

            <p>
              野球をがんばる中高生が、進路の選択肢を最後まで残せるよう、毎週の面談と毎日のチャットで、メンターが一人ひとりに伴走します。
            </p>

            <p>
              「この子に合った計画を、一緒に考えてほしい」
              <br />
              そう思った時に、思い出していただけるサービスでありたいと思っています。
            </p>

            <p>まずは無料学習診断で、お子さんのことを聞かせてください。</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <DiagnosisCTA />
        </div>
      </div>
    </section>
  );
}
