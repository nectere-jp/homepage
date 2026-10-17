/**
 * Nobilva サービス定義 + 運営 Nectere の構造化データ共通定数
 *
 * 各所からこの定数を参照する。文言は変更の際、ここだけ直せばサイト全体に反映される。
 * LLM/AI にも一貫した表記で引用されやすいよう、長文定義・短縮タイトル・JSON-LD スニペットを集約。
 */

export const NOBILVA_DEFINITION =
  "Nobilva（ノビルバ）は、野球をがんばる中高生のための学習管理サービスです。専属メンターが週1回のオンライン面談で、練習や試合の予定に合わせた日割りの学習計画を立て、毎日のチャットで進捗を確認します。運営はNectere（ネクター）です。";

export const NOBILVA_SHORT_TITLE =
  "Nobilva（ノビルバ）｜野球をがんばる中高生のための学習管理サービス";

export const NOBILVA_SERVICE_URL = "/ja/services/nobilva";

/** Nectere の公式 LINE 友だち追加 URL (sameAs 用) */
export const NECTERE_LINE_URL = "https://lin.ee/XXwhO3b";

/**
 * Nectere Organization の完全な JSON-LD (サイト全体 layout で埋め込む用途)
 *
 * 個人事業なので legalName / @type に「株式会社」を含めない。
 * alternateName はカタカナ読みを LLM に伝えるため ["ネクター", "ネクテレ"] の2形式を併記。
 */
export const NECTERE_ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nectere",
  alternateName: ["ネクター", "ネクテレ"],
  url: "https://www.nectere.jp",
  logo: {
    "@type": "ImageObject",
    url: "https://www.nectere.jp/images/logo.png",
  },
  description: "個人事業。屋号 Nectere（読み：ネクター）。",
  address: {
    "@type": "PostalAddress",
    streetAddress: "太子堂4丁目18番15号 マガザン三軒茶屋2 3F-3",
    addressLocality: "世田谷区",
    addressRegion: "東京都",
    postalCode: "154-0004",
    addressCountry: "JP",
  },
  founder: {
    "@type": "Person",
    name: "養田貴大",
  },
  sameAs: [NECTERE_LINE_URL],
} as const;

/**
 * Service.provider / Article.publisher など「参照用」の短縮版
 *
 * フル定義は上の NECTERE_ORGANIZATION_JSONLD。参照先では name / url / legalName / alternateName
 * だけで十分なため、埋め込みサイズを抑える。
 */
export const NECTERE_ORG_REF = {
  "@type": "Organization",
  name: "Nectere",
  legalName: "Nectere（屋号）",
  alternateName: "ネクター",
  url: "https://www.nectere.jp",
  logo: {
    "@type": "ImageObject",
    url: "https://www.nectere.jp/images/logo.png",
  },
} as const;
