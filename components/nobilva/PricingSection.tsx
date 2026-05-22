import { DiagnosisCTA } from "./DiagnosisCTA";
import { CheckIcon } from "./Icons";
import { OutlineLink } from "./OutlineLink";
import { SafetyCards } from "./SafetyCards";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
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
      {/* リード文 */}
      <SectionHeading center className="mb-4" description={
        <p>科目が増えても、料金は変わりません。</p>
      }>
        一つの月額で、/全科目をまとめて。
      </SectionHeading>

      {/* 全科目パック訴求バナー */}
      <div className="bg-nobilva-main/20 rounded-2xl p-6 md:p-8 mb-10 text-center">
        <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          全科目まとめて、この金額。
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 bg-nobilva-accent text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            月「最大」{basicPrice.toLocaleString()}円
          </span>
          <span className="inline-flex items-center text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100">
            ※ 1対1個別指導オプションは別途
          </span>
        </div>
        <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
          {wb("国語・数学・英語・理科・社会、/必要なときに/必要な科目を、/追加料金なしで。")}
          <br />
          {wb("「テスト前だけ/理科を強化したい」/")}
          {wb("「内申のために/実技4教科も/見てほしい」/といった場合にも、")}
          <br className="hidden md:inline" />
          {wb("最大料金の範囲内で/対応いたします。")}
          <br />
          {wb("科目を増やしても、/料金が/これ以上/膨れることはありません。")}
        </p>
      </div>

      {/* プランカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
        {/* エッセンシャル */}
        <div
          className={`bg-white rounded-2xl p-6 md:p-8 flex flex-col justify-center ${team ? "border-2 border-nobilva-accent relative" : "border border-gray-200"}`}
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
                週1回のオンライン面談（40〜50分）
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              学習計画をプロに任せたい、週1面談でしっかり方向性を確認したい方。シンプルで始めやすいプランです。
            </p>
          </div>
        </div>

        {/* ベーシック（おすすめ） */}
        <div className="bg-white border-2 border-nobilva-accent rounded-2xl p-6 md:p-8 relative flex flex-col justify-center">
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
                週1回のオンライン面談（40〜50分）
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm md:text-base text-gray-700 font-medium">
                毎日チャットで進捗管理
              </span>
            </div>
          </div>

          <div className="bg-nobilva-light rounded-lg p-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              毎日の学習習慣を定着させたい、モチベーション維持に不安がある方。三本柱がフルで機能するプランです。
            </p>
          </div>
        </div>
      </div>

      {/* 料金比較の注意 */}
      <div className="bg-nobilva-accent/5 rounded-2xl p-6 md:p-8 mb-10 text-center">
        <p className="text-nobilva-accent text-3xl mb-3">&#9888;</p>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
          料金比較の前にチェックしたいこと
        </h3>
        <p className="text-base md:text-lg font-bold text-gray-800 mb-4">
          「月額○○円〜」の表記は、何科目分ですか？
        </p>
        <div className="max-w-xl mx-auto space-y-3 text-sm md:text-base text-gray-600 leading-relaxed mb-6">
          <p>
            {wb("オンライン個別指導サービスの/多くは、/表記が「1科目あたり」に/なっています。")}
            <br />
            {wb("一見お得に見えても、/複数科目を受講すると/料金が積み上がる仕組みです。")}
          </p>
          <p>
            {wb("たとえば/「1科目19,800円」のサービスで/英・数・国の3科目を/受講すると、")}
            <br />
            {wb("月額は")}
            <span className="font-bold text-gray-900">{wb("約60,000円")}</span>
            {wb("になります。")}
          </p>
        </div>
        <div className="border-t border-gray-200 pt-5 max-w-md mx-auto">
          <p className="text-sm font-bold text-gray-800 mb-3">
            Nobilva はそもそも料金体系が違います。
          </p>
          <ul className="space-y-2 text-sm text-gray-700 text-left inline-block">
            <li className="flex items-start gap-2">
              <CheckIcon color="accent" />
              一つの月額で<span className="font-bold">全科目まとめて</span>
              対応
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon color="accent" />
              テスト前だけ理科を増やしたい、なども追加料金なし
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon color="accent" />
              学習計画・進捗管理も料金内に含む
            </li>
          </ul>
        </div>
        <p className="text-gray-400 text-xs mt-5">
          サービスを比較する際は、「複数科目を受講した場合の月額総額」で比べることをおすすめします。
        </p>
      </div>

      <SafetyCards className="mb-10" />

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {!team && (
          <OutlineLink href="/ja/services/nobilva/pricing">
            料金の詳細を見る
          </OutlineLink>
        )}
        {team ? (
          <DiagnosisCTA
            href={team.diagnosisHref}
            onClick={team.onCTAClick}
            label="無料相談に申し込む"
          />
        ) : (
          <DiagnosisCTA />
        )}
      </div>
    </Section>
  );
}
