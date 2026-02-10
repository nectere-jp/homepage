import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';

const SOFT_BREAK_PLACEHOLDER = '\u2016'; // ‖ (U+2016 DOUBLE VERTICAL LINE)
const ZERO_WIDTH_SPACE = '\u200B';

/** ‖ をゼロ幅スペースに変換（他コンポーネントの addSoftBreaks と同等の改行位置指定） */
function applySoftBreaks(text: string): string {
  return text.split(SOFT_BREAK_PLACEHOLDER).join(ZERO_WIDTH_SPACE);
}

/**
 * Rehype plugin to enhance CTA blocks with proper HTML structure
 */
export const rehypeCtaPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      // Look for our CTA block divs
      if (
        node.tagName === 'div' &&
        node.properties &&
        node.properties.className &&
        Array.isArray(node.properties.className) &&
        node.properties.className.includes('cta-block')
      ) {
        // remark は data-cta-* (kebab-case) で出力する
        let ctaType = (node.properties['data-cta-type'] ?? node.properties['dataCtaType']) as string || '';
        let title = (node.properties['data-cta-title'] ?? node.properties['dataCtaTitle']) as string || '';
        let description = (node.properties['data-cta-description'] ?? node.properties['dataCtaDescription']) as string || '';
        let buttonText = (node.properties['data-cta-button'] ?? node.properties['dataCtaButton']) as string || '詳しく見る';
        let link = (node.properties['data-cta-link'] ?? node.properties['dataCtaLink']) as string || '#';

        // data属性が空の場合、テキストノード [CTA_BLOCK:...] からフォールバック
        const textChild = node.children.find(
          (c): c is { type: 'text'; value: string } => c.type === 'text' && typeof (c as { value?: unknown }).value === 'string',
        );
        if ((!title || !description) && textChild) {
          const match = textChild.value.match(/\[CTA_BLOCK:(\{[\s\S]*\})\]/);
          if (match) {
            try {
              const data = JSON.parse(match[1]) as Record<string, string>;
              ctaType = data.type || ctaType;
              title = data.title || title;
              description = data.description || description;
              buttonText = data.button || buttonText;
              link = data.link || link;
            } catch {
              /* ignore */
            }
          }
        }

        const isNobilva = node.properties.className.includes('cta-block-nobilva');

        // Nobilva CTA: LPと同じオレンジ背景・右下半分に影をインラインスタイルで適用
        if (isNobilva && node.properties) {
          (node.properties as Record<string, unknown>).style =
            'background-color:#ea5614;position:relative;overflow:hidden;border-radius:0;';
        }

        // Build the proper HTML structure
        const gradientOverlay =
          isNobilva
            ? {
                type: 'element' as const,
                tagName: 'div',
                properties: {
                  className: ['cta-block-gradient-overlay'],
                  style:
                    'position:absolute;inset:0;background:linear-gradient(to bottom right, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 100%);pointer-events:none;',
                },
                children: [] as Element[],
              }
            : null;

        node.children = [
          ...(gradientOverlay ? [gradientOverlay] : []),
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['cta-block-inner'],
              ...(isNobilva && { style: 'position:relative;z-index:1;' }),
            },
            children: [
              {
                type: 'element',
                tagName: 'div',
                properties: { className: ['cta-block-content'] },
                children: [
                  title ? {
                    type: 'element',
                    tagName: 'h3',
                    properties: { className: ['cta-block-title'] },
                    children: [{ type: 'text', value: applySoftBreaks(title) }],
                  } : null,
                  description ? {
                    type: 'element',
                    tagName: 'p',
                    properties: { className: ['cta-block-description'] },
                    children: [{ type: 'text', value: applySoftBreaks(description) }],
                  } : null,
                  {
                    type: 'element',
                    tagName: 'a',
                    properties: {
                      className: ['cta-block-button'],
                      href: link,
                    },
                    children: [{ type: 'text', value: buttonText }],
                  },
                ].filter(Boolean) as Element[],
              },
            ],
          },
        ];
      }
    });
  };
};
