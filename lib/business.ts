/**
 * Nectere 事業者情報の単一ソース
 *
 * 法務文書・フッター・お問い合わせページ・会社概要・特商法表記・JSON-LD など
 * 事業者情報を参照する全箇所がここを見る。値を変更する場合はこのファイルだけを直す。
 *
 * - 法人ではなく個人事業の屋号。契約当事者は事業主個人（owner）。
 * - 問い合わせ窓口はサービス別に分けず contact@nectere.jp に一本化（指示書 §8-1）。
 * - services の url は、各サービスのトップ URL。業務上の主たる受付先の表示に使う。
 */

export const business = {
  // 当事者
  tradeName: "Nectere",
  tradeNameReading: "ネクター",
  ownerName: "養田貴大",

  // 所在地
  postalCode: "154-0004",
  address: "東京都世田谷区太子堂4丁目18番15号 マガザン三軒茶屋2 3F-3",
  addressRegion: "東京都",
  addressLocality: "世田谷区",
  streetAddress: "太子堂4丁目18番15号 マガザン三軒茶屋2 3F-3",

  // 連絡先（全文書・全サービスの窓口を 1 つに一本化）
  phone: "03-6820-9037",
  phoneHours: "8:00〜23:00",
  email: "contact@nectere.jp",

  // Web
  siteUrl: "https://www.nectere.jp",
  contactFormUrl: "https://www.nectere.jp/ja/contact",

  // 法務上の役割
  privacyManager: "養田貴大",

  // サービス
  services: {
    nobilva: {
      name: "Nobilva",
      nameReading: "ノビルバ",
      url: "https://nobilva.jp",
    },
    teachIt: {
      name: "Teach It",
      nameReading: "ティーチイット",
      url: "https://www.nectere.jp/ja/services/teachit",
    },
    okitegami: {
      name: "おきてがみ",
      nameReading: "おきてがみ",
      url: "https://okitegami.app",
    },
  },

  // 準拠法・合意管轄
  jurisdiction: "東京地方裁判所又は東京簡易裁判所",
} as const;

export type BusinessData = typeof business;
export type ServiceKey = keyof typeof business.services;
