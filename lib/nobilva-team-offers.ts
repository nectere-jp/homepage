/**
 * Nobilva のチーム向けオファー（teams.json の offerVariant）の条件の単一ソース
 *
 * チーム専用ページ（/services/nobilva/teams/[slug]）の表示と、
 * チーム別の特商法表記（/legal/nobilva/commercial-disclosure/[slug]）が共にここを参照する。
 * 条件を変えるときは、ここを直せば両方に反映される。
 */

import { nobilvaPricing } from "./nobilva-pricing";

/** モニター型（A / A2）の月額割引 */
export const monitorDiscount = {
  /** 割引額（税抜） */
  monthlyAmountYen: 3000,
  /** 割引の期間 */
  periodDescription: "翌学期末まで",
  /** 対象プラン */
  planKeys: ["essential", "basic"] as const,
} as const;

/** モニター型 A の初月無料 */
export const monitorFirstMonthFree = {
  description: "初回費用のうち、初月の日割り分を無料とします",
} as const;

export interface GuaranteeTermsSection {
  title: string;
  items: string[];
}

/** オール3保証（オファー B）の適用条件 */
export const GUARANTEE_TERMS_SECTIONS: GuaranteeTermsSection[] = [
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
      "入会金・教材費・システム管理費、その他オプション費用は返金対象外です。",
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

export const GUARANTEE_TERMS_NOTE =
  "本保証は、Nectere（Nobilva運営者）と会員様との間の合意に基づくものです。適用の可否はNectereが最終的に判断します。ご不明点はNobilva事務局までお問い合わせください。";

/** 税抜金額から税込金額を出す（1 円単位） */
export function withTax(amountYen: number): number {
  return Math.round((amountYen * (100 + nobilvaPricing.taxRatePercent)) / 100);
}
