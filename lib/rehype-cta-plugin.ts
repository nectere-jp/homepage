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

        let gift = '';

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
              gift = data.gift || '';
            } catch {
              /* ignore */
            }
          }
        }

        const isNobilva = node.properties.className.includes('cta-block-nobilva');
        const isLine = node.properties.className.includes('cta-block-line');

        // LINE CTA: 特典訴求 + QRコード付きの専用レイアウト
        if (isLine && node.properties) {
          const lineUrl = link !== '#' ? link : 'https://lin.ee/XXwhO3b';
          (node.properties as Record<string, unknown>).style =
            'background:#f8fdf5;border:2px solid #06C755;border-radius:16px;padding:0;overflow:hidden;';

          node.children = [
            // 特典バッジヘッダー
            {
              type: 'element',
              tagName: 'div',
              properties: {
                style: 'background:#06C755;padding:14px 20px;text-align:center;',
              },
              children: [
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { style: 'color:#fff;font-weight:800;font-size:15px;letter-spacing:0.05em;' },
                  children: [{ type: 'text', value: '\uD83C\uDF81 LINE登録限定・無料プレゼント' }],
                },
              ],
            },
            // メインコンテンツ: PC横並び（左テキスト + 右QR）
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['cta-line-body'],
                style: 'padding:24px 20px 20px;display:flex;flex-wrap:wrap;gap:24px;align-items:center;',
              },
              children: [
                // 左カラム: テキスト + ボタン
                {
                  type: 'element' as const,
                  tagName: 'div',
                  properties: { style: 'flex:1;min-width:0;' },
                  children: [
                    // 特典名（gift フィールド）
                    ...(gift ? [{
                      type: 'element' as const,
                      tagName: 'div',
                      properties: {
                        style: 'background:#fff;border:1.5px dashed #06C755;border-radius:10px;padding:14px 16px;margin-bottom:16px;text-align:center;',
                      },
                      children: [
                        {
                          type: 'element' as const,
                          tagName: 'p',
                          properties: { style: 'margin:0;font-size:11px;color:#555;font-weight:600;letter-spacing:0.08em;' },
                          children: [{ type: 'text', value: 'LINE友だち追加で今すぐ受け取れます' }],
                        },
                        {
                          type: 'element' as const,
                          tagName: 'p',
                          properties: { style: 'margin:6px 0 0;font-size:17px;font-weight:800;color:#1a1a1a;line-height:1.5;' },
                          children: [{ type: 'text', value: applySoftBreaks(gift) }],
                        },
                      ],
                    }] : []),
                    // タイトル + 説明
                    ...(title ? [{
                      type: 'element' as const,
                      tagName: 'h3',
                      properties: { style: 'margin:0 0 8px;font-size:16px;font-weight:700;color:#1a1a1a;line-height:1.5;' },
                      children: [{ type: 'text', value: applySoftBreaks(title) }],
                    }] : []),
                    ...(description ? [{
                      type: 'element' as const,
                      tagName: 'p',
                      properties: { style: 'margin:0 0 20px;font-size:14px;color:#555;line-height:1.7;' },
                      children: [{ type: 'text', value: applySoftBreaks(description) }],
                    }] : []),
                    // ボタン
                    {
                      type: 'element' as const,
                      tagName: 'a',
                      properties: {
                        href: lineUrl,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        'data-track-cta': 'blog-cta-line',
                        style: 'display:inline-flex;align-items:center;gap:8px;background:#06C755;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:50px;text-decoration:none;transition:opacity 0.2s;justify-content:center;width:100%;max-width:360px;',
                      },
                      children: [
                        // LINE icon SVG
                        {
                          type: 'element' as const,
                          tagName: 'svg',
                          properties: {
                            viewBox: '0 0 24 24',
                            width: '22',
                            height: '22',
                            fill: 'currentColor',
                            style: 'flex-shrink:0;',
                          },
                          children: [{
                            type: 'element' as const,
                            tagName: 'path',
                            properties: {
                              d: 'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314',
                            },
                            children: [],
                          }],
                        },
                        { type: 'text', value: buttonText },
                      ],
                    },
                  ],
                },
                // 右カラム: QRコード（PCのみ表示）
                {
                  type: 'element' as const,
                  tagName: 'a',
                  properties: {
                    href: lineUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'data-track-cta': 'blog-cta-line-qr',
                    className: ['cta-line-qr'],
                    style: 'flex-shrink:0;text-align:center;text-decoration:none;display:none;',
                  },
                  children: [
                    {
                      type: 'element' as const,
                      tagName: 'img',
                      properties: {
                        src: '/images/nobilva/line-qr.png',
                        alt: 'LINE QRコード',
                        width: '120',
                        height: '120',
                        style: 'border-radius:8px;',
                      },
                      children: [],
                    },
                    {
                      type: 'element' as const,
                      tagName: 'p',
                      properties: { style: 'margin:6px 0 0;font-size:11px;color:#888;' },
                      children: [{ type: 'text', value: 'QRコードで追加' }],
                    },
                  ],
                },
              ],
            },
          ] as Element[];
          return; // LINE CTA は専用レンダリングで完了
        }

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
                      'data-track-cta': `blog-cta-${ctaType}`,
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
