import type { Plugin } from 'unified';
import type { Root, RootContent, Element, ElementContent } from 'hast';
import { LINE_ADD_URL } from './constants';
import { getLineGift, type LineGiftKey } from './line-gifts';

export interface AutoLineCtaOptions {
  /** false のときは何もしない（Nobilva 以外の記事、お知らせの記事） */
  enabled: boolean;
  slug: string;
  /** frontmatter の targetSport。'sports' は野球以外の競技の記事 */
  targetSport?: string;
  /** frontmatter の targetStage。'high-school' は高校生向けの記事 */
  targetStage?: string;
  /** frontmatter の lineGift。指定があれば手書きの `:::cta-line` も含めて、その特典のカードにする */
  lineGift?: LineGiftKey;
}

const CTA_JSON_RE = /\[CTA_BLOCK:(\{[\s\S]*\})\]/;

/**
 * 手書きの `:::cta-line` を、frontmatter の lineGift の特典カードに差し替える。
 * 特典なし型（相談の文面）で書かれたカードも特典カードにする。計測 ID の末尾に特典の印を足す
 */
function applyGiftToExistingCard(node: Element, giftKey: LineGiftKey) {
  const gift = getLineGift(giftKey);
  const textChild = node.children.find(
    (c): c is { type: 'text'; value: string } => c.type === 'text',
  );
  if (!textChild) return;
  const match = textChild.value.match(CTA_JSON_RE);
  if (!match) return;
  let data: Record<string, string>;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return;
  }
  const baseId = data.id || '';
  const id = baseId && !baseId.endsWith(gift.trackSuffix) ? `${baseId}${gift.trackSuffix}` : baseId;
  const next: Record<string, string> = {
    type: 'line',
    id,
    gift: gift.name,
    giftKey,
    button: 'LINEで受け取る',
    link: data.link || LINE_ADD_URL,
  };
  textChild.value = `[CTA_BLOCK:${JSON.stringify(next)}]`;
  node.properties = {
    ...node.properties,
    'data-cta-title': '',
    'data-cta-description': '',
    'data-cta-button': next.button,
    'data-cta-id': id,
    'data-cta-variant': '',
  };
}

/** カードを置く位置の目安（本文の文字数に対する割合） */
const TARGET_RATIO = 0.4;
/** h2 がこの数より少ない短い記事には入れない */
const MIN_H2 = 4;
/** この見出しの直前には置かない（本論が終わったあとの節） */
const TAIL_HEADING_RE = /よくある質問|まとめ|参考にした資料|出典/;

function textOf(node: RootContent | ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

function isElement(node: RootContent | undefined, tagName?: string): node is Element {
  return !!node && node.type === 'element' && (!tagName || node.tagName === tagName);
}

function hasClass(node: RootContent, name: string): boolean {
  if (!isElement(node)) return false;
  const cls = node.properties?.className;
  return Array.isArray(cls) && cls.includes(name);
}

/**
 * `:::cta-line` を書いていない記事に、LINE・フォームのカードを自動で入れる。
 *
 * リライト前の記事は CTA が記事末の面談 1 つだけで、スマホでは 14〜27 画面スクロールしないと
 * 1 つも出てこない。Markdown を触らずに、本文の 4 割あたりの h2 の直前にカードを出す。
 * 記事に `:::cta-line` を手で置けば、そちらが優先されてこの処理は働かない。
 *
 * - remarkCtaPlugin が作るのと同じ形（div.cta-block.cta-block-line + [CTA_BLOCK:JSON]）で入れるので、
 *   rehypeCtaPlugin の前に置く
 * - 野球の中学生向け（と対象学年が未設定）の記事は特典カード型、
 *   野球以外の競技と高校生向けの記事は特典なし型（特典の冊子は野球×高校受験のため）
 * - 計測 ID は `<スラッグの _ 区切り>_auto_line`。手で置いたカード（_mid_line）と区別できる
 */
export const rehypeAutoLineCtaPlugin: Plugin<[AutoLineCtaOptions], Root> = (options) => {
  return (tree) => {
    if (!options?.enabled) return;
    const children = tree.children;
    const existing = children.filter((n): n is Element => hasClass(n, 'cta-block-line'));
    if (existing.length > 0) {
      if (options.lineGift && options.lineGift !== 'guide') {
        existing.forEach((n) => applyGiftToExistingCard(n, options.lineGift as LineGiftKey));
      }
      return;
    }

    // 本文の長さを測る。CTA ブロック（中身は JSON の文字列）は数えない
    const lengths = children.map((n) => (hasClass(n, 'cta-block') ? 0 : textOf(n).length));
    const total = lengths.reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const h2Indexes = children
      .map((n, i) => (isElement(n, 'h2') ? i : -1))
      .filter((i) => i >= 0);
    if (h2Indexes.length < MIN_H2) return;

    // 最初の h2 と、本論のあとの節（よくある質問・まとめ・参考資料）を除いて、4 割にいちばん近い h2 を選ぶ
    let best = -1;
    let bestDiff = Infinity;
    let offset = 0;
    children.forEach((node, i) => {
      if (i !== h2Indexes[0] && isElement(node, 'h2') && !TAIL_HEADING_RE.test(textOf(node))) {
        const diff = Math.abs(offset / total - TARGET_RATIO);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = i;
        }
      }
      offset += lengths[i];
    });
    if (best === -1) return;

    const isSports = options.targetSport === 'sports';
    const isHighSchool = options.targetStage === 'high-school';
    const giftKey = options.lineGift;
    const gift = giftKey ? getLineGift(giftKey) : null;
    const id = `${options.slug.replace(/-/g, '_')}_auto_line${gift ? gift.trackSuffix : ''}`;
    const data: Record<string, string> = gift
      ? {
          type: 'line',
          id,
          gift: gift.name,
          giftKey: giftKey as string,
          button: 'LINEで受け取る',
          link: LINE_ADD_URL,
        }
      : isSports || isHighSchool
        ? {
            type: 'line',
            id,
            title: isHighSchool
              ? `${isSports ? '部活' : '野球'}と勉強の‖両立について‖相談してみませんか`
              : '部活と高校受験の‖両立について‖相談してみませんか',
            description: 'LINEでもフォームでも‖受け付けています。‖LINEでは、‖受験に関するお知らせも‖お届けします。',
            button: 'LINEで相談する',
            link: LINE_ADD_URL,
          }
        : {
            type: 'line',
            id,
            gift: '高校受験の基本のき‖（野球×高校受験 両立ガイド）',
            button: 'LINEで受け取る',
            link: LINE_ADD_URL,
          };

    const card: Element = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: ['cta-block', 'cta-block-line'],
        'data-cta-type': 'line',
        'data-cta-title': data.title || '',
        'data-cta-description': data.description || '',
        'data-cta-button': data.button,
        'data-cta-link': data.link,
        'data-cta-id': id,
        'data-cta-variant': '',
      },
      children: [{ type: 'text', value: `[CTA_BLOCK:${JSON.stringify(data)}]` }],
    };
    children.splice(best, 0, card, { type: 'text', value: '\n' });
  };
};
