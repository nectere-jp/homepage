"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/teams";
import { EmpathySection } from "@/components/nobilva/EmpathySection";
import { FinalCTASection } from "@/components/nobilva/FinalCTASection";
import { FixedDiagnosisCTA } from "@/components/nobilva/FixedDiagnosisCTA";
import { EndorsementsSection } from "@/components/nobilva/EndorsementsSection";
import { PlanCard, CostComparisonChart } from "@/components/nobilva/PricingSection";
import { Section } from "@/components/nobilva/Section";
import { SectionHeading } from "@/components/nobilva/SectionHeading";
import { OutlineLink } from "@/components/nobilva/OutlineLink";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";

const ESSENTIAL_PRICE = 18000;
const BASIC_PRICE = 26000;

function trackEvent(slug: string, event: "page_view" | "cta_click") {
  fetch("/api/teams/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, event }),
  }).catch(() => {});
}

export function TeamPageClient({ team }: { team: Team }) {
  useEffect(() => {
    trackEvent(team.slug, "page_view");
    try {
      sessionStorage.setItem("nobilva_team_slug", team.slug);
    } catch {
      // sessionStorage は非対応環境でもページ動作は継続
    }
  }, [team.slug]);

  const handleCTAClick = useCallback(() => {
    trackEvent(team.slug, "cta_click");
  }, [team.slug]);

  const diagnosisHref = `/ja/services/nobilva/diagnosis?team=${team.slug}`;
  const offerVariant = team.offerVariant ?? "C";

  return (
    <div className="bg-white min-h-screen">
      {/* B1: 宛名・経緯 */}
      <TeamHero team={team} />

      {/* 固定 CTA（右下） */}
      <FixedDiagnosisCTA href={diagnosisHref} onCTAClick={handleCTAClick} />

      {/* 許可者・推薦者コメント（あれば） */}
      {team.endorsements && team.endorsements.length > 0 && (
        <EndorsementsSection endorsements={team.endorsements} />
      )}

      {/* B2: 二大柱 */}
      <TwoPillarsSection teamSlug={team.slug} />

      {/* B3: オール3死守 */}
      <EmpathySection />
      <AllThreeNote />

      {/* B4: チーム限定オファー */}
      <TeamOfferSection
        team={team}
        offerVariant={offerVariant}
      />

      {/* B5: 代表挨拶 */}
      <RepresentativeSection />

      {/* FAQ（LPと同じ max-w-4xl の横幅） */}
      <SubpageFAQ
        items={buildTeamFAQ(team)}
        heading="よくあるご質問"
        headingAlign="center"
        id="faq"
        numbered
      />

      {/* B6: CTA（毎月20名限定はチームページでは非表示） */}
      <FinalCTASection
        diagnosisHref={diagnosisHref}
        onCTAClick={handleCTAClick}
        hideMonthlyLimit
      />
    </div>
  );
}

/* --------------------------------------------------------------
 * B1: 宛名・経緯（画像 + 経緯 を1つの hero カードに統合）
 * -------------------------------------------------------------- */
function TeamHero({ team }: { team: Team }) {
  return (
    <section className="bg-white pt-6 md:pt-10 pb-10 md:pb-14">
      <div className="px-4 md:px-6">
        {/* 宛名（Hero カードの外・モバイル縦積み / PC 横並び・中央揃え） */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-5 mt-4 md:mt-6 mb-10 md:mb-14">
          {team.logoUrl && (
            <Image
              src={team.logoUrl}
              alt={`${team.teamName} ロゴ`}
              width={200}
              height={200}
              className="h-14 md:h-16 lg:h-20 w-auto object-contain"
            />
          )}
          <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 tracking-tight text-center">
            <span className="bg-nobilva-main px-2 py-0.5">
              {team.teamName}
            </span>
            の保護者のみなさまへ
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-nobilva-main">
          {/* 装飾 SVG（あしらい: オレンジの三角・線・ドット） */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 600 300"
            aria-hidden="true"
          >
            {/* 大きな三角形 */}
            <polygon points="0,0 160,0 60,300" fill="#ea5614" opacity="0.07" />
            <polygon points="120,0 280,0 200,180" fill="#ea5614" opacity="0.05" />
            <polygon points="0,200 100,300 0,300" fill="#ea5614" opacity="0.08" />
            <polygon points="220,300 340,200 280,300" fill="#ea5614" opacity="0.05" />
            <polygon points="450,30 600,0 600,140" fill="#ea5614" opacity="0.05" />
            {/* 小さなアクセント三角形 */}
            <polygon points="60,300 180,180 140,300" fill="#ea5614" opacity="0.08" />
            <polygon points="20,100 80,40 60,180" fill="#ea5614" opacity="0.05" />
            <polygon points="240,80 300,20 320,120" fill="#ea5614" opacity="0.04" />
            <polygon points="500,200 580,140 600,260" fill="#ea5614" opacity="0.05" />
            {/* 線（ノード間接続風） */}
            <line x1="60" y1="300" x2="200" y2="180" stroke="#ea5614" strokeWidth="0.6" opacity="0.15" />
            <line x1="200" y1="180" x2="300" y2="60" stroke="#ea5614" strokeWidth="0.6" opacity="0.12" />
            <line x1="80" y1="180" x2="200" y2="180" stroke="#ea5614" strokeWidth="0.6" opacity="0.1" />
            <line x1="300" y1="60" x2="480" y2="80" stroke="#ea5614" strokeWidth="0.6" opacity="0.08" />
            {/* 小さなドット（ノード） */}
            <circle cx="200" cy="180" r="2.5" fill="#ea5614" opacity="0.22" />
            <circle cx="300" cy="60" r="2.5" fill="#ea5614" opacity="0.18" />
            <circle cx="80" cy="180" r="2" fill="#ea5614" opacity="0.15" />
            <circle cx="180" cy="80" r="1.8" fill="#ea5614" opacity="0.14" />
            <circle cx="480" cy="80" r="2" fill="#ea5614" opacity="0.16" />
          </svg>

          {/* 右側の選手画像（デスクトップのみ） */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-[42%] lg:w-[38%] xl:w-[35%] pointer-events-none">
            <Image
              src={team.heroImageUrl || "/images/nobilva/hero_transparent.png"}
              alt="背番号17の野球部員（後ろ姿）"
              fill
              priority
              className="object-contain object-right-bottom"
            />
          </div>

          {/* オーバーレイコンテンツ（見出し + 経緯） */}
          <div className="relative px-6 md:px-12 lg:px-16 py-14 md:py-20 lg:py-28 md:pr-[42%] lg:pr-[38%] xl:pr-[35%] flex flex-col gap-6 md:gap-8">
            {/* メインコピー（3行構造: kicker → 野球と勉強の両立を → サポートします） */}
            <div className="font-black text-gray-900 tracking-tight">
              {/* Line 1: kicker */}
              <p className="text-base md:text-2xl lg:text-3xl xl:text-4xl leading-none">
                本気で野球に取り組む中学生の
              </p>

              {/* Line 2: 野球 / 勉強 を白ボックス+オレンジ文字で強調 */}
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

              {/* Line 3 */}
              <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-none mt-2 md:mt-3">
                サポートします
              </p>
            </div>

            {/* 経緯（画像に重ねる） */}
            <div className="max-w-3xl mt-2 md:mt-4">
              <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                このページは、
                <span className="font-bold text-gray-900">{team.teamName}</span>
                事務局のご協力のもと、チームの保護者のみなさまへご案内しているものです。ご利用は各ご家庭の任意です。チームを通じたお手続きやお支払いは一切ありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------
 * B2: 二大柱
 * -------------------------------------------------------------- */
function TwoPillarsSection({ teamSlug }: { teamSlug: string }) {
  const pillars = [
    {
      no: "①",
      title: "週1オンライン面談",
      titleSuffix: "で日割り学習計画",
      badge: "練習や試合のスケジュールに合わせて\n作成します！",
      body:
        "専属メンターが練習・試合スケジュールと得意不得意、学校の進度を踏まえて、1週間分の日割り学習計画を作成します。",
      imageSrc: "/images/nobilva/tasklist.png",
      imageAlt: "Nobilva の学習計画画面（日割りタスクリスト）",
    },
    {
      no: "②",
      title: "毎日のチャット",
      titleSuffix: "で細やかな進捗確認",
      badge: "習慣づくりを徹底的にサポート！",
      body:
        "毎日ひとことチャットで報告。メンターが24時間以内に返信し、必要に応じて翌日の計画を微調整します。",
      imageSrc: "/images/nobilva/chat.png",
      imageAlt: "Nobilva のメンターとのチャット画面",
    },
  ];

  return (
    <Section>
      <SectionHeading center>
        勉強両立のための/二大柱
      </SectionHeading>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {pillars.map((p, i) => (
          <div
            key={i}
            className="relative bg-white p-6 md:p-8 border-4 border-nobilva-main"
          >
            <p className="text-sm md:text-base font-bold text-gray-900 leading-snug">
              <span className="text-nobilva-accent text-xl md:text-2xl font-black mr-1.5">
                {p.no}
              </span>
              <span className="bg-nobilva-accent text-white text-lg md:text-xl font-black px-2 py-0.5">
                {p.title}
              </span>
              {p.titleSuffix}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              {p.body}
            </p>

            <div className="relative mt-5 max-w-[280px] md:max-w-[320px] mx-auto">
              {/* 画像は上部だけ見えて下は見切れるデザイン（aspect-[6/5] で ~38% 表示） */}
              <div className="aspect-[6/5] overflow-hidden">
                <Image
                  src={p.imageSrc}
                  alt={p.imageAlt}
                  width={800}
                  height={1700}
                  className="w-full h-auto object-cover object-top"
                />
              </div>
              <div
                className="absolute -top-3 -left-2 md:-left-4 bg-nobilva-main text-gray-900 font-black text-xs md:text-sm px-3 py-1.5 shadow-md z-10 whitespace-pre-line"
                style={{ transform: "rotate(-4deg)" }}
              >
                {p.badge}
                <div
                  className="absolute -bottom-1.5 left-5 w-2.5 h-2.5 bg-nobilva-main"
                  style={{ transform: "rotate(45deg)" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10 md:mt-12">
        <OutlineLink href={`/ja/services/nobilva/how-it-works?team=${teamSlug}`}>
          仕組みの詳細を見る
        </OutlineLink>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * B3 追加注記: EmpathySection の下に添える
 * -------------------------------------------------------------- */
function AllThreeNote() {
  return (
    <section className="bg-white pb-16 md:pb-20 -mt-8 md:-mt-12">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
          内申点は、野球推薦でも指定校推薦でも一般入試でも合否に関わる数字です。まずオール3を下回らないことが、進路の選択肢を残す土台になります。
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------
 * B4: チーム限定オファー（A / B / C 分岐）
 * -------------------------------------------------------------- */
function TeamOfferSection({
  team,
  offerVariant,
}: {
  team: Team;
  offerVariant: "A" | "B" | "C";
}) {
  // エッセンシャル: team の値を優先、フォールバックはグローバル定数
  const essentialNormal = team.normalPrice ?? ESSENTIAL_PRICE;
  const essentialSpecial = team.specialPrice;
  // ベーシック: team に個別設定があればそれを使う。なければ Essential の差分から算出（後方互換）
  const discount = essentialNormal - essentialSpecial;
  const basicNormal = team.basicNormalPrice ?? BASIC_PRICE;
  const basicSpecial = team.basicSpecialPrice ?? basicNormal - discount;

  return (
    <Section bg="light" id="pricing">
      <SectionHeading center>料金プラン</SectionHeading>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <PlanCard
          planName="エッセンシャルプラン"
          originalPrice={essentialNormal}
          discountedPrice={essentialSpecial}
          isTeam
          features={[
            { label: "週一回のオンライン面談", enabled: true },
            { label: "毎日チャットで進捗確認", enabled: false },
          ]}
          description="週1回の面談で、練習や試合に合わせた1週間分の計画をお渡しします。計画さえあれば自分で進められるお子さま向けの、シンプルに始めやすいプランです。"
        />
        <div className="relative">
          {offerVariant === "B" && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-sky-500 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
              🛡️ オール3保証 対象プラン
            </div>
          )}
          <PlanCard
            planName="ベーシックプラン"
            originalPrice={basicNormal}
            discountedPrice={basicSpecial}
            isTeam
            features={[
              { label: "週一回のオンライン面談", enabled: true },
              { label: "毎日チャットで進捗確認", enabled: true },
            ]}
            recommended
            description="週1回の面談に加えて、毎日のチャットで実行まで伴走します。学習習慣をゼロからつくりたいお子さま向けの、充実したプランです。"
            descriptionAccent
          />
        </div>
      </div>

      {/* オプション（プラン下段・横幅いっぱい） */}
      <div className="mt-6 md:mt-8">
        <OptionSessionCard />
      </div>

      {/* オファー帯 */}
      {offerVariant === "A" && <MonitorOfferBanner />}
      {offerVariant === "B" && (
        <GuaranteeOfferBanner teamName={team.teamName} />
      )}

      {/* 塾比較（セクション最下部） */}
      <div className="mt-10 md:mt-14">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
          <div className="w-full md:w-[45%] shrink-0">
            <CostComparisonChart />
          </div>
          <div className="w-full md:flex-1">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-4">
              塾や他のオンライン学習塾より
              <br />
              圧倒的に<span className="text-nobilva-accent">お得です</span>
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              通塾型の塾は月3〜5万円、個別指導なら6万円超えも。Nobilvaは月18,000円〜で、日割り計画・週1面談・毎日の進捗確認がすべて含まれています。
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * 個別指導オプションカード（月額プランの隣に並ぶ補助カード・幅小さめ）
 * -------------------------------------------------------------- */
function OptionSessionCard() {
  return (
    <div className="relative bg-white shadow-sm p-5 pt-8 md:p-8 md:pt-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 text-center md:text-left">
      {/* オプションバッジ（PlanCard の "おすすめ" と同じ位置） */}
      <span className="absolute top-0 left-0 bg-gray-500 text-white text-xs font-bold px-3 py-1">
        オプション
      </span>

      {/* 左: タイトル + 価格メタ + 価格数字（PC は全部横並び / モバイルはタイトルのみ改行） */}
      <div className="md:flex-shrink-0 flex flex-col md:flex-row md:items-baseline gap-3 md:gap-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900">
          フォローアップ個別指導
        </h3>
        <div className="flex items-baseline justify-center md:justify-start gap-2 md:gap-3 flex-wrap">
          <p className="text-xs md:text-sm font-bold text-gray-500">
            1コマ70分（単発利用OK）
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-4xl font-bold text-gray-900 leading-none">
              4,500
            </span>
            <span className="text-base md:text-lg font-bold text-gray-900">
              円
            </span>
          </div>
        </div>
      </div>

      {/* 右: 説明 */}
      <p className="text-xs md:text-sm leading-relaxed text-left text-gray-600 md:flex-1">
        「テスト前だけこの単元をカバーしたい」など、不安な内容を単発でお申し込みいただけるオプションです。
      </p>
    </div>
  );
}

/** 黄色文字を青地から浮き立たせるための濃い青ストローク（8方向 1px） */
const yellowOutlineStyle: React.CSSProperties = {
  textShadow: [
    "-1px -1px 0 #ffffff",
    "0 -1px 0 #ffffff",
    "1px -1px 0 #ffffff",
    "-1px 0 0 #ffffff",
    "1px 0 0 #ffffff",
    "-1px 1px 0 #ffffff",
    "0 1px 0 #ffffff",
    "1px 1px 0 #ffffff",
  ].join(", "),
};

/** より太いストローク（大きな数字用） */
const yellowOutlineStyleThick: React.CSSProperties = {
  textShadow: [
    "-2px -2px 0 #ffffff",
    "0 -2px 0 #ffffff",
    "2px -2px 0 #ffffff",
    "-2px 0 0 #ffffff",
    "2px 0 0 #ffffff",
    "-2px 2px 0 #ffffff",
    "0 2px 0 #ffffff",
    "2px 2px 0 #ffffff",
  ].join(", "),
};

/** 白いフィルに黄色ストローク（限定ラベル用） */
const whiteWithYellowStroke: React.CSSProperties = {
  textShadow: [
    "-1px -1px 0 #f6ce4a",
    "0 -1px 0 #f6ce4a",
    "1px -1px 0 #f6ce4a",
    "-1px 0 0 #f6ce4a",
    "1px 0 0 #f6ce4a",
    "-1px 1px 0 #f6ce4a",
    "0 1px 0 #f6ce4a",
    "1px 1px 0 #f6ce4a",
  ].join(", "),
};

function MonitorOfferBanner() {
  return (
    <div className="mt-10 md:mt-12 bg-sky-400 text-white font-rounded overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]">
        {/* 左: モニターチーム様限定 + 全員初月無料 */}
        <div className="px-6 py-6 md:px-10 md:py-10 md:border-r md:border-white/40 flex flex-col justify-center">
          <p
            className="text-base md:text-lg lg:text-xl font-black text-white mb-2 md:mb-3"
            style={whiteWithYellowStroke}
          >
            モニターチーム様限定
          </p>
          <p className="font-black leading-none">
            <span className="text-3xl md:text-5xl lg:text-6xl">全員初月</span>
            <span className="text-5xl md:text-7xl lg:text-8xl">無料</span>
          </p>
        </div>

        {/* 右: さらに / 翌学期末まで / 月額3000円割引 */}
        <div className="px-6 py-6 md:px-10 md:py-10 border-t border-white/40 md:border-t-0 flex flex-col justify-center">
          <p className="text-xs md:text-sm font-bold mb-1">さらに…</p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-black leading-none mb-3">
            翌学期末まで
          </p>
          <p className="text-xs md:text-sm font-bold mb-1">
            チーム特別価格からさらに
          </p>
          <p className="flex items-baseline gap-0.5 font-black leading-none">
            <span className="text-sm md:text-base">月額</span>
            <span
              className="text-nobilva-main text-4xl md:text-6xl lg:text-7xl"
              style={yellowOutlineStyleThick}
            >
              3,000
            </span>
            <span className="text-sm md:text-base">円</span>
            <span className="text-lg md:text-2xl ml-1">割引</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const GUARANTEE_TERMS_SECTIONS: Array<{
  title: string;
  items: string[];
}> = [
  {
    title: "対象プラン",
    items: [
      "ベーシックプランが本保証の対象です。エッセンシャルプランおよびその他のプランは対象外です。",
    ],
  },
  {
    title: "対象となる評定",
    items: [
      "対象学期の学校通知表に記載される5科目（国語・数学・英語・理科・社会）の評定を対象とします。",
      "対象学期の開始日から14日以内にNobilvaでの学習を開始し、以降、当該学期の終業日まで継続してご在籍いただいた場合に限り適用します。開始から14日を超えて入会された学期および途中退会の学期は本保証の対象外です。",
    ],
  },
  {
    title: "判定基準",
    items: [
      "対象5科目すべてが評定3以上であることを「オール3」といいます。1科目でも評定2以下があった場合、「オール3不達成」と判定し返金対象とします。",
      "学年末評定（3学期）で判定する場合、1学期または2学期のいずれかで評定1がついた科目については、学年末評定が3未満でも本保証の返金対象外とします。",
    ],
  },
  {
    title: "面談実施の要件",
    items: [
      "対象学期中、週1回のオンライン面談を8割以上実施いただくことを返金適用の条件とします。",
      "面談の無断欠席は学期で1回までとします。前日までにご連絡のあった欠席は無断欠席に含みません。",
    ],
  },
  {
    title: "返金額・対象外費用",
    items: [
      "返金額は、該当学期に会員様がお支払いいただいたベーシックプランの月額の全額です。",
      "入塾金・教材費・システム管理費、その他オプション費用は返金対象外です。",
      "お申し出内容を確認のうえ、原則としてお申し出受領日の翌月末までにご返金します。",
    ],
  },
  {
    title: "返金回数の上限",
    items: [
      "本保証の適用は、ご入会後2学期分までを上限とします。",
      "3学期目以降は、返金保証のないプランへ自動的に移行します。移行時期は事前にご案内します。",
    ],
  },
  {
    title: "お申し出方法・期限",
    items: [
      "各学期の通知表確定日から14日以内に、通知表の写し（画像データ可）を添えてNobilva事務局までご連絡ください。",
      "期限内にお申し出のなかった学期は、当該学期分について返金対象外となります。",
    ],
  },
  {
    title: "その他",
    items: [
      "通知表の記載内容について疑義が生じた場合、学校発行の証明書等の追加資料をご提出いただくことがあります。",
      "本保証の条件は、事前のご案内のうえ変更または終了する場合があります。変更前にご入会いただいた会員様には、原則として変更前の条件を適用します。",
    ],
  },
];

function GuaranteeOfferBanner({ teamName }: { teamName: string }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <>
      <div className="mt-10 md:mt-12 bg-sky-400 text-white font-rounded px-6 py-8 md:px-10 md:py-10">
        {/* ヘッダー + メインコピー（中央揃え） */}
        <div className="text-center">
          <p className="text-base md:text-lg lg:text-xl font-black text-white mb-3 md:mb-4">
            {teamName}のみなさま限定
          </p>
          <p className="font-black leading-tight text-2xl md:text-4xl lg:text-5xl">
            <span
              className="text-nobilva-main"
              style={yellowOutlineStyleThick}
            >
              オール3
            </span>
            が取れなければ
            <br className="md:hidden" />
            <span
              className="text-nobilva-main"
              style={yellowOutlineStyleThick}
            >
              全額返金
            </span>
            します。
          </p>
        </div>

        {/* 適用条件の概要（細字・font-sans で普通のゴシックに戻す） */}
        <p className="font-sans font-normal text-[11px] md:text-xs text-white/85 leading-relaxed mt-6 md:mt-8">
          <span>【適用条件の概要】</span>
          対象はベーシックプランです／学期の初めから終わりまで在籍した学期の5科目の評定が対象です／学年末評定の場合は、前学期までの成績に条件があります／週1回の面談を8割以上実施などが条件です／返金は該当学期の月額のみです／返金対象は入会後2学期までで、3学期目以降は返金なしプランに自動移行します。
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            詳しい適用条件を見る →
          </button>
        </p>
      </div>

      {isTermsOpen && (
        <TermsDialog
          title="オール3保証 適用条件"
          onClose={() => setIsTermsOpen(false)}
        >
          <div className="space-y-5 md:space-y-6">
            {GUARANTEE_TERMS_SECTIONS.map((section) => (
              <section key={section.title}>
                <h4 className="text-sm md:text-base font-black text-sky-600 mb-2 md:mb-2.5">
                  {section.title}
                </h4>
                <ul className="text-sm text-gray-800 leading-relaxed space-y-1.5 list-disc pl-5 marker:text-sky-400">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
              本保証は、Nectere（Nobilva運営者）と会員様との間の合意に基づくものです。適用の可否はNectereが最終的に判断します。ご不明点はNobilva事務局までお問い合わせください。
            </p>
          </div>
        </TermsDialog>
      )}
    </>
  );
}

/* --------------------------------------------------------------
 * 汎用ダイアログ（適用条件などの詳細を構造化表示するモーダル）
 * -------------------------------------------------------------- */
function TermsDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-dialog-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50/60">
          <h3
            id="terms-dialog-title"
            className="text-base md:text-lg font-black text-sky-700"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1 text-sky-400 hover:text-sky-600 rounded hover:bg-sky-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="px-6 py-4 border-t border-sky-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-sky-500 text-white text-sm font-bold rounded hover:bg-sky-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------
 * FAQ 生成: 共通 Q1-Q7 + オファータイプ別 Q8
 * -------------------------------------------------------------- */
function buildTeamFAQ(team: Team) {
  const teamName = team.teamName;
  const offerVariant = team.offerVariant ?? "C";

  const common = [
    {
      question: "なぜチームからこの案内が届いたのですか？",
      answer: `${teamName}事務局のご協力のもと、チームの保護者のみなさまにご案内しているものです。チームを通じてご紹介いただく代わりに、チームのみなさま限定の特別条件をご用意しています。`,
    },
    {
      question: "利用しない場合、チームでの活動に影響はありますか？",
      answer:
        "ありません。ご利用は各ご家庭の任意であり、利用の有無が野球の指導や起用に関わることは一切ありません。お申し込みはご家庭とNobilvaの間で直接行っていただきます。",
    },
    {
      question: "利用状況や成績は、チームに共有されますか？",
      answer: `はい。チームを通じたご案内という性質上、お子さまのご利用状況や成績の状況を${teamName}事務局と共有することがあります。共有する内容については、ご入会時にご説明します。`,
    },
    {
      question: "野球の指導や練習への影響はありますか？",
      answer:
        "ありません。Nobilvaが関わるのは学習面のみで、野球の指導方針には一切介入しません。学習計画は練習・試合・遠征のスケジュールを最優先に組むため、チーム活動と競合しない設計です。",
    },
    {
      question: "チーム限定価格を利用するにはどうすればいいですか？",
      answer: `お申し込み時または面談時に「${teamName}」経由の旨をお伝えいただくだけで適用されます。まずは無料学習面談で、お子さまに合わせた学習プランをご覧ください。面談の時点でお約束いただくことは何もありません。`,
    },
    {
      question: "契約や支払いはどうなりますか？",
      answer:
        "各ご家庭とNobilvaの直接契約です。チームを通じたお手続きやお支払いは発生しません。解約はいつでも可能で、前月10日までのご連絡で翌月分から停止できます。",
    },
    {
      question: "どんな人が担当しますか？",
      answer:
        "東京で学習塾を二校舎経営してきた代表の養田をはじめ、指導経験豊富なメンターが、計画作成から週1回の面談、毎日の進捗確認まで担当します。",
    },
  ];

  if (offerVariant === "A") {
    common.push({
      question: "モニターチームとは何ですか？",
      answer:
        "Nobilvaを初期にご導入いただき、サービス改善にご協力いただくチームです。その分、全員初月無料・翌学期末までの追加割引をご用意しています。取り組みの様子をモデルケースとしてホームページ等でご紹介する場合がありますが、選手個人の情報を同意なく掲載することはありません。",
    });
  } else if (offerVariant === "B") {
    common.push({
      question: "「オール3が取れなければ全額返金」の詳細を教えてください",
      answer:
        "ベーシックプランで、ご入会後、学期の初めから終わりまで在籍した各学期の5科目（国語・数学・英語・理科・社会）の評定が対象です。対象学期中、週1回の面談を8割以上実施いただき、かつ面談の無断欠席が学期で1回まで（前日までにご連絡のあった欠席は除く）の場合に適用されます。オール3に届かなかった場合、その学期にお支払いいただいた月額を全額返金します（入塾金・教材費・システム管理費は対象外）。3学期は学年末成績で判定し、1学期または2学期のいずれかで評定1がついた科目については、3未満でも返金対象外です。返金対象は入会後2学期までとし、3学期目以降は返金なしプランに自動移行します。各学期の通知表確定から14日以内に、通知表の写しを添えてご連絡ください。",
    });
  }

  return common;
}

/* --------------------------------------------------------------
 * B5: 代表挨拶（カード形式・角丸なし・ラベル上置き・画像回り込み）
 * -------------------------------------------------------------- */
function RepresentativeSection() {
  const members = [
    {
      label: "代表",
      name: "養田 貴大",
      imageSrc: "/images/nobilva/yoda_juku.png",
      imageAlt: "代表 養田貴大",
      body:
        "はじめまして、Nobilva 代表の養田貴大です。東京で学習塾を二校舎経営し、多くの中高生の指導や進路の相談に携わってきました。弟がリトルシニアで野球に打ち込んでいたこともあり、練習と勉強の両立の大変さは家族として間近で見てきました。その経験から生まれたのが Nobilva です。選手一人ひとりの進路を一緒に守るパートナーとして、お気軽にお声がけください。",
    },
    {
      label: "ヘッド講師",
      name: "中村 龍人",
      imageSrc: "/images/nobilva/nakamura.png",
      imageAlt: "ヘッド講師 中村龍人",
      body:
        "はじめまして、ヘッド講師の中村龍人です。都内の学習塾で個別指導や学習相談に携わってきました。私自身、高校3年の9月まで部活動を続けてから受験に切り替えた経験があります。スポーツと両立する生徒を指導してきて感じるのは、根性ではなく計画の質で両立は決まるということです。週1回の面談では、練習日程まで踏み込んだ「今週やること」を一緒に作ります。",
    },
  ];

  return (
    <Section>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {members.map((m) => (
          <div key={m.name} className="bg-white shadow-sm p-6 md:p-10">
            {/* 画像 float-left + ラベル + コメント（ラベルは画像横・コメント直上） */}
            <div className="text-sm md:text-base text-gray-800 leading-relaxed md:leading-loose">
              <Image
                src={m.imageSrc}
                alt={m.imageAlt}
                width={300}
                height={400}
                className="float-left w-32 md:w-36 lg:w-40 aspect-[3/4] object-cover object-top mr-4 md:mr-5"
              />
              {/* ラベル: 肩書き / 氏名 */}
              <div className="mb-3 md:mb-4">
                <p className="text-xs md:text-sm text-nobilva-accent font-bold">
                  {m.label}
                </p>
                <p className="font-bold text-gray-900 text-xl md:text-2xl tracking-tight">
                  {m.name}
                </p>
              </div>
              <p>{m.body}</p>
              {/* float 解除 */}
              <div className="clear-both" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

