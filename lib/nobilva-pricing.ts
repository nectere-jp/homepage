/**
 * Nobilva の料金・支払い・解約条件の単一ソース
 *
 * 利用規約（content/legal/nobilva/terms-of-service.ja.md）と
 * 特商法表記（content/legal/nobilva/commercial-disclosure.ja.md）が共にここを参照する。
 * サービスページ（/services/nobilva）の表示値もこれに揃える。
 */

export const nobilvaPricing = {
  // 入会金（入会時 1 回限り）
  enrollmentFee: {
    amountYen: 18000,
    taxIncluded: true, // 税込（§8-1 で確定）
    description: "入会時に 1 回限りお支払いいただくもの",
  },

  // 月額プラン
  plans: {
    essential: {
      key: "essential",
      name: "エッセンシャルプラン",
      monthlyAmountYen: 18000, // 税抜
      monthlyAmountYenTaxIncluded: 19800, // 税込（1 円単位。18000 * 1.1）
      description: "週 1 回のオンライン面談で 1 週間分の学習計画を立てるプラン",
    },
    basic: {
      key: "basic",
      name: "ベーシックプラン",
      monthlyAmountYen: 26000, // 税抜
      monthlyAmountYenTaxIncluded: 28600, // 税込
      description:
        "週 1 回のオンライン面談に加えて、毎日のチャットで実行まで伴走するプラン",
    },
  },

  // システム管理費（月額、全プラン共通で別途発生）
  systemFee: {
    monthlyAmountYen: 1000, // 税抜（§2-E-4 で改訂）
    monthlyAmountYenTaxIncluded: 1100, // 税込
  },

  // オプション: フォローアップ個別指導
  optionalCoaching: {
    name: "フォローアップ個別指導",
    description: "1 コマ 70 分、単発利用可。料金は個別見積",
  },

  // 消費税
  taxRatePercent: 10,

  // 支払い方法
  payment: {
    firstPeriod: "初回費用（入会金・初月の日割り分・翌月分）は銀行振込",
    recurring: "3 か月目以降は毎月 27 日に、ご登録いただいた口座より自動引落",
    recurringDay: 27,
    accountRegistrationDeadline: "引落月の前月 25 日（土日祝日の場合はその前営業日）",
  },

  // 解約
  cancellation: {
    deadlineDescription: "退会希望月の前月 10 日まで",
    deadlineDay: 10,
    feeDescription: "違約金・キャンセル料は 0 円",
    feeYen: 0,
  },

  // 全額返金保証
  refundGuarantee: {
    daysFromEnrollment: 30,
    scope:
      "月額料金が対象。市販の教材費は対象外。入会後に面談・チャットの利用があった場合は、ご利用分を日割りで差し引いた額を返金",
  },

  // 休会
  hiatus: {
    deadlineDescription: "休会開始月の前月 10 日まで",
    deadlineDay: 10,
    monthlyFeeYen: 1000, // 税抜（§2-E-4 改訂）
    monthlyFeeYenTaxIncluded: 1100,
    feeDescription: "休会期間中、毎月システム管理費のみお支払いいただきます",
  },

  // 教材（市販の参考書）
  textbook: {
    policy:
      "必要に応じて保護者が実費で購入するものとし、冊数の定めはない。市販の教材費は全額返金保証の対象外",
  },

  // 団体契約（野球チーム等）
  group: {
    description:
      "団体向けの条件（受講費・解約条件・支払方法等）は、本規約及び特定商取引法に基づく表記にかかわらず、当該団体と当方との間で個別に締結する契約において定める",
  },
} as const;

export type NobilvaPricing = typeof nobilvaPricing;
