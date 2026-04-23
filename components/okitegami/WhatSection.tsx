export function WhatSection() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <p className="text-2xl md:text-3xl font-bold text-okitegami-dusk leading-relaxed">
          友達が、街のどこかに言葉を残している。
          <br />
          その言葉は、その場所に行かないと読めない。
          <br />
          だから今日も、街を歩く。
        </p>

        <div className="w-16 h-1 bg-okitegami-sun mx-auto rounded-full" />

        <p className="text-lg md:text-xl text-gray-600 leading-loose">
          okitegamiは、場所に言葉を置くSNSです。
          <br />
          タイムラインを眺めるアプリではありません。
          <br />
          地図を歩くアプリです。
        </p>
      </div>
    </section>
  );
}
