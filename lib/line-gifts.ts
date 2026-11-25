/**
 * LINE の特典カードで出す特典の一覧。
 *
 * 記事の frontmatter に `lineGift: <キー>` を書くと、その記事の LINE カード（自動挿入・手書きの `:::cta-line` の両方）が
 * ここに登録した特典の表示になる。書いていない記事は従来どおり `guide`（高校受験の基本のき）。
 *
 * guide 以外の特典は友だち追加のあとのキーワード送信で届ける（LINE 公式アカウントのキーワード応答に keyword を登録する）。
 * 計測 ID は `<スラッグ>_auto_line` などのあとに trackSuffix を足すので、特典ごとのクリックを管理画面で分けて見られる。
 */
export interface LineGift {
  /** カードの大見出し。‖ は SE 幅で文節の途中で折れないための改行候補 */
  name: string;
  /** 表紙サムネ */
  cover: string;
  coverAlt: string;
  /** 表紙の下の小さなラベル */
  label: string;
  /** チェックリストの3項目。PDF の実際の中身から書く */
  items: string[];
  /** 友だち追加のあとに送ってもらうキーワード（guide は不要） */
  keyword?: string;
  /** 計測 ID の末尾 */
  trackSuffix: string;
}

export const LINE_GIFTS = {
  guide: {
    name: '高校受験の基本のき‖（野球×高校受験 両立ガイド）',
    cover: '/images/nobilva/line-guide-cover.jpg',
    coverAlt: '高校受験の基本のき（野球×高校受験 両立ガイド）表紙',
    label: '友だち追加で冊子がすぐに届きます',
    // PDF (public/docs/nobilva-line.pdf) の実際の見出しから抜粋した3項目。本文に合わせて書き換えない
    items: [
      '3つの入試ルート‖（スポーツ推薦・‖推薦入試・‖一般入試）‖の違い',
      '強豪校の内申点基準の実例‖（桐蔭学園・‖関東第一・‖浦和学院）',
      '学年別スケジュールと‖すきま時間の使い方',
    ],
    trackSuffix: '',
  },
  'test-plan': {
    name: 'テスト前の‖計画シート‖（2週間分・‖記入例つき）',
    cover: '/images/nobilva/line-test-plan-cover.jpg',
    coverAlt: 'テスト前の計画シート（2週間分）表紙',
    label: '友だち追加のあと‖「計画シート」と‖送ると届きます',
    // PDF (public/docs/nobilva-test-plan.pdf) の中身
    items: [
      '練習のある日・‖ない日・‖試合の日で‖分けて書ける‖1週間の表',
      '範囲と提出物を‖教科ごとに‖書き出す表',
      '中2の期末テストの‖記入例',
    ],
    keyword: '計画シート',
    trackSuffix: '_testplan',
  },
} satisfies Record<string, LineGift>;

export type LineGiftKey = keyof typeof LINE_GIFTS;

export function getLineGift(key: string | undefined | null): LineGift {
  if (key && key in LINE_GIFTS) return LINE_GIFTS[key as LineGiftKey];
  return LINE_GIFTS.guide;
}

export function isLineGiftKey(key: unknown): key is LineGiftKey {
  return typeof key === 'string' && key in LINE_GIFTS;
}
