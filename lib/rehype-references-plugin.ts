import type { Plugin } from 'unified';
import type { Root, RootContent, Element, ElementContent } from 'hast';

/** 畳んで記事末に移す節の見出し（h2 の文字が完全に一致するもの） */
const REFERENCE_HEADINGS = new Set(['参考にした資料', '出典']);

function textOf(node: RootContent | ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

function isElement(node: RootContent | undefined, tagName?: string): node is Element {
  return !!node && node.type === 'element' && (!tagName || node.tagName === tagName);
}

function isCtaBlock(node: RootContent): boolean {
  if (!isElement(node, 'div')) return false;
  const cls = node.properties?.className;
  return Array.isArray(cls) && cls.includes('cta-block');
}

function isWhitespace(node: RootContent | undefined): boolean {
  return !!node && node.type === 'text' && node.value.trim() === '';
}

function countListItems(nodes: RootContent[]): number {
  let n = 0;
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node.tagName === 'ul' || node.tagName === 'ol') {
      n += node.children.filter((c) => c.type === 'element' && c.tagName === 'li').length;
    }
  }
  return n;
}

/**
 * 「参考にした資料」（または「出典」）の節を畳んで、本文の最後（記事末の CTA の下）に移す。
 *
 * Markdown では、まとめのあと・記事末の CTA の前にこの節を書く（docs/article-format-for-agents.md の 3.4）。
 * そのまま出すと、URL の並んだ一覧がまとめと面談 CTA の間に入って CTA が遠くなるので、
 * 表示のときだけ <details> に入れて最後に回す。資料の一覧は HTML に残る。
 *
 * - 節の範囲は、見出しの h2 から、次の h2・区切り線・CTA ブロックの手前まで
 * - 見出しは h2 のまま <summary> に入れる（目次のリンク先と見出しの階層を保つ）
 * - rehypeCtaPlugin のあとに置く（CTA ブロックの div を節の終わりの目印にするため）
 */
export const rehypeReferencesPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    const children = tree.children;
    const start = children.findIndex(
      (node) => isElement(node, 'h2') && REFERENCE_HEADINGS.has(textOf(node).trim()),
    );
    if (start === -1) return;

    let end = start + 1;
    while (end < children.length) {
      const node = children[end];
      if (isElement(node, 'h2') || isElement(node, 'hr') || isCtaBlock(node)) break;
      end++;
    }

    const heading = children[start] as Element;
    const body = children.slice(start + 1, end).filter((n) => !isWhitespace(n));
    children.splice(start, end - start);

    // 節の前後がどちらも区切り線だったら、抜いたあとに線が2本続くので1本にする
    let prev = start - 1;
    while (prev >= 0 && isWhitespace(children[prev])) prev--;
    let next = start;
    while (next < children.length && isWhitespace(children[next])) next++;
    if (isElement(children[prev], 'hr') && isElement(children[next], 'hr')) {
      children.splice(next, 1);
    }

    const count = countListItems(body);
    const details: Element = {
      type: 'element',
      tagName: 'details',
      properties: { className: ['blog-references'] },
      children: [
        {
          type: 'element',
          tagName: 'summary',
          properties: {},
          children: [
            heading,
            ...(count > 0
              ? [
                  {
                    type: 'element' as const,
                    tagName: 'span',
                    properties: { className: ['blog-references-count'] },
                    children: [{ type: 'text' as const, value: `${count}件` }],
                  },
                ]
              : []),
          ],
        },
        {
          type: 'element',
          tagName: 'div',
          properties: { className: ['blog-references-body'] },
          children: body as ElementContent[],
        },
      ],
    };
    children.push({ type: 'text', value: '\n' }, details);
  };
};
