"use client";

import { useState } from "react";
import Image from "next/image";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { SectionHeading } from "@/components/nobilva/SectionHeading";
import { Section } from "@/components/nobilva/Section";
import { EmpathySection } from "@/components/nobilva/EmpathySection";
import { ConcernsSection } from "@/components/nobilva/ConcernsSection";
import { PricingSection, ESSENTIAL_PRICE } from "@/components/nobilva/PricingSection";
import { LINE_ADD_URL } from "@/lib/constants";

const TEAM_DISCOUNT = 2000;

export default function ForTeamsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー (PDF p1) — Nobilva トップと統一 */}
      <ForTeamsHero />

      {/* 2. オール3死守 (PDF p2) — トップ流用 */}
      <EmpathySection />

      {/* 3. 選手・保護者の悩み (PDF p6) — オール3死守の次で「なぜ必要か」を提示 */}
      <ConcernsSection
        heading={
          <>
            選手や保護者は
            <span className="text-nobilva-accent">こんなお悩み</span>
            を...
          </>
        }
      />
      <section className="bg-white pt-2 md:pt-4 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 text-center">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight md:leading-snug break-keep">
            <Image
              src="/images/logo_nobilva.png"
              alt="Nobilva"
              width={320}
              height={80}
              className="inline-block h-12 md:h-16 lg:h-20 w-auto align-middle -translate-y-1 md:-translate-y-1.5 mr-2"
            />
            のご紹介が<wbr />
            <br className="md:hidden" />
            ご家庭への<wbr />
            <span className="bg-nobilva-main px-2 py-0.5 mx-1">大きなアピール</span>
            に！
          </p>
        </div>
      </section>

      {/* 4. サービスの2本柱 (PDF p3) */}
      <TwoPillarsSection />

      {/* 5. 3つの指針 (PDF p4) */}
      <ThreeGuidelinesSection />

      {/* 6. 料金プラン (PDF p5) — トップ流用 (team価格) */}
      <PricingSection
        team={{
          essentialSpecial: ESSENTIAL_PRICE - TEAM_DISCOUNT,
        }}
        showRefund={false}
        showDescription={false}
      />

      {/* 事務局負担ゼロ + モニターチーム特典 */}
      <MonitorTeamBenefitSection />

      {/* 7. 導入の流れ */}
      <IntroductionFlowSection />

      {/* 8. FAQ (PDF p7) */}
      <SubpageFAQ
        heading="よくある/ご質問"
        headingAlign="center"
        items={[
          {
            question: "チーム事務局に負担はありますか？",
            answer:
              "契約は各ご家庭と Nobilva の個別契約のため、チーム様がお支払いや事務手続きを行うことはありません。お願いするのは、選手のみなさまへのご案内のみです。",
          },
          {
            question: "なぜ「オール3」なのですか？",
            answer:
              "内申点は、野球推薦・指定校推薦では出願基準として、一般入試では調査書点として、どの受験方式でも合否に関わる数字です。多くの高校でオール3がその最低ラインにあたり、学校によってはさらに高い基準が求められます。まずこのラインを下回らないことが、進路の選択肢を残すための土台になると考えています。",
          },
          {
            question: "チームにどんなメリットがありますか？",
            answer:
              "「野球も勉強も応援するチーム」という姿勢を、具体的なかたちでご家庭に示せます。学業への不安を理由にした退部・活動セーブを防ぎやすくなるほか、入団を検討中のご家庭への説明材料としてもご活用いただけます。",
          },
          {
            question: "野球の指導や活動への影響は？",
            answer:
              "ありません。Nobilva が関わるのは学習面のみで、野球の指導方針には一切介入しません。学習計画は練習・試合・遠征のスケジュールを最優先に組むため、チーム活動と競合しない設計です。",
          },
          {
            question: "どんな人がメンターをしていますか？",
            answer:
              "指導経験豊富な予備校講師が、計画作成から週1回の面談、毎日の進捗確認まで直接担当します。学力だけでなく、中学生に寄り添い、本人が自分で続けられる習慣づくりを重視しています。",
          },
          {
            question: "契約形態はどうなっていますか？",
            answer:
              "各選手のご家庭に、チーム限定価格にて Nobilva と直接ご契約いただきます。チーム様との契約は発生しません。モニターチーム様の選手は全員、初月無料・翌学期末まで月額3,000円引きが適用されます。",
          },
        ]}
      />

      {/* 9. 代表挨拶 (PDF p8) */}
      <RepresentativeSection />

      {/* 10. お問い合わせ (PDF p8) */}
      <section id="contact" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading center className="mb-8">お問い合わせ・/資料請求</SectionHeading>

          {/* シンプル導線: 公式LINE QR + 電話 + メール (PDF p8) */}
          <QuickContactCard />

          {/* 詳細フォーム */}
          <div className="mt-10 md:mt-12">
            <p className="text-center text-sm md:text-base text-gray-500 mb-6">
              またはフォームからも承ります
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------
 * ヒーロー (PDF page 1) — Nobilva トップの HeroSection と同じデザイン言語
 * -------------------------------------------------------------- */
function ForTeamsHero() {
  return (
    <section className="bg-white pt-24 md:pt-28 pb-10 md:pb-14">
      {/* ヒーローカード — Nobilva トップと同じフルワイド */}
      <div className="px-4 md:px-6">
        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-nobilva-main">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 600 300"
            aria-hidden="true"
          >
            <polygon points="0,0 160,0 60,300" fill="#ea5614" opacity="0.07" />
            <polygon points="120,0 280,0 200,180" fill="#ea5614" opacity="0.05" />
            <polygon points="0,200 100,300 0,300" fill="#ea5614" opacity="0.08" />
            <polygon points="220,300 340,200 280,300" fill="#ea5614" opacity="0.05" />
            <polygon points="450,30 600,0 600,140" fill="#ea5614" opacity="0.05" />
            <polygon points="60,300 180,180 140,300" fill="#ea5614" opacity="0.08" />
            <polygon points="20,100 80,40 60,180" fill="#ea5614" opacity="0.05" />
            <polygon points="240,80 300,20 320,120" fill="#ea5614" opacity="0.04" />
            <polygon points="500,200 580,140 600,260" fill="#ea5614" opacity="0.05" />
            <line x1="60" y1="300" x2="200" y2="180" stroke="#ea5614" strokeWidth="0.6" opacity="0.15" />
            <line x1="200" y1="180" x2="300" y2="60" stroke="#ea5614" strokeWidth="0.6" opacity="0.12" />
            <line x1="80" y1="180" x2="200" y2="180" stroke="#ea5614" strokeWidth="0.6" opacity="0.1" />
            <line x1="300" y1="60" x2="480" y2="80" stroke="#ea5614" strokeWidth="0.6" opacity="0.08" />
            <circle cx="200" cy="180" r="2.5" fill="#ea5614" opacity="0.22" />
            <circle cx="300" cy="60" r="2.5" fill="#ea5614" opacity="0.18" />
            <circle cx="80" cy="180" r="2" fill="#ea5614" opacity="0.15" />
            <circle cx="180" cy="80" r="1.8" fill="#ea5614" opacity="0.14" />
            <circle cx="480" cy="80" r="2" fill="#ea5614" opacity="0.16" />
          </svg>

          {/* 右側の選手画像 */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-[42%] lg:w-[38%] xl:w-[35%] pointer-events-none">
            <Image
              src="/images/nobilva/hero_transparent.png"
              alt="背番号17の野球部員（後ろ姿）"
              fill
              priority
              className="object-contain object-right-bottom"
            />
          </div>

          {/* コピー */}
          <div className="relative px-6 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20 md:pr-[42%] lg:pr-[38%] xl:pr-[35%] flex flex-col gap-5 md:gap-7">
            {/* kicker: 関係者の皆さまへ */}
            <div>
              <span className="inline-block bg-nobilva-accent text-white text-xs md:text-sm font-bold px-3 py-1 rounded">
                関係者の皆さまへ
              </span>
            </div>

            <div className="font-black text-gray-900 tracking-tight">
              <p className="text-base md:text-2xl lg:text-3xl xl:text-4xl leading-none">
                事務局負担0で
              </p>
              <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-none mt-2 md:mt-3">
                <span className="inline-block bg-white text-nobilva-accent px-2 md:px-3 pt-0.5 pb-1.5 md:pt-1 md:pb-2.5 mr-1">
                  野球
                </span>
                と
                <span className="inline-block bg-white text-nobilva-accent px-2 md:px-3 pt-0.5 pb-1.5 md:pt-1 md:pb-2.5 mx-1">
                  勉強
                </span>
                の両立を
              </p>
              <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-none mt-2 md:mt-3">
                サポートしませんか
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* モニター募集 + 直接ご相談 (幅制約) */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 mt-4 md:mt-6 space-y-4 md:space-y-6">
        {/* モニターチーム募集中バナー — CTABanner (無料学習面談) と同じ青デザインを流用 */}
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-6 md:pl-10 md:pr-0 md:py-0 flex items-start md:items-center gap-6"
          style={{
            background:
              "linear-gradient(135deg, #38bdf8 0%, #38bdf8 70%, #2da8e0 70%, #2da8e0 80%, #2595c9 80%, #2595c9 90%, #1e82b3 90%, #1e82b3 100%)",
          }}
        >
          {/* ポリゴンあしらい */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 600 200"
            aria-hidden="true"
          >
            <polygon points="0,0 180,0 60,200" fill="white" opacity="0.07" />
            <polygon points="120,0 300,0 200,140" fill="white" opacity="0.05" />
            <polygon points="350,0 500,0 420,180" fill="white" opacity="0.04" />
            <polygon points="450,30 600,0 600,120" fill="white" opacity="0.06" />
            <polygon points="60,200 180,80 140,200" fill="white" opacity="0.08" />
            <polygon points="200,140 300,40 340,200" fill="white" opacity="0.03" />
            <polygon points="480,0 550,0 520,80" fill="white" opacity="0.07" />
            <polygon points="0,100 80,40 40,200" fill="white" opacity="0.04" />
            <line x1="60" y1="200" x2="200" y2="140" stroke="white" strokeWidth="0.5" opacity="0.1" />
            <line x1="200" y1="140" x2="420" y2="180" stroke="white" strokeWidth="0.5" opacity="0.08" />
            <line x1="180" y1="80" x2="300" y2="40" stroke="white" strokeWidth="0.5" opacity="0.07" />
            <line x1="420" y1="180" x2="520" y2="80" stroke="white" strokeWidth="0.5" opacity="0.08" />
            <circle cx="200" cy="140" r="2" fill="white" opacity="0.12" />
            <circle cx="420" cy="180" r="2" fill="white" opacity="0.1" />
            <circle cx="520" cy="80" r="2" fill="white" opacity="0.12" />
            <circle cx="180" cy="80" r="1.5" fill="white" opacity="0.1" />
          </svg>

          {/* 右下の養田画像 */}
          <Image
            src="/images/yoda_transparent.webp"
            alt="Nobilva 代表 養田"
            width={240}
            height={240}
            className="absolute right-0 bottom-0 w-36 h-36 md:w-60 md:h-60 object-contain pointer-events-none"
          />

          {/* テキスト */}
          <div className="relative flex-1 flex flex-col gap-3 md:gap-4 md:py-10 md:pr-[240px]">
            <p className="inline-block self-start bg-yellow-300 text-gray-900 text-xs md:text-sm font-black px-3 py-1 rounded">
              モニターチーム募集中！
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight break-keep">
              チームを通じて<wbr />Nobilva を
              <br className="hidden md:block" />
              ご紹介いただける<wbr />チームを
              <br className="hidden md:block" />
              募集しています。
            </p>
            <p className="text-sm md:text-base text-white/90 leading-relaxed break-keep">
              選手は<span className="font-bold text-yellow-300">初月無料・特別価格</span>の対象に。<wbr />モデルケースとして<wbr />ホームページ等で<wbr />ご紹介させていただく場合がありますが、<wbr />選手個人の情報を<wbr />同意なく<wbr />掲載することはありません。
            </p>
          </div>
        </div>

        {/* 直接ご相談ブロック */}
        <div className="rounded-2xl border border-gray-200 bg-white px-6 md:px-8 py-5 md:py-6">
          <p className="font-bold text-gray-900 text-base mb-3">
            直接ご相談いただく場合はこちら
          </p>
          <ContactInfoBlock />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------
 * サービスの2本柱 (PDF page 3)
 * -------------------------------------------------------------- */
function TwoPillarsSection() {
  const pillars = [
    {
      no: "①",
      title: "週1オンライン面談",
      subtitle: "で日割り学習計画",
      badge: "練習や試合のスケジュールに\n合わせて作成します！",
      image: "/images/nobilva/pillars/session.png",
      alt: "Nobilva の日割り学習計画アプリの画面",
      body: "専属メンターが翌週の日割り計画を毎週作成。遠征・試合期・テスト前後でも「何をやればいいか」が毎朝はっきりします。",
    },
    {
      no: "②",
      title: "毎日のチャット",
      subtitle: "で細やかな進捗確認",
      badge: "習慣づくりを\n徹底的にサポート！",
      image: "/images/nobilva/pillars/chat.png",
      alt: "メンターとの毎日のチャット画面",
      body: "専用チャットで、その日の学習結果をひとこと報告。続かない日は理由を一緒に分解、できた日はちゃんと積み上げます。",
    },
  ];

  return (
    <Section bg="white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6 lg:gap-10">
        {pillars.map((p, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <p className="text-3xl md:text-4xl font-black text-nobilva-accent mb-3">
              {p.no}
            </p>
            <h3 className="inline-block bg-nobilva-main text-gray-900 text-2xl md:text-2xl lg:text-3xl font-black px-4 py-2 mb-3">
              {p.title}
            </h3>
            <p className="text-xl md:text-xl font-black text-gray-900 mb-5">
              {p.subtitle}
            </p>

            <div className="relative w-full max-w-xs md:max-w-sm">
              <span className="absolute -top-3 right-2 md:right-4 -rotate-6 z-10 bg-nobilva-accent text-white text-[11px] md:text-xs font-bold px-3 py-1.5 rounded shadow-md whitespace-pre-line leading-tight">
                {p.badge}
              </span>
              <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-t-[2rem] bg-white">
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 384px, 320px"
                  className="object-cover object-top"
                />
                {/* 下端フェード: 画面外に見切れる演出 */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-white pointer-events-none" />
              </div>
            </div>

            <p className="mt-5 md:mt-6 max-w-sm text-sm md:text-base text-gray-700 leading-relaxed">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * 3つの指針 (PDF page 4)
 * -------------------------------------------------------------- */
function ThreeGuidelinesSection() {
  const guidelines = [
    {
      title: "学校の時間を\n最大限に活かす。",
      body: "学校の授業／宿題／小テストを最大限活用する計画を立てます。塾のように「別の教材をやる」のではなく、学校の勉強を中心に据え、時間を有効活用しつつ成績に直結する学習を実現します。",
      image: "/images/nobilva/guidelines/1.png",
    },
    {
      title: "ご家庭との\n役割分担を明確化",
      body: "計画作成・進捗管理・振り返りは全てメンターが担当。ご家庭にお願いするのは「学習環境の確保」と「スケジュール共有」だけ。共働きや送迎などで忙しいご家庭でも無理なく続けられます。",
      image: "/images/nobilva/guidelines/2.png",
    },
    {
      title: "強制ではなく\n習慣づくり",
      body: "「やらされる勉強」ではなく「自分で決めた計画をこなす」感覚を育てます。できなかった日も責めず、週1回の面談で理由を一緒に整理。数ヶ月かけて、その子に合ったリズムが育っていきます。",
      image: "/images/nobilva/guidelines/3.png",
    },
  ];

  return (
    <Section bg="white">
      <SectionHeading center className="mb-10 md:mb-12">
        さらに.../成長を続けるための/3つの指針
      </SectionHeading>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {guidelines.map((g, i) => (
          <div
            key={i}
            className="bg-nobilva-light rounded-2xl p-6 md:p-8 flex flex-col"
          >
            <h3 className="text-2xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-snug whitespace-pre-line mb-4 break-keep">
              {g.title}
            </h3>
            <div className="relative w-2/3 max-w-[240px] mx-auto md:w-full md:max-w-none md:mx-0 aspect-[3/2] mb-4 rounded-xl overflow-hidden bg-white">
              <Image
                src={g.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 66vw"
                className="object-cover"
              />
            </div>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed break-keep">
              {g.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * 事務局負担ゼロ + モニターチーム特典
 * -------------------------------------------------------------- */
function MonitorTeamBenefitSection() {
  return (
    <section className="bg-white pb-16 md:pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        {/* 事務局負担ゼロ */}
        <p className="text-center text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-10 md:mb-12">
          契約は各ご家庭ごと個別なので
          <span className="text-nobilva-accent">事務局負担ゼロ</span>
        </p>

        {/* モニターチーム特典バナー */}
        <div className="bg-nobilva-accent text-white rounded-2xl p-6 md:p-10 text-center">
          <p className="inline-block bg-white text-nobilva-accent text-sm md:text-base font-black px-3 py-1 rounded mb-4">
            モニターチーム様限定
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
            初月無料 &amp; 翌学期末まで
            <br className="md:hidden" />
            月額3,000円引き！
          </p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------
 * 導入の流れ
 * -------------------------------------------------------------- */
function IntroductionFlowSection() {
  const steps = [
    {
      step: 1,
      title: "お問い合わせ",
      who: ["チーム担当者様"],
      detail:
        "メール nobilva@nectere.jp または電話 03-6820-9037、またはこのページ末尾のフォームからご連絡ください。",
    },
    {
      step: 2,
      title: "オンライン面談（30分）",
      who: ["Nobilva", "チーム担当者様"],
      detail:
        "チームの状況、選手数、保護者会の頻度などをヒアリングいたします。紹介方法・特別価格について個別にすり合わせを行います。",
    },
    {
      step: 3,
      title: "紹介資料の送付",
      who: ["Nobilva"],
      detail:
        "保護者様/選手様向けの資料を紙媒体あるいは公式LINEにてご提供します。",
    },
    {
      step: 4,
      title: "チーム内での紹介",
      who: ["チーム担当者様"],
      detail:
        "保護者会・LINE・印刷物などで自由にご配布いただけます。状況に応じて、保護者会や試合会場などでご説明させていただく場合がございます（オンライン・対面いずれも可）。",
    },
    {
      step: 5,
      title: "選手・保護者からの個別申込み",
      who: ["保護者様"],
      detail:
        "ご家庭から Nobilva の無料学習面談に直接お申込みいただきます。紹介きっかけ欄に「チーム紹介」とご記入いただくと特別価格が適用されます。契約・料金のお支払いは Nobilva と保護者の間で直接行います。",
    },
  ];

  return (
    <Section bg="light">
      <SectionHeading center className="mb-10 md:mb-12">
        導入の流れ
      </SectionHeading>

      <div className="max-w-4xl mx-auto space-y-4">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-white rounded-xl p-5 flex gap-4 items-start"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-nobilva-main text-gray-900 font-bold text-lg flex items-center justify-center">
              {item.step}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-base md:text-lg">
                  {item.title}
                </h3>
                {item.who.map((w) => (
                  <span
                    key={w}
                    className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {w}
                  </span>
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * 代表挨拶 (PDF page 8)
 * -------------------------------------------------------------- */
function RepresentativeSection() {
  return (
    <Section bg="light">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 md:p-12">
          {/* Nobilva by Nectere ロゴ表記 (PDF p8) */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6 md:mb-8">
            <Image
              src="/images/logo_nobilva.png"
              alt="Nobilva"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
            />
            <span className="text-sm md:text-base text-gray-500">by</span>
            <Image
              src="/images/logo.png"
              alt="Nectere"
              width={120}
              height={32}
              className="h-6 md:h-7 w-auto"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-nobilva-light overflow-hidden relative">
                <Image
                  src="/images/nobilva/yoda-portrait.png"
                  alt="Nobilva 代表 養田貴大"
                  fill
                  sizes="(min-width: 768px) 160px, 128px"
                  className="object-cover object-center"
                />
              </div>
              <div className="text-center mt-3">
                <p className="text-xs text-nobilva-accent font-bold">代表</p>
                <p className="font-black text-gray-900 text-xl">養田 貴大</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>
                はじめまして、Nobilva 代表の養田貴大です。東京で学習塾を二校舎経営し、多くの中高生の指導や進路の相談に携わってきました。
              </p>
              <p>
                弟がリトルシニアで野球に打ち込んでいたこともあり、練習と勉強の両立の大変さは家族として間近で見てきました。その経験から生まれたのが Nobilva です。
              </p>
              <p>
                選手一人ひとりの進路を一緒に守るパートナーとして、お気軽にお声がけください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * お問い合わせ用シンプル導線カード (PDF page 8)
 * -------------------------------------------------------------- */
function QuickContactCard() {
  return (
    <div className="bg-nobilva-light rounded-2xl p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        {/* 左: LINE QR */}
        <a
          href={LINE_ADD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 md:gap-5 bg-white rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow"
        >
          <Image
            src="/images/nobilva/line-qr.png"
            alt="Nobilva 公式LINE QRコード"
            width={110}
            height={110}
            className="shrink-0 rounded"
          />
          <div>
            <p className="text-xs md:text-sm text-gray-500 mb-1">公式LINEから</p>
            <p className="text-base md:text-lg font-black text-gray-900 leading-snug">
              お気軽に
              <br />
              お問い合わせください
            </p>
          </div>
        </a>

        {/* 右: 電話・メール */}
        <div className="space-y-3 md:space-y-4">
          <a
            href="tel:03-6820-9037"
            className="flex items-center gap-3 text-base md:text-lg font-bold text-gray-900 hover:text-nobilva-accent transition-colors"
          >
            <svg className="w-6 h-6 text-nobilva-main flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>03-6820-9037<span className="text-xs md:text-sm text-gray-500 font-normal ml-1">（代表）</span></span>
          </a>
          <a
            href="mailto:nobilva@nectere.jp"
            className="flex items-center gap-3 text-base md:text-lg font-bold text-gray-900 hover:text-nobilva-accent transition-colors"
          >
            <svg className="w-6 h-6 text-nobilva-main flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            nobilva@nectere.jp
          </a>
          <p className="text-xs md:text-sm text-gray-500 pt-1">
            平日・土日問わずご連絡いただけます。24時間以内にご返信します。
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------
 * お問い合わせフォーム / 連絡先ブロック
 * -------------------------------------------------------------- */
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    teamName: "",
    role: "",
    email: "",
    phone: "",
    inquiryTypes: [] as string[],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const roles = ["監督", "コーチ・小頭", "父母会代表・役員", "学校関係者", "その他"];
  const inquiryOptions = [
    "チーム導入について話を聞きたい",
    "紹介資料（ビラ・LINE文面）を送ってほしい",
    "保護者会や試合会場でのご説明を依頼したい",
    "その他",
  ];

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">お問い合わせを受け付けました</h3>
        <p className="text-sm text-gray-600">24時間以内にご連絡いたします。</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const messageParts = [
      `【チーム導入お問い合わせ】`,
      `チーム名: ${formData.teamName}`,
      `役職: ${formData.role}`,
      `お問い合わせ内容: ${formData.inquiryTypes.join("、")}`,
      formData.message ? `\nご要望・ご質問:\n${formData.message}` : "",
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.teamName,
          phone: formData.phone || undefined,
          inquiryType: "nobilva",
          message: messageParts,
          privacy: true,
          locale: "ja",
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 space-y-5 border border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          所属チーム名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="○○リトルシニア、○○高校野球部 など"
          value={formData.teamName}
          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          お役職 <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        >
          <option value="">選択してください</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          電話番号 <span className="text-xs text-gray-400">（任意）</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          お問い合わせ内容 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {inquiryOptions.map((option) => (
            <label key={option} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inquiryTypes.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, inquiryTypes: [...formData.inquiryTypes, option] });
                  } else {
                    setFormData({ ...formData, inquiryTypes: formData.inquiryTypes.filter((t) => t !== option) });
                  }
                }}
                className="mt-0.5 accent-nobilva-accent"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          ご要望・ご質問 <span className="text-xs text-gray-400">（任意・500字まで）</span>
        </label>
        <textarea
          maxLength={500}
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          送信に失敗しました。時間をおいて再度お試しいただくか、メール・お電話でご連絡ください。
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-nobilva-accent hover:bg-nobilva-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-colors"
      >
        {submitting ? "送信中..." : "お問い合わせを送信する"}
      </button>
    </form>
  );
}

function ContactInfoBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`.trim()}>
      <a
        href={LINE_ADD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-base font-bold text-[#06C755] hover:opacity-80 transition-opacity"
      >
        <svg className="w-5 h-5 flex-shrink-0" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 5.58 2 10c0 2.55 1.5 4.82 3.86 6.34-.17.62-.61 2.24-.7 2.58-.11.44.16.43.34.31.14-.09 2.24-1.53 3.14-2.14.75.11 1.54.17 2.36.17 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
        </svg>
        LINEで問い合わせ
      </a>
      <a href="mailto:nobilva@nectere.jp" className="inline-flex items-center gap-2 text-base font-medium text-gray-900 hover:text-nobilva-accent transition-colors">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        nobilva@nectere.jp
      </a>
      <a href="tel:03-6820-9037" className="inline-flex items-center gap-2 text-base font-medium text-gray-900 hover:text-nobilva-accent transition-colors">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        03-6820-9037
      </a>
      <span className="text-xs md:text-sm text-gray-500">担当：養田貴大（代表）</span>
    </div>
  );
}
