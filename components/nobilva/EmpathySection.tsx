export function EmpathySection() {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center">
          {/* 左側: 写真風画像（プレースホルダー） */}
          <div className="w-full md:w-2/5 aspect-[4/5] bg-gradient-to-b from-nobilva-light to-amber-50 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="text-center text-gray-400 text-sm p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200" />
              Adobe Firefly Web
              <br />
              机に並んだ野球グローブと教科書
              <br />
              夕方の自然光・顔なし
            </div>
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
                野球をがんばる中高生の、将来の選択肢を広げる。
                <br className="hidden md:inline" />
                専属メンターが1人ひとりに合わせて、
                <br className="hidden md:inline" />
                毎週の計画から日々の実行まで完全サポート。
              </p>

              <p>
                近年、推薦・内申の比重が上がり、
                <br className="hidden md:inline" />
                &ldquo;成績が足りない&rdquo; ことで希望進路を諦めるケースが増えています。
              </p>

              <p>
                練習で疲れて、机に向かう体力が残らない。
                <br className="hidden md:inline" />
                遠征で授業を欠席し、戻った頃には授業が先に進んでいる。
                <br className="hidden md:inline" />
                気づけば、勉強の時間も気力も、削られていく。
              </p>

              <p>そんな日々を過ごす中高生のために。</p>

              <p>
                Nobilva は、野球に全力で取り組む中高生を、
                <br className="hidden md:inline" />
                勉強を「続けられる仕組み」で支える学習サポートです。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
