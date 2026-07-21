"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckIcon, NobilvaLogo } from "./Icons";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { wb } from "@/lib/wb";

/**
 * 料金プランのチーム限定価格設定。
 * essentialSpecial のみ必須。basicSpecial 未指定の場合は essential の割引額を basic にも適用する。
 */
export interface TeamPricing {
  essentialSpecial: number;
  basicSpecial?: number;
  essentialNormal?: number;
  basicNormal?: number;
}

interface PricingSectionProps {
  team?: TeamPricing;
}

export const ESSENTIAL_PRICE = 18000;
export const BASIC_PRICE = 26000;

const jukuSubjects = [
  { label: "英語", amount: 15000, color: "#ef4444" },
  { label: "数学", amount: 15000, color: "#f97316" },
  { label: "国語", amount: 12000, color: "#eab308" },
  { label: "理科", amount: 10000, color: "#22c55e" },
  { label: "社会", amount: 10000, color: "#3b82f6" },
];
const jukuTotal = jukuSubjects.reduce((s, v) => s + v.amount, 0);

export function CostComparisonChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxAmount = jukuTotal;
  const nobilvaHeight = (ESSENTIAL_PRICE / maxAmount) * 100;

  return (
    <div ref={ref} className="bg-white p-5 aspect-[4/3] flex flex-col">
      <div className="flex-1 flex items-end justify-center gap-8 md:gap-12 pb-4">
        {/* Nobilva */}
        <div className="flex flex-col items-center gap-2 w-24 md:w-28">
          <span className="text-xs md:text-sm font-bold text-nobilva-accent">
            ¥{ESSENTIAL_PRICE.toLocaleString()}〜
          </span>
          <div className="w-full relative" style={{ height: "200px" }}>
            <div
              className="absolute bottom-0 w-full bg-nobilva-accent transition-all duration-1000 ease-out flex items-center justify-center"
              style={{ height: visible ? `${nobilvaHeight}%` : "0%" }}
            >
              <span className="text-[10px] md:text-xs text-white font-bold">全科目</span>
            </div>
          </div>
          <NobilvaLogo height={16} />
        </div>

        {/* 一般的な学習塾 */}
        <div className="flex flex-col items-center gap-2 w-24 md:w-28">
          <span className="text-xs md:text-sm font-bold text-gray-500">
            ¥{jukuTotal.toLocaleString()}〜
          </span>
          <div className="w-full relative" style={{ height: "200px" }}>
            {(() => {
              let offset = 0;
              return jukuSubjects.map((subj, i) => {
                const h = (subj.amount / maxAmount) * 100;
                const bottom = offset;
                offset += h;
                return (
                  <div
                    key={subj.label}
                    className="absolute w-full flex items-center justify-center transition-all duration-1000 ease-out"
                    style={{
                      bottom: `${bottom}%`,
                      height: visible ? `${h}%` : "0%",
                      backgroundColor: subj.color,
                      transitionDelay: visible ? `${i * 150}ms` : "0ms",
                    }}
                  >
                    <span className="text-[10px] md:text-xs text-white font-bold">{subj.label}</span>
                  </div>
                );
              });
            })()}
          </div>
          <span className="text-xs md:text-sm font-bold text-gray-700">一般的な学習塾</span>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-2 text-center">
        <p className="text-[10px] md:text-xs text-gray-400">※5科目受講時の月額目安</p>
      </div>
    </div>
  );
}

interface PlanFeature {
  label: string;
  enabled: boolean;
}

interface PlanCardProps {
  planName: string;
  originalPrice: number;
  discountedPrice: number;
  isTeam: boolean;
  features: PlanFeature[];
  recommended?: boolean;
  description: string;
  descriptionAccent?: boolean;
}

export function PlanCard({
  planName,
  originalPrice,
  discountedPrice,
  isTeam,
  features,
  recommended,
  description,
  descriptionAccent,
}: PlanCardProps) {
  return (
    <div className="bg-white shadow-sm p-6 md:p-10 flex flex-col text-center relative">
      {recommended && (
        <span className="absolute top-0 left-0 bg-nobilva-accent text-white text-xs font-bold px-3 py-1">
          おすすめ
        </span>
      )}

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-5 md:mb-6 mt-2">
        {planName}
      </h3>

      {/* 価格 */}
      {isTeam ? (
        <div className="mb-6 md:mb-8">
          <p className="text-xs md:text-sm font-bold text-nobilva-accent mb-1">
            チーム限定価格
          </p>
          <div className="flex items-baseline justify-center flex-wrap gap-x-2">
            <span className="text-lg md:text-xl font-bold text-gray-500">月</span>
            <span className="text-xl md:text-2xl font-bold text-gray-400 line-through decoration-nobilva-accent decoration-2">
              {originalPrice.toLocaleString()}円
            </span>
            <span className="text-3xl md:text-5xl font-bold text-nobilva-accent leading-none">
              {discountedPrice.toLocaleString()}
            </span>
            <span className="text-lg md:text-xl font-bold text-nobilva-accent">円</span>
          </div>
        </div>
      ) : (
        <div className="mb-6 md:mb-8">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-lg md:text-xl font-bold text-gray-500">月</span>
            <span className="text-3xl md:text-5xl font-bold text-nobilva-accent leading-none">
              {originalPrice.toLocaleString()}
            </span>
            <span className="text-lg md:text-xl font-bold text-nobilva-accent">円</span>
          </div>
        </div>
      )}

      {/* 機能タグ */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {features.map((f) =>
          f.enabled ? (
            <span
              key={f.label}
              className="inline-flex items-center bg-nobilva-main text-gray-900 text-xs md:text-sm font-bold px-4 py-2"
            >
              {f.label}
            </span>
          ) : (
            <span
              key={f.label}
              className="inline-flex items-center bg-gray-300 text-gray-500 text-xs md:text-sm font-bold px-4 py-2 line-through decoration-gray-500"
            >
              {f.label}
            </span>
          )
        )}
      </div>

      {/* 説明 */}
      <p
        className={`text-sm md:text-base leading-relaxed mt-auto text-left ${
          descriptionAccent ? "text-gray-800" : "text-gray-600"
        }`}
      >
        {description}
      </p>

      {/* システム管理費（カード最下部） */}
      <p className="text-[9px] md:text-[10px] text-gray-400 mt-4 text-left">
        ※別途システム管理費1,000円をいただきます。
      </p>
    </div>
  );
}

/**
 * フォローアップ個別指導カード（プラン下段に表示するオプション枠）。
 * LP・料金ページ・チームページで同一デザインを使い回す。
 */
export function OptionSessionCard() {
  return (
    <div className="relative bg-white shadow-sm p-5 pt-8 md:p-8 md:pt-10 flex flex-col gap-4 md:gap-6 text-center md:text-left">
      <span className="absolute top-0 left-0 bg-gray-500 text-white text-xs font-bold px-3 py-1">
        オプション
      </span>

      <div className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900">
          フォローアップ個別指導
        </h3>
        <div className="flex items-baseline justify-center md:justify-start gap-2 md:gap-3 flex-wrap">
          <p className="text-xs md:text-sm font-bold text-gray-500">
            1コマ70分（単発利用OK）
          </p>
          <span className="text-lg md:text-2xl font-bold text-gray-900 leading-none">
            ご相談ください
          </span>
        </div>
      </div>

      <p className="text-xs md:text-sm leading-relaxed text-left text-gray-600">
        「テスト前だけこの単元をカバーしたい」など、不安な内容を単発でお申し込みいただけるオプションです。
      </p>
    </div>
  );
}

export interface PricingCoreProps {
  /** チーム限定価格。指定すると PlanCard が isTeam 表示になり「チーム限定価格」ラベル + line-through が出る */
  team?: TeamPricing;
  /** ベーシックプラン上部の「🛡️ オール3保証 対象プラン」バッジを出すか */
  showAllThreeBadge?: boolean;
  /** フォローアップ個別指導カードを出すか（デフォルト true） */
  showOption?: boolean;
}

/**
 * 料金セクションのコア。プランカード2枚 + フォローアップ個別指導カードだけを担当する。
 * 見出し・塾比較・返金バナーなど周辺要素は含めず、呼び出し側で自由に組み合わせる。
 */
export function PricingCore({
  team,
  showAllThreeBadge = false,
  showOption = true,
}: PricingCoreProps = {}) {
  const isTeam = Boolean(team);
  const essentialNormal = team?.essentialNormal ?? ESSENTIAL_PRICE;
  const essentialSpecial = team?.essentialSpecial ?? ESSENTIAL_PRICE;
  const basicNormal = team?.basicNormal ?? BASIC_PRICE;
  const basicSpecial =
    team?.basicSpecial ?? basicNormal - (essentialNormal - essentialSpecial);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <PlanCard
          planName="エッセンシャルプラン"
          originalPrice={essentialNormal}
          discountedPrice={essentialSpecial}
          isTeam={isTeam}
          features={[
            { label: "週一回のオンライン面談", enabled: true },
            { label: "毎日チャットで進捗確認", enabled: false },
          ]}
          description="週1回の面談で、練習や試合に合わせた1週間分の計画をお渡しします。計画さえあれば自分で進められるお子さま向けの、シンプルに始めやすいプランです。"
        />
        <div className="relative">
          {showAllThreeBadge && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-sky-500 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
              🛡️ オール3保証 対象プラン
            </div>
          )}
          <PlanCard
            planName="ベーシックプラン"
            originalPrice={basicNormal}
            discountedPrice={basicSpecial}
            isTeam={isTeam}
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

      {showOption && (
        <div className="mt-6 md:mt-8">
          <OptionSessionCard />
        </div>
      )}
    </>
  );
}

export function PricingSection({ team }: PricingSectionProps = {}) {
  return (
    <Section id="pricing">
      <SectionHeading center>料金プラン</SectionHeading>

      <PricingCore team={team} />

      {/* 全科目まとめて */}
      <p className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-900 text-center mt-10 md:mt-14">
        全科目まとめて、この金額です
      </p>

      {/* 料金比較の注意喚起 */}
      <div className="bg-nobilva-accent/5 p-6 md:p-8 mt-10 md:mt-14">
        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 mb-6 justify-center text-center">
          <p className="text-base md:text-lg lg:text-xl font-bold text-nobilva-accent">
            &#9650; 料金比較の前に
          </p>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
            その価格表記は、何科目分ですか？
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* 左: アニメーション積み上げ棒グラフ */}
          <div className="w-full md:w-[42%] shrink-0">
            <CostComparisonChart />
          </div>

          {/* 右: テキスト */}
          <div className="w-full md:flex-1 space-y-4">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {wb("オンライン個別指導サービスの/多くは、/表記が「1科目あたり」に/なっています。")}
              {wb("一見お得に見えても、/複数科目を受講すると/料金が積み上がる仕組みです。")}
            </p>

            <div className="border-t border-gray-200 pt-5">
              <p className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center flex-wrap gap-x-1">
                <NobilvaLogo height={20} />
                はそもそも料金体系が違います。
              </p>
              <ul className="space-y-3 text-base md:text-lg text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckIcon color="accent" />
                  一つの月額で <span className="font-bold">全科目まとめて</span> 対応
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon color="accent" />
                  テスト前だけ理科を増やしたい、なども追加料金なし
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon color="accent" />
                  学習計画・進捗管理も料金内に含む
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 30日返金保証バナー */}
      <RefundGuaranteeBanner />

      {/* チーム誘導バナー */}
      {!team && (
        <div className="bg-gray-50 p-6 md:p-8 mt-10 md:mt-14 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
              チーム事務局 / 父母会の関係者の方へ
            </h3>
            <p className="text-sm text-gray-600">
              {wb("リトルシニア・ボーイズ・/ポニー・ヤング・/中高野球部の父母会向けに、/事務局負担ゼロのチーム特別価格を/ご用意しています。")}
            </p>
          </div>
          <Link
            href="/ja/services/nobilva/for-teams"
            className="shrink-0 inline-block bg-orange-500 text-white font-bold text-sm md:text-base px-6 py-3 hover:bg-orange-600 transition-colors"
          >
            チーム特別価格を見る →
          </Link>
        </div>
      )}
    </Section>
  );
}

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

function RefundGuaranteeBanner() {
  return (
    <div className="mt-8 md:mt-10 bg-sky-400 text-white font-rounded overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr]">
        {/* 左パネル: [30日以内なら / 全額返金] + 説明文（縦積み） */}
        <div className="px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 sm:border-r sm:border-white/40">
          <p
            className="text-lg md:text-xl lg:text-2xl font-black text-white mb-0.5 md:mb-1"
            style={whiteWithYellowStroke}
          >
            入会後30日以内なら
          </p>
          <p className="text-4xl md:text-5xl lg:text-6xl font-black leading-none whitespace-nowrap">
            全額返金
          </p>
          <p className="font-sans font-normal text-xs md:text-sm text-white/95 leading-relaxed mt-5 md:mt-6">
            「思っていたのと違った」「うちの子には合わなかった」——そんなときは、理由を問わずご入会時にお支払いいただいた月額料金を全額返金します。まずは安心してお試しください。
          </p>
        </div>

        {/* 右パネル: [さらに…/いつでも解約OK/解約違約金/キャンセル料は] + [0円]（下揃え） */}
        <div className="px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 border-t border-white/40 sm:border-t-0 flex flex-col justify-center items-center sm:items-start">
          <div className="flex items-end gap-3 md:gap-4">
            <div className="flex flex-col leading-tight">
              <span className="text-xs md:text-sm font-bold leading-none">さらに…</span>
              <span className="text-lg md:text-xl lg:text-2xl font-black leading-none mt-0.5 mb-3 md:mb-4 whitespace-nowrap">
                いつでも解約OK
              </span>
              <span className="text-xs md:text-sm font-bold whitespace-nowrap">
                解約違約金・キャンセル料は
              </span>
            </div>
            <p className="flex items-baseline gap-0.5 font-black leading-none shrink-0">
              <span
                className="text-nobilva-main text-5xl md:text-7xl lg:text-8xl"
                style={yellowOutlineStyleThick}
              >
                0
              </span>
              <span className="text-lg md:text-2xl">円</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
