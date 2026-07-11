"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/teams";
import { CTABanner } from "@/components/nobilva/CTABanner";
import { EmpathySection } from "@/components/nobilva/EmpathySection";
import { ConcernsSection } from "@/components/nobilva/ConcernsSection";
import { SolutionIntroSection } from "@/components/nobilva/SolutionIntroSection";
import { WhyNobilvaSection } from "@/components/nobilva/WhyNobilvaSection";
import { DayFlowSection } from "@/components/nobilva/DayFlowSection";
import { TestimonialsSection } from "@/components/nobilva/TestimonialsSection";
import { PricingSection } from "@/components/nobilva/PricingSection";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { FinalCTASection } from "@/components/nobilva/FinalCTASection";
import { FixedDiagnosisCTA } from "@/components/nobilva/FixedDiagnosisCTA";
import { EndorsementsSection } from "@/components/nobilva/EndorsementsSection";

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
  }, [team.slug]);

  const handleCTAClick = useCallback(() => {
    trackEvent(team.slug, "cta_click");
  }, [team.slug]);

  const diagnosisHref = `/ja/services/nobilva/diagnosis?team=${team.slug}`;
  const discount = team.normalPrice - team.specialPrice;

  return (
    <div className="bg-white min-h-screen">
      {/* 1. チーム Hero */}
      <TeamHero team={team} />

      {/* CTA バナー（Hero直下） */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
        <CTABanner
          diagnosisHref={diagnosisHref}
          onCTAClick={handleCTAClick}
          hideLine
          monitorTeamBadge={team.monitorTeam}
        />
      </div>

      {/* 固定CTA（デスクトップ右下） */}
      <FixedDiagnosisCTA href={diagnosisHref} onCTAClick={handleCTAClick} />

      {/* Endorsements（許可者・推薦者コメント） */}
      {team.endorsements && team.endorsements.length > 0 && (
        <EndorsementsSection endorsements={team.endorsements} />
      )}

      {/* 2. オール3死守 */}
      <EmpathySection />

      {/* 3. 6つの悩み */}
      <ConcernsSection />

      {/* お悩み → Nobilvaにお任せ */}
      <SolutionIntroSection />

      {/* Nobilvaが選ばれる理由 */}
      <WhyNobilvaSection
        diagnosisHref={diagnosisHref}
        onCTAClick={handleCTAClick}
        hideLine
        monitorTeamBadge={team.monitorTeam}
      />

      {/* Nobilvaユーザーの一日 */}
      <DayFlowSection />

      {/* 利用者様の声 */}
      <TestimonialsSection
        diagnosisHref={diagnosisHref}
        onCTAClick={handleCTAClick}
        hideLine
        monitorTeamBadge={team.monitorTeam}
      />

      {/* 料金プラン（チーム特別価格） */}
      <PricingSection
        team={{
          discount,
          discountLabel: team.discountLabel,
          diagnosisHref,
          onCTAClick: handleCTAClick,
        }}
      />

      {/* よくある質問（チーム保護者向け） */}
      <SubpageFAQ
        items={buildTeamFAQ(team)}
        heading="よくある質問"
        headingAlign="center"
        seeAllHref="/ja/services/nobilva/faq"
        id="faq"
        numbered
      />

      {/* 最終CTA */}
      <FinalCTASection
        diagnosisHref={diagnosisHref}
        onCTAClick={handleCTAClick}
        hideLine
        monitorTeamBadge={team.monitorTeam}
      />

      {/* Footer link */}
      <section className="bg-white py-8">
        <div className="text-center">
          <Link
            href="/ja/services/nobilva"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Nobilva サービス詳細を見る
          </Link>
        </div>
      </section>
    </div>
  );
}

function TeamHero({ team }: { team: Team }) {
  return (
    <section className="bg-white pt-5 pb-6">
      <div className="px-5">
        <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden">
          <Image
            src="/images/nobilva/hero.jpg"
            alt="ベンチで単語帳を読む野球部員"
            fill
            priority
            className="object-cover object-center"
          />
          {/* テキストオーバーレイ */}
          <div className="absolute inset-0 flex items-center pt-8 md:pt-12">
            <div className="px-8 md:px-12 lg:px-16 flex flex-col gap-4 md:gap-6">
              {/* ロゴ + チーム名（横並び） */}
              <div className="flex items-center gap-3 md:gap-4">
                {team.logoUrl && (
                  <div className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white/90 rounded-lg p-2 shadow-md flex-shrink-0">
                    <div className="relative w-full h-full">
                      <Image
                        src={team.logoUrl}
                        alt={`${team.teamName} ロゴ`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-nobilva-accent tracking-tight">
                  {team.teamName}
                </p>
              </div>

              {/* 選手・保護者の皆さまへ */}
              <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 tracking-tight">
                <span className="bg-nobilva-main px-1">選手・保護者</span>
                の皆さまへ
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 tracking-tight">
                <span className="underline decoration-nobilva-accent decoration-4 underline-offset-4">
                  野球と勉強の両立
                </span>
                を
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 tracking-tight">
                サポートします
              </p>
            </div>
          </div>
        </div>
      </div>
      {team.permissionPerson && (
        <p className="text-center text-xs text-gray-500 mt-3">
          {team.permissionPerson}様に許可をいただいて配信しております
        </p>
      )}
    </section>
  );
}

function buildTeamFAQ(team: Team) {
  const introducer = team.contactPerson
    ? `${team.contactPerson}様（ご紹介者）`
    : "ご紹介者";
  const permission = team.permissionPerson
    ? `${team.permissionPerson}様（配信許可者）`
    : null;

  return [
    {
      question: "この利用は監督や/他の保護者に/知られますか？",
      answer:
        `いいえ。Nobilva はご家庭ごとに直接契約するサービスで、お子さまの申込状況・成績・学習内容を、監督・コーチ・他の保護者に共有することは一切ありません。${introducer}${permission ? `や${permission}` : ""}にも、個別のお申込みや進捗はお伝えしていません。「同じチーム内で誰が使っているか」もチーム側には開示していません。安心してご検討ください。`,
    },
    {
      question: "チーム特別価格の/適用条件は？",
      answer:
        `${team.teamName}様の選手・保護者の方であることが確認できれば、通常価格 ${team.normalPrice.toLocaleString()}円/月 → 特別価格 ${team.specialPrice.toLocaleString()}円/月〜 が、ご利用継続中ずっと適用されます。適用は無料学習相談のお申込み時、または面談時に「${team.teamName}」経由の旨をお伝えいただくだけで完了します。途中でチームを卒業された後も、契約継続中は特別価格を維持します。`,
    },
    {
      question: "兄弟で利用する場合、/割引はありますか？",
      answer:
        "はい。兄弟同時受講の場合、2人目以降は月額さらに10%割引となります。チーム特別価格と併用可能です。中学野球と高校野球の兄弟、あるいは異なる部活動でも、部活種別を問わずご利用いただけます。",
    },
    {
      question: "練習で疲れていても・/遠征が多くても/続けられますか？",
      answer:
        "はい。メンターが疲労度・体調・遠征スケジュールを毎週ヒアリングして、無理のない計画に調整します。疲れた日は15分メニュー、遠征帰りは復習中心、大会前は最小限に、と柔軟に量を変えて「ゼロにならない」状態を維持します。「今日はしんどい」もチャットで正直に伝えられる関係を大切にしています。",
    },
    {
      question: "スポーツ推薦と/一般進学、/両方の準備はできますか？",
      answer:
        "はい。Nobilva は「進路の選択肢を最後まで残す」ことを最重要視しています。週1面談で、推薦基準（評定・英検・出席）と、一般受験に向けた基礎学力を並行して設計します。中3・高3の後半で進路を切り替えても対応できる状態を目指します。",
    },
    {
      question: "契約期間の縛りや/解約金はありますか？",
      answer:
        "ありません。月単位の契約で、いつでも解約可能です。解約手数料も一切発生しません。「合わなければ辞められる」状態を維持しています。解約希望月の前月25日までにメールでご連絡ください。",
    },
    {
      question: "30日全額返金保証の/条件は？",
      answer:
        "入会から30日以内であれば、申し出のみで全額返金いたします（理由不要）。教材費（市販書）は返金対象外です。「1ヶ月試してみて、合わなければ辞められる」という心理的ハードルを下げる仕組みです。",
    },
    {
      question: "無料学習相談は/どんな内容ですか？",
      answer:
        "オンラインで30分程度の面談です。お子さまの現状（練習スケジュール・得意苦手・志望進路）を伺ったうえで、現実的な学習プランを具体的にご提案します。判断材料を持ち帰っていただく場で、無理な勧誘はしません。月20名までの限定枠です。",
    },
  ];
}
