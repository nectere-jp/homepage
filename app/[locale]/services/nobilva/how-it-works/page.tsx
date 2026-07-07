import type { Metadata } from "next";
import Image from "next/image";
import { CTABanner } from "@/components/nobilva/CTABanner";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "サービスの仕組み - Nobilva | Nectere",
    description:
      "Nobilva の三本柱「日割り学習計画・週1回オンライン面談・毎日の進捗確認」の仕組みをすべて開示します。何が含まれて、メンターは何をして、ご家庭は何を準備すればよいのか。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/how-it-works"),
      languages: getAlternatesLanguages("/services/nobilva/how-it-works"),
    },
  };
}

export default function HowItWorksPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero: LP トップと同じ画像 */}
      <section className="bg-white pb-4">
        <div className="px-5 pt-5">
          <div className="relative aspect-[3/1] md:aspect-[4/1] rounded-2xl overflow-hidden">
            <Image
              src="/images/nobilva/hero.jpg"
              alt="ベンチで単語帳を読む野球部員"
              fill
              priority
              className="object-cover object-top"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 md:px-12 lg:px-16 flex items-center gap-2 md:gap-3">
                <Image
                  src="/images/logo_nobilva.png"
                  alt="Nobilva"
                  width={300}
                  height={72}
                  className="h-12 md:h-14 lg:h-16 w-auto"
                />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                  の指導方針
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nobilvaが目指すのは */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl lg:text-4xl font-black text-center text-gray-900 mb-4 md:mb-6">
            <Image
              src="/images/logo_nobilva.png"
              alt="Nobilva"
              width={300}
              height={72}
              className="h-12 md:h-14 lg:h-16 w-auto"
            />
            が目指すのは、
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="relative bg-nobilva-main/20 p-8 md:p-10 text-right overflow-hidden flex flex-col justify-center">
              <Image
                src="/images/nobilva/from_back.png"
                alt="Nobilvaユニフォームの選手"
                width={300}
                height={400}
                className="absolute left-0 -bottom-4 md:-bottom-6 h-full w-auto object-contain object-left-bottom opacity-30 md:opacity-100 pointer-events-none"
              />
              <div className="relative z-10">
                <p className="text-xl md:text-2xl font-black text-gray-900 mb-3">
                  野球で忙しくても
                </p>
                <p className="flex flex-wrap gap-0.5 md:gap-1 justify-end">
                  {"勉強の".split("").map((char, i) => (
                    <span
                      key={i}
                      className="bg-nobilva-main text-gray-900 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-black"
                    >
                      {char}
                    </span>
                  ))}
                  {"習慣".split("").map((char, i) => (
                    <span
                      key={i}
                      className="bg-nobilva-accent text-white w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-black"
                    >
                      {char}
                    </span>
                  ))}
                </p>
                <p className="text-xl md:text-2xl font-black text-gray-900 mt-2">
                  をつける
                </p>
              </div>
            </div>
            <div className="relative bg-nobilva-main/20 p-8 md:p-10 text-left flex flex-col justify-center overflow-hidden">
              <Image
                src="/images/nobilva/happy.png"
                alt="制服姿の学生"
                width={400}
                height={500}
                className="absolute right-0 bottom-0 h-full w-auto object-contain object-right-bottom opacity-30 md:opacity-100 pointer-events-none"
              />
              <div className="relative z-10 mb-2">
                <p className="flex gap-0.5 md:gap-1 justify-start">
                  {"オール3".split("").map((char, i) => (
                    <span
                      key={i}
                      className="bg-nobilva-main text-gray-900 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-black"
                    >
                      {char}
                    </span>
                  ))}
                </p>
                <p className="flex gap-0.5 md:gap-1 justify-start mt-0.5 md:mt-1">
                  {"死守".split("").map((char, i) => (
                    <span
                      key={i}
                      className="bg-nobilva-accent text-white w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-black"
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>
              <p className="relative z-10 text-xl md:text-2xl font-black text-gray-900">
                で<span className="underline decoration-nobilva-accent decoration-4 underline-offset-4">将来の選択肢</span>を狭めない
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* そのために... Nobilvaの二大柱 */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
          <p className="text-base md:text-lg font-bold text-center text-gray-500 mb-2">
            そのために...
          </p>

          <h3 className="flex items-end justify-center gap-2 md:gap-3 text-2xl md:text-4xl lg:text-5xl font-black text-center text-gray-900 mb-8 md:mb-10">
            <Image
              src="/images/logo_nobilva.png"
              alt="Nobilva"
              width={400}
              height={96}
              className="h-10 md:h-14 lg:h-16 w-auto translate-y-[6px] md:translate-y-[8px]"
            />
            <span className="text-lg md:text-2xl lg:text-3xl">の</span>
            <span className="inline-flex gap-0 text-xl md:text-3xl lg:text-4xl">
              {"二大柱".split("").map((char, i) => (
                <span key={i} className="inline-flex flex-col items-center">
                  <span className="text-nobilva-accent text-[0.35em] leading-none mb-0.5">●</span>
                  <span>{char}</span>
                </span>
              ))}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* 柱1: 日割り学習計画 */}
            <div className="relative bg-white p-8 md:p-10 border-4 border-nobilva-main overflow-hidden">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 400 500"
                aria-hidden="true"
              >
                <polygon points="0,0 140,0 40,200" className="fill-nobilva-main" opacity="0.08" />
                <polygon points="300,0 400,0 400,150 350,80" className="fill-nobilva-main" opacity="0.06" />
                <polygon points="0,380 100,500 0,500" className="fill-nobilva-main" opacity="0.10" />
                <polygon points="320,420 400,340 400,500 360,500" className="fill-nobilva-main" opacity="0.07" />
              </svg>
              <div className="relative z-10">
                <p className="text-sm md:text-base font-bold text-gray-900 mb-1">
                  週1オンライン面談で練習日程に合わせた
                </p>
                <p className="mb-1">
                  <span className="bg-nobilva-accent text-white text-xl md:text-2xl font-black px-2 py-0.5">日割り学習計画</span>
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">
                  専属メンターが、野球の練習スケジュール・得意不得意・学校の進度を踏まえて、1週間分の日割り学習計画を作成します。
                </p>
                <div className="relative mt-4">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg font-bold">学習計画の例</span>
                  </div>
                  <div
                    className="absolute -top-4 -left-3 md:-left-4 bg-nobilva-main text-gray-900 font-black text-sm md:text-base px-4 py-2 shadow-lg z-10"
                    style={{ transform: "rotate(-6deg)" }}
                  >
                    具体的な計画で<br />やることを明確化
                    <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-nobilva-main" style={{ transform: "rotate(45deg)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 柱2: 毎日の進捗確認 */}
            <div className="relative bg-white p-8 md:p-10 border-4 border-nobilva-main overflow-hidden">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 400 500"
                aria-hidden="true"
              >
                <polygon points="0,0 140,0 40,200" className="fill-nobilva-main" opacity="0.08" />
                <polygon points="300,0 400,0 400,150 350,80" className="fill-nobilva-main" opacity="0.06" />
                <polygon points="0,380 100,500 0,500" className="fill-nobilva-main" opacity="0.10" />
                <polygon points="320,420 400,340 400,500 360,500" className="fill-nobilva-main" opacity="0.07" />
              </svg>
              <div className="relative z-10">
                <p className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                  毎日チャットで
                  <span className="bg-nobilva-accent text-white text-xl md:text-2xl font-black px-2 py-0.5">進捗確認</span>
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">
                  毎日チャットでひとこと報告。メンターが24時間以内に返信し、必要に応じて翌日の計画を調整します。
                </p>
                <div className="relative mt-4">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg font-bold">画面の例</span>
                  </div>
                  <div
                    className="absolute -top-4 -right-3 md:-right-4 bg-nobilva-main text-gray-900 font-black text-sm md:text-base px-4 py-2 shadow-lg z-10"
                    style={{ transform: "rotate(4deg)" }}
                  >
                    毎日の継続を促す！
                    <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-nobilva-main" style={{ transform: "rotate(45deg)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* さらに... 成長を続けるための3つの指針 */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-center text-gray-900 mb-8 md:mb-12">
            さらに... 成長を続けるための<span className="bg-nobilva-main px-1">3つの指針</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "学校の時間\n最大限に生かす。",
                description:
                  "学校の授業・宿題・小テストを最大限活用する計画を立てます。塾のように「別の教材をやる」のではなく、学校で配られた教材を中心に据えることで、学校の成績に直結する学習を実現します。",
              },
              {
                title: "ご家庭との\n役割分担を明確化",
                description:
                  "計画作成・進捗管理・振り返りはすべてメンターが担当。ご家庭にお願いするのは「学習時間の確保」と「スケジュール共有」だけ。共働き・送迎で忙しいご家庭でも無理なく続けられます。",
              },
              {
                title: "強制ではなく\n習慣づくり",
                description:
                  "「やらされる勉強」ではなく「自分で決めた計画をこなす」感覚を育てます。できなかった日も責めず、週1回の面談で理由を一緒に整理。数ヶ月かけて、その生徒に合ったリズムが育っていきます。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 p-6 md:p-8 flex flex-col"
              >
                <h3 className="text-lg md:text-xl font-black text-gray-900 whitespace-pre-line mb-4">
                  {item.title}
                </h3>
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-sm font-bold">画像</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA バナー（中間） */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
        <CTABanner />
      </div>

      {/* 1週間の流れ */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-center text-gray-900 mb-2">
            <span className="bg-nobilva-main px-2">1週間の流れ</span>
          </h2>
          <p className="text-sm text-gray-500 text-center mb-10">（一例）</p>

          <div className="space-y-6">
            {[
              {
                day: "土",
                title: "オンライン面談（30分）",
                description:
                  "専属メンターと週1回のオンライン面談。1週間の振り返り・課題の分解・来週の計画方針を30分で整理します。面談メモはチャットで共有。保護者の方は希望があれば最後の5分のみ同席可能です。",
              },
              {
                day: "日",
                title: "翌週の計画が届く",
                description:
                  "面談を踏まえて、メンターが翌週分の日割り学習計画を作成。練習日程・試合予定に合わせた量の調整を行い、チャットで送信します。各日の科目・教材ページ・問題番号・所要時間目安まで具体的に記載されます。",
              },
              {
                days: ["月", "火", "水", "木", "金"],
                title: "計画に沿って勉強を進める",
                description:
                  "練習から帰宅後、日割りに沿って1日15〜30分の学習。夜にチャットで進捗報告（短文でOK）。メンターは24時間以内に返信し、詰まった問題には類題を指定。試合や遠征の日は計画を軽めに再調整します。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-center"
              >
                {/* 曜日 */}
                <div className="flex md:flex-col gap-1 items-center w-10 md:w-12">
                  {"days" in item && item.days ? (
                    item.days.map((d) => (
                      <span
                        key={d}
                        className="w-6 h-6 md:w-7 md:h-7 bg-gray-400 text-white text-xs font-black flex items-center justify-center"
                      >
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className={`w-8 h-8 md:w-10 md:h-10 text-white text-sm md:text-base font-black flex items-center justify-center ${item.day === "土" ? "bg-blue-600" : item.day === "日" ? "bg-red-600" : "bg-gray-900"}`}>
                      {item.day}
                    </span>
                  )}
                </div>
                {/* テキスト */}
                <div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {/* 画像プレースホルダ */}
                <div className="w-48 md:w-56 aspect-[2/1] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">画像</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* こんなご家庭におすすめ！ */}
      <section className="bg-nobilva-light py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-center text-gray-900 mb-10 md:mb-14">
            こんなご家庭におすすめ！
          </h2>

          {/* モバイル: カード縦積み + 画像 */}
          <div className="md:hidden space-y-4">
            {[
              <>自分で計画を立てても<br /><span className="text-nobilva-accent">続かない</span>...</>,
              <><span className="text-nobilva-accent">内申点</span>が<br />思うように上がらない...</>,
              <><span className="text-nobilva-accent">野球は本気で</span><br />続けさせてあげたい...</>,
              <>推薦も一般も<br /><span className="text-nobilva-accent">選択肢を残したい</span>...</>,
              <><span className="text-nobilva-accent">練習で疲れて</span><br />家で勉強できない...</>,
              <>勉強させようとすると<br /><span className="text-nobilva-accent">親子喧嘩</span>に...</>,
            ].map((text, i) => (
              <div key={i} className="bg-white px-6 py-5 shadow-sm text-center">
                <p className="text-sm font-bold text-gray-800 leading-relaxed">{text}</p>
              </div>
            ))}
            <div className="relative aspect-[3/4] mt-4">
              <Image
                src="/images/nobilva/onayami.png"
                alt="野球と勉強の両立に悩む親子"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* PC: 扇形配置 — 画像が中央、お悩みが囲む */}
          <div className="hidden md:block">
            <div className="flex justify-center gap-24 lg:gap-36 mb-6 lg:mb-8">
              <div className="bg-white px-8 md:px-10 py-4 shadow-sm text-center">
                <p className="text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-relaxed">
                  自分で計画を立てても<br /><span className="text-nobilva-accent">続かない</span>...
                </p>
              </div>
              <div className="bg-white px-8 md:px-10 py-4 shadow-sm text-center">
                <p className="text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-relaxed">
                  <span className="text-nobilva-accent">内申点</span>が<br />思うように上がらない...
                </p>
              </div>
            </div>

            <div className="flex justify-between items-start px-4 lg:px-8 -mb-6 lg:-mb-8">
              <div className="bg-white px-8 md:px-10 py-4 shadow-sm text-center">
                <p className="text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-relaxed">
                  <span className="text-nobilva-accent">野球は本気で</span><br />続けさせてあげたい...
                </p>
              </div>
              <div className="bg-white px-8 md:px-10 py-4 shadow-sm text-center">
                <p className="text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-relaxed">
                  推薦も一般も<br /><span className="text-nobilva-accent">選択肢を残したい</span>...
                </p>
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div className="bg-white px-8 md:px-10 py-4 shadow-sm text-center mb-24">
                <p className="text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-relaxed">
                  <span className="text-nobilva-accent">練習で疲れて</span><br />家で勉強できない...
                </p>
              </div>
              <div className="w-2/5 max-w-sm mx-auto relative">
                <div className="relative aspect-[3/4] -my-16 lg:-my-24">
                  <Image
                    src="/images/nobilva/onayami.png"
                    alt="野球と勉強の両立に悩む親子"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="bg-white px-8 md:px-10 py-4 shadow-sm text-center mb-24">
                <p className="text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-relaxed">
                  勉強させようとすると<br /><span className="text-nobilva-accent">親子喧嘩</span>に...
                </p>
              </div>
            </div>
          </div>
          {/* 逆に、このような家庭には合いません */}
          <div className="max-w-2xl mx-auto mt-20 md:mt-28">
            <div className="bg-white p-8 md:p-10 text-center">
              <h3 className="text-lg md:text-xl font-black text-gray-900 mb-6">
                逆に、このような家庭には合いません
              </h3>
              <ul className="space-y-3 text-left inline-block">
                {[
                  "短期間で急速に成績をあげたい",
                  "保護者が監視したい",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-base md:text-lg font-bold text-gray-800"
                  >
                    <span className="text-red-500 text-xl">&#10005;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 最終 CTA バナー */}
      <section className="bg-white pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
          <CTABanner variant="final" />
        </div>
      </section>
    </div>
  );
}

