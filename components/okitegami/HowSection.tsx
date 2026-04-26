import {
  PhoneMockup,
  ComposeScreenPlaceholder,
  NotificationScreenPlaceholder,
  ReadScreenPlaceholder,
} from "./PhoneMockup";

const steps = [
  {
    number: "01",
    title: "置く",
    body: "今いる場所で、アプリを開いてひとことを書く。\n誰かに送るほどじゃない、でも残しておきたい言葉を、その場所に置いていく。",
    mockup: <ComposeScreenPlaceholder />,
    mockupAlt: "投稿作成画面",
  },
  {
    number: "02",
    title: "見つける",
    body: "友達の置き手紙に500m以内まで近づくと、通知が届く。\n地図を開いて、その場所へ向かう。近づくほど、投稿が鮮明になっていく。",
    mockup: <NotificationScreenPlaceholder />,
    mockupAlt: "通知・マップ画面",
  },
  {
    number: "03",
    title: "読む",
    body: "その場所に立ったとき、初めて読める。\nいつ届くかはわからない。届くかどうかもわからない。その偶然が、感情を動かす。",
    note: "置き手紙は半径500m以内に近づくと読めるようになります",
    mockup: <ReadScreenPlaceholder />,
    mockupAlt: "投稿閲覧画面",
  },
];

export function HowSection() {
  return (
    <section className="bg-okitegami-paper py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-okitegami-dusk text-center mb-16">
          どうやって使うの？
        </h2>

        <div className="space-y-20">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 md:gap-16`}
            >
              {/* テキスト */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-okitegami-sun flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">{step.number}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-okitegami-dusk">{step.title}</h3>
                </div>
                <p className="text-base md:text-lg text-okitegami-dusk/80 leading-relaxed whitespace-pre-line pl-16">
                  {step.body}
                </p>
                {step.note && (
                  <p className="text-sm text-okitegami-dusk/50 pl-16">※ {step.note}</p>
                )}
              </div>

              {/* 仮スクショ（差し替え可） */}
              <PhoneMockup alt={step.mockupAlt}>
                {step.mockup}
              </PhoneMockup>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
