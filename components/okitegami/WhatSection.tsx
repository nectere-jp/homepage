import { PhoneMockup, MapScreenPlaceholder } from "./PhoneMockup";

export function WhatSection() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* テキスト */}
        <div className="flex-1 space-y-8">
          {/* 具体的な説明（初見の人向け） */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-okitegami-dusk leading-tight mb-8">
              タイムラインのない、<br />地図を歩くSNS
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-loose">
              okitegamiに投稿すると、その言葉は<strong className="text-okitegami-dusk">地図上の特定の場所</strong>に紐づきます。
              友達の投稿は、その場所に<strong className="text-okitegami-dusk">半径500m以内まで近づいたとき</strong>に、はじめて読めるようになります。
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-loose">
              タイムラインをスクロールする必要はありません。
              日常の移動の中でふと通知が届いて、気づいたら近くに友達の言葉がある。そんな偶然の出会いを楽しむアプリです。
            </p>
          </div>

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
