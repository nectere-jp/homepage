import { PhoneMockup, MapScreenPlaceholder } from "./PhoneMockup";

export function WhatSection() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* テキスト */}
        <div className="flex-1 space-y-8">
          {/* 具体的な説明（初見の人向け） */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-okitegami-dusk">
              タイムラインのない、<br />地図を歩くSNS
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-loose">
              okitegamiに投稿すると、その言葉は<strong className="text-okitegami-dusk">地図上の特定の場所</strong>に紐づきます。
              友達の投稿は、その場所に<strong className="text-okitegami-dusk">半径500m以内まで近づいたとき</strong>に、はじめて読めるようになります。
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-loose">
              フィードをスクロールする必要はありません。
              通知を受け取ったら、地図を開いて、その場所へ歩いていくだけです。
            </p>
          </div>

          <div className="w-12 h-1 bg-okitegami-sun rounded-full" />

          {/* 詩的なコピー */}
          <p className="text-xl md:text-2xl font-bold text-okitegami-dusk leading-relaxed">
            友達が、街のどこかに言葉を残している。<br />
            その言葉は、その場所に行かないと読めない。<br />
            だから今日も、街を歩く。
          </p>
        </div>

        {/* 仮スクショ（差し替え可） */}
        <div className="flex-shrink-0">
          <PhoneMockup alt="okitegami マップ一覧画面">
            <MapScreenPlaceholder />
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}
