import Link from "next/link";
import Image from "next/image";
import { CheckIcon } from "./Icons";
import { Section } from "./Section";
import { wb } from "@/lib/wb";

interface TeamPricing {
  discount: number;
  discountLabel: string;
  diagnosisHref: string;
  onCTAClick?: () => void;
}

interface PricingSectionProps {
  team?: TeamPricing;
}

const ESSENTIAL_PRICE = 18000;
const BASIC_PRICE = 26000;

export function PricingSection({ team }: PricingSectionProps = {}) {
  const essentialPrice = team
    ? ESSENTIAL_PRICE - team.discount
    : ESSENTIAL_PRICE;
  const basicPrice = team ? BASIC_PRICE - team.discount : BASIC_PRICE;

  return (
    <Section id="pricing">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 text-center mb-10 md:mb-14">
        料金プラン
      </h2>

      {/* プランカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* エッセンシャル */}
        <div
          className={`bg-white rounded-2xl p-6 md:p-8 flex flex-col ${team ? "border-2 border-nobilva-accent relative" : "border border-gray-200"}`}
        >
          {team && (
            <span className="absolute -top-3 left-6 bg-nobilva-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              チーム特別価格
            </span>
          )}
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            エッセンシャルプラン
          </h3>
          {team ? (
            <div className="mb-1">
              <span className="text-lg text-gray-400 line-through decoration-red-500 decoration-2 mr-3">
                {ESSENTIAL_PRICE.toLocaleString()}円
              </span>
              <span className="text-3xl md:text-4xl font-bold text-nobilva-accent">
                {essentialPrice.toLocaleString()}
                <span className="text-base font-medium text-gray-500">
                  円/月（税込・1人）
                </span>
              </span>
            </div>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-nobilva-accent mb-1">
              {ESSENTIAL_PRICE.toLocaleString()}
              <span className="text-base font-medium text-gray-500">
                円/月（税込・1人）
              </span>
            </p>
          )}
          <p className="text-sm text-gray-500 mb-6">全科目対応</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm md:text-base text-gray-700">
                日割り学習計画の作成（全科目）
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm md:text-base text-gray-700">
                週1回のオンライン面談（30分）
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-auto">
            <p className="text-sm text-gray-600 leading-relaxed">
              学習計画をプロに任せたい、週1面談でしっかり方向性を確認したい方。シンプルで始めやすいプランです。
            </p>
          </div>
        </div>

        {/* ベーシック（おすすめ） */}
        <div className="bg-white border-2 border-nobilva-accent rounded-2xl p-6 md:p-8 relative flex flex-col">
          <div className="absolute -top-3 left-6 flex gap-2">
            <span className="bg-nobilva-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              おすすめ
            </span>
            {team && (
              <span className="bg-nobilva-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                チーム特別価格
              </span>
            )}
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            ベーシックプラン
          </h3>
          {team ? (
            <div className="mb-1">
              <span className="text-lg text-gray-400 line-through decoration-red-500 decoration-2 mr-3">
                {BASIC_PRICE.toLocaleString()}円
              </span>
              <span className="text-3xl md:text-4xl font-bold text-nobilva-accent">
                {basicPrice.toLocaleString()}
                <span className="text-base font-medium text-gray-500">
                  円/月（税込・1人）
                </span>
              </span>
            </div>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-nobilva-accent mb-1">
              {BASIC_PRICE.toLocaleString()}
              <span className="text-base font-medium text-gray-500">
                円/月（税込・1人）
              </span>
            </p>
          )}
          <p className="text-sm text-gray-500 mb-6">全科目対応</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm md:text-base text-gray-700">
                日割り学習計画の作成（全科目）
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm md:text-base text-gray-700">
                週1回のオンライン面談（30分）
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm md:text-base text-gray-700 font-medium">
                毎日チャットで進捗管理
              </span>
            </div>
          </div>

          <div className="bg-nobilva-accent/10 rounded-lg p-4 mt-auto">
            <p className="text-sm text-gray-700 leading-relaxed">
              毎日の学習習慣を定着させたい、モチベーション維持に不安がある方。三本柱がフルで機能するプランです。
            </p>
          </div>
        </div>
      </div>

      {/* 全科目まとめて */}
      <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 text-center mt-10 md:mt-14">
        全科目まとめて、この金額です
      </p>

      {/* 料金比較の注意喚起 */}
      <div className="bg-nobilva-accent/5 rounded-2xl p-6 md:p-8 mt-10 md:mt-14">
        <p className="text-sm font-bold text-nobilva-accent mb-1 text-center md:text-left">
          &#9650; 料金比較の前に
        </p>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-6 text-center md:text-left">
          その価格表記は、何科目分ですか？
        </h3>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* 左: グラフ画像 */}
          <div className="w-full md:w-[42%] shrink-0">
            <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src="/images/nobilva/cost-comparison.png"
                alt="塾・オンライン学習サービスの料金比較グラフ"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </div>
          </div>

          {/* 右: テキスト */}
          <div className="w-full md:flex-1 space-y-4">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {wb("オンライン個別指導サービスの/多くは、/表記が「1科目あたり」に/なっています。")}
              {wb("一見お得に見えても、/複数科目を受講すると/料金が積み上がる仕組みです。")}
            </p>

            <div className="border-t border-gray-200 pt-5">
              <p className="text-base md:text-lg font-bold text-gray-900 mb-4">
                Nobilva はそもそも料金体系が違います。
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

      {/* チーム誘導バナー */}
      {!team && (
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mt-10 md:mt-14 flex flex-col md:flex-row items-center gap-4 md:gap-8">
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
            className="shrink-0 inline-flex items-center gap-1 text-gray-700 font-bold text-sm md:text-base hover:underline"
          >
            チーム特別価格を見る
            <span>&rarr;</span>
          </Link>
        </div>
      )}
    </Section>
  );
}
