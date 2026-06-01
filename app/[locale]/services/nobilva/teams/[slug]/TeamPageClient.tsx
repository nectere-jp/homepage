"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/teams";
import { ThreePillarsSection } from "@/components/nobilva/ThreePillarsSection";
import { ResultsSnippetSection } from "@/components/nobilva/ResultsSnippetSection";
import { FAQExcerptSection } from "@/components/nobilva/FAQExcerptSection";
import { PricingSection } from "@/components/nobilva/PricingSection";
import { TrustBadges } from "@/components/nobilva/TrustBadges";
import { DiagnosisCTA } from "@/components/nobilva/DiagnosisCTA";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { EndorsementsSection } from "@/components/nobilva/EndorsementsSection";
import { wb } from "@/lib/wb";

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
  const ctaLabel = "無料学習相談に申し込む/（月20名限定）";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-nobilva-light to-white pt-28 md:pt-36 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center">
          {/* Permission notice */}
          {team.permissionPerson && (
            <p className="text-xs text-gray-500 mb-4">
              {team.permissionPerson}様に許可をいただいて配信しております
            </p>
          )}

          {/* Team logo */}
          {team.logoUrl && (
            <div className="mb-6">
              <Image
                src={team.logoUrl}
                alt={`${team.teamName} ロゴ`}
                width={120}
                height={120}
                className="mx-auto object-contain"
              />
            </div>
          )}

          {/* Team badge */}
          <div className="inline-flex items-center gap-2 bg-white border-2 border-nobilva-accent rounded-full px-5 py-2 mb-6 shadow-sm">
            <span className="w-3 h-3 rounded-full bg-nobilva-accent" />
            <span className="text-sm font-bold text-nobilva-accent">
              {team.teamName}様 専用ページ
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
            <span className="bg-nobilva-main px-3 py-1 inline-block">
              {team.teamName}様
            </span>
            の
            <br />
            <span className="mt-2 block">
              {wb("選手・保護者の皆さまへ")}
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            野球と勉強の両立を、専属メンターと日割り計画で支える学習サポートです。
            {team.contactPerson &&
              `${team.contactPerson}様からのご紹介で、チーム特別価格でお申し込みいただけます。`}
          </p>

          {/* Special price banner */}
          <div className="bg-white border-2 border-nobilva-accent rounded-2xl p-6 md:p-8 max-w-lg mx-auto mb-8 shadow-lg">
            <p className="text-sm font-bold text-nobilva-accent mb-2">
              {team.discountLabel}
            </p>
            <div className="flex items-baseline justify-center gap-3 mb-2">
              <span className="text-gray-400 line-through decoration-red-500 decoration-2 text-lg">
                {team.normalPrice.toLocaleString()}円/月
              </span>
              <span className="text-4xl md:text-5xl font-black text-nobilva-accent">
                {team.specialPrice.toLocaleString()}
                <span className="text-base font-medium text-gray-500">
                  円/月〜
                </span>
              </span>
            </div>
            {discount > 0 && (
              <p className="text-sm text-gray-600">
                全プラン、通常価格より
                <span className="font-bold text-nobilva-accent">
                  毎月{discount.toLocaleString()}円おトク
                </span>
              </p>
            )}
          </div>

          {/* CTA */}
          <DiagnosisCTA
            variant="hero"
            href={diagnosisHref}
            onClick={handleCTAClick}
            label={ctaLabel}
          />

          {/* Trust badges */}
          <TrustBadges
            className="mt-6"
            extras={["完全無料・勧誘なし"]}
          />
        </div>
      </section>

      {/* Endorsements */}
      {team.endorsements && (
        <EndorsementsSection endorsements={team.endorsements} />
      )}

      {/* Three Pillars (reused) */}
      <ThreePillarsSection />

      {/* Pricing (reused with team discount) */}
      <PricingSection
        team={{
          discount,
          discountLabel: team.discountLabel,
          diagnosisHref,
          onCTAClick: handleCTAClick,
        }}
      />

      {/* Results (reused) */}
      <ResultsSnippetSection />

      {/* FAQ (reused) */}
      <FAQExcerptSection />

      {/* Final CTA */}
      <SubpageCTA
        variant="final"
        heading={wb("まずは無料学習相談で、/お気軽にご相談ください。")}
        description={
          <>
            <p>
              30分のオンライン面談で、お子さんの練習スケジュール・得意苦手・志望進路を踏まえた学習プランを具体的にお見せします。
            </p>
            <p>判断材料として、お持ち帰りください。</p>
          </>
        }
        ctaHref={diagnosisHref}
        onCTAClick={handleCTAClick}
        ctaLabel={ctaLabel}
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
