const steps = [
  {
    number: "01",
    title: "置く",
    body: "今いる場所に、ひとことを残す。\n誰かに送るほどじゃない。\nでも、残しておきたい。\nそんな言葉を、街に置いていく。",
  },
  {
    number: "02",
    title: "見つける",
    body: "友達の置き手紙に近づくと、\n通知が届く。\n\n「近くに友達の置き手紙があります」\n\n地図を開いて、その場所へ向かう。",
  },
  {
    number: "03",
    title: "読む",
    body: "その場所に立ったとき、初めて読める。\n\nいつ届くかは、わからない。\n届くかどうかも、わからない。\nその偶然が、感情を動かす。",
    note: "置き手紙は半径500m以内に近づくと読めるようになります",
  },
];

export function HowSection() {
  return (
    <section className="bg-okitegami-paper py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-okitegami-dusk text-center mb-16">
          どうやって使うの？
        </h2>

        <div className="space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-8 items-start">
              {/* 番号 */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-okitegami-sun flex items-center justify-center">
                <span className="text-white font-black text-lg">{step.number}</span>
              </div>

              {/* コンテンツ */}
              <div className="flex-1 pt-3 space-y-3">
                <h3 className="text-2xl font-black text-okitegami-dusk">{step.title}</h3>
                <p className="text-base md:text-lg text-okitegami-dusk/80 leading-relaxed whitespace-pre-line">
                  {step.body}
                </p>
                {step.note && (
                  <p className="text-sm text-okitegami-dusk/50">※ {step.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
