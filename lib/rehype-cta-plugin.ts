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
        let id = (node.properties['data-cta-id'] ?? node.properties['dataCtaId']) as string || '';
        let variant = (node.properties['data-cta-variant'] ?? node.properties['dataCtaVariant']) as string || '';

        let gift = '';
        let position = '';
        let image = '';
        let imageAlt = '';
        let tail = '';

        // data属性が空の場合、テキストノード [CTA_BLOCK:...] からフォールバック
        const textChild = node.children.find(
          (c): c is { type: 'text'; value: string } => c.type === 'text' && typeof (c as { value?: unknown }).value === 'string',
        );
        // kindle は追加フィールド(position/image/imageAlt)が必要なので、常にJSONフォールバックで補完する
        const isKindlePre = node.properties.className.includes('cta-block-kindle');
        if (((!title || !description) || isKindlePre) && textChild) {
          const match = textChild.value.match(/\[CTA_BLOCK:(\{[\s\S]*\})\]/);
          if (match) {
            try {
              const data = JSON.parse(match[1]) as Record<string, string>;
              ctaType = data.type || ctaType;
              title = data.title || title;
              description = data.description || description;
              buttonText = data.button || buttonText;
              link = data.link || link;
              id = data.id || id;
              variant = data.variant || variant;
              gift = data.gift || '';
              position = data.position || '';
              image = data.image || '';
              imageAlt = data.imageAlt || '';
              tail = data.tail || '';
            } catch {
              /* ignore */
            }
          }
        }

        const isNobilva = node.properties.className.includes('cta-block-nobilva');
        const isLine = node.properties.className.includes('cta-block-line');
        const isKindle = node.properties.className.includes('cta-block-kindle');

        // トラッキング ID: Markdown で `id: xxx` が指定されていればそれを優先、なければ既存の blog-cta-<type>
        const trackCta = id || `blog-cta-${ctaType}`;

        // LINE CTA: gift 指定時は特典カード型（表紙サムネ + 3項目箇条書き + ボタン + PC QR）、
        // それ以外は簡素型（タイトル + 説明 + ボタン）。
        if (isLine && node.properties) {
          const lineUrl = link !== '#' ? link : 'https://lin.ee/XXwhO3b';
          const isSimple = variant === 'simple' || !gift;

          // LINE 公式ロゴ SVG（ボタン内で共通利用）
          const lineIcon = {
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
          };

          // 面談 CTA (cta-block-nobilva) と同じトーンに揃える: LINE 緑塗りつぶし + 右下対角グラデ
          // 文字はすべて中央寄せ、ボタンは白ベース (緑背景の反転色)
          const lineButton = {
            type: 'element' as const,
            tagName: 'a',
            properties: {
              className: ['cta-block-button', 'cta-line-button'],
              href: lineUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
              'data-track-cta': trackCta,
              style:
                'display:inline-flex;align-items:center;gap:8px;background:#fff;color:#06C755;' +
                'font-weight:900;padding:14px 28px;border-radius:999px;text-decoration:none;' +
                'font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.12);',
            },
            children: [lineIcon, { type: 'text' as const, value: buttonText || 'LINEで受け取る' }],
          };

          // 対角グラデ (Nobilva CTA と同じ意匠)
          const gradientOverlay = {
            type: 'element' as const,
            tagName: 'div',
            properties: {
              className: ['cta-block-gradient-overlay'],
              style:
                'position:absolute;inset:0;background:linear-gradient(to bottom right, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 100%);pointer-events:none;',
            },
            children: [] as Element[],
          };

          (node.properties as Record<string, unknown>).style =
            'background-color:#06C755;position:relative;overflow:hidden;border-radius:0;';

          // -- 簡素型（gift なし or variant=simple）: title + description + 白ボタン --
          // 注: .cta-block-inner は globals.css で `md:flex-row` が当たっているため使えない。
          // LINE 用の独自クラス cta-line-inner を使い、PC では max-width で収める (CSS 側で定義)
          if (isSimple) {
            node.children = [
              gradientOverlay,
              {
                type: 'element' as const,
                tagName: 'div',
                properties: {
                  className: ['cta-line-inner', 'cta-line-inner-simple'],
                  style:
                    'position:relative;z-index:1;padding:22px 18px 24px;text-align:center;' +
                    'display:block;margin:0 auto;',
                },
                children: [
                  ...(title ? [{
                    type: 'element' as const,
                    tagName: 'h3',
                    properties: {
                      className: ['cta-block-title'],
                      style: 'color:#fff;font-size:19px;font-weight:900;line-height:1.4;margin:0 0 10px;',
                    },
                    children: [{ type: 'text' as const, value: applySoftBreaks(title) }],
                  }] : []),
                  ...(description ? [{
                    type: 'element' as const,
                    tagName: 'p',
                    properties: {
                      className: ['cta-block-description'],
                      style: 'color:#fff;font-size:14px;line-height:1.65;margin:0 0 18px;opacity:0.95;',
                    },
                    children: [{ type: 'text' as const, value: applySoftBreaks(description) }],
                  }] : []),
                  lineButton,
                ] as Element[],
              },
            ] as Element[];
            return;
          }

          // -- 特典カード型（gift あり） --
          // PDF (public/docs/nobilva-line.pdf) の実際の見出しから抜粋した3項目。本文に合わせて書き換えない
          const giftItems = [
            '3つの入試ルート（スポーツ推薦・推薦入試・一般入試）の違い',
            '強豪校の内申点基準の実例（桐蔭学園・関東第一・浦和学院）',
            '学年別スケジュールとすきま時間の使い方',
          ];

          node.children = [
            gradientOverlay,
            {
              type: 'element' as const,
              tagName: 'div',
              properties: {
                className: ['cta-line-inner', 'cta-line-inner-gift'],
                style:
                  'position:relative;z-index:1;padding:20px 16px 24px;text-align:center;' +
                  'display:block;margin:0 auto;',
              },
              children: [
                // 表紙サムネ (先頭に配置して視覚のフックに。スマホで大きめ、PC で縮小)
                {
                  type: 'element' as const,
                  tagName: 'img',
                  properties: {
                    className: ['cta-line-thumb'],
                    src: '/images/nobilva/line-guide-cover.jpg',
                    alt: '高校受験の基本のき（野球×高校受験 両立ガイド）表紙',
                    width: '280',
                    height: '158',
                    loading: 'lazy',
                    style:
                      'display:block;margin:0 auto 14px;width:min(78%,280px);height:auto;' +
                      'border:3px solid #fff;background:#f6ce4a;box-shadow:0 4px 12px rgba(0,0,0,0.18);',
                  },
                  children: [],
                },
                // バッジ (写真の下に配置)
                {
                  type: 'element' as const,
                  tagName: 'div',
                  properties: {
                    className: ['cta-line-badge'],
                    style:
                      'display:inline-block;background:rgba(0,0,0,0.18);padding:5px 14px;' +
                      'border-radius:999px;color:#fff;font-size:11px;font-weight:800;' +
                      'letter-spacing:0.06em;margin-bottom:4px;',
                  },
                  children: [{ type: 'text' as const, value: 'LINE登録限定・無料プレゼント' }],
                },
                // ラベル
                {
                  type: 'element' as const,
                  tagName: 'p',
                  properties: {
                    className: ['cta-line-gift-label', 'cta-line-label'],
                    style: 'color:#fff;font-size:12px;font-weight:700;margin:0 0 4px;opacity:0.95;',
                  },
                  children: [{ type: 'text' as const, value: 'LINE友だち追加ですぐに届きます' }],
                },
                // 特典名 (大きい見出し、text-stroke で視覚的にさらに太く)
                {
                  type: 'element' as const,
                  tagName: 'h3',
                  properties: {
                    className: ['cta-line-gift-name', 'cta-line-heading'],
                    style:
                      'color:#fff;font-size:20px;font-weight:900;line-height:1.4;' +
                      'margin:0 0 12px;letter-spacing:0.01em;' +
                      '-webkit-text-stroke:0.6px #fff;text-shadow:0 1px 0 rgba(0,0,0,0.08);',
                  },
                  children: [{ type: 'text' as const, value: applySoftBreaks(gift) }],
                },
                // サブコピー (任意)
                ...(title ? [{
                  type: 'element' as const,
                  tagName: 'p',
                  properties: {
                    className: ['cta-line-sub'],
                    style: 'color:#fff;font-size:14px;line-height:1.65;margin:0 0 14px;opacity:0.95;',
                  },
                  children: [{ type: 'text' as const, value: applySoftBreaks(title) }],
                }] : []),
                // 3項目チェックリスト (左寄せ、インラインブロックで中央に寄せる)
                {
                  type: 'element' as const,
                  tagName: 'ul',
                  properties: {
                    className: ['cta-line-items'],
                    style:
                      'margin:0 0 18px;padding:0;list-style:none;text-align:left;' +
                      'display:inline-block;max-width:320px;',
                  },
                  children: giftItems.map((it) => ({
                    type: 'element' as const,
                    tagName: 'li',
                    properties: {
                      style:
                        'position:relative;padding:2px 0 2px 26px;color:#fff;font-size:13.5px;' +
                        'line-height:1.55;font-weight:600;',
                    },
                    children: [
                      {
                        type: 'element' as const,
                        tagName: 'span',
                        properties: {
                          style:
                            'position:absolute;left:0;top:4px;width:18px;height:18px;' +
                            'background:#fff;border-radius:50%;color:#06C755;font-weight:900;' +
                            'text-align:center;font-size:12px;line-height:18px;',
                        },
                        children: [{ type: 'text' as const, value: '✓' }],
                      },
                      { type: 'text' as const, value: it },
                    ],
                  })),
                },
                // ボタン + PC では横に QR
                {
                  type: 'element' as const,
                  tagName: 'div',
                  properties: {
                    className: ['cta-line-foot'],
                    style: 'display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:center;',
                  },
                  children: [
                    lineButton,
                    // QR (PC のみ表示: CSS 側で `.cta-line-qr` を 1024px 以上で display:block)
                    {
                      type: 'element' as const,
                      tagName: 'a',
                      properties: {
                        href: lineUrl,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        'data-track-cta': `${trackCta}-qr`,
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
                            width: '96',
                            height: '96',
                            style: 'border-radius:4px;border:2px solid #fff;background:#fff;',
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ] as Element[],
            },
          ] as Element[];
          return; // LINE CTA は専用レンダリングで完了
        }

        // Kindle 本の案内: 控えめな淡色ボックス + テキストリンク + 任意の書影
        // position=top は注記ボックス、position=bottom/article は一行の段落として描画
        if (isKindle && node.properties) {
          const pos = position || 'top';
          const trackName = `kindle-${pos}`;
          const isInlineStyle = pos === 'bottom' || pos === 'article';

          if (isInlineStyle) {
            (node.properties as Record<string, unknown>).style =
              'margin:1.5em 0;';
            node.children = [
              {
                type: 'element',
                tagName: 'p',
                properties: {
                  className: ['cta-kindle-inline'],
                  style: 'font-size:16px;line-height:1.8;color:#3f3a30;margin:0;',
                },
                children: [
                  { type: 'text', value: applySoftBreaks(description) },
                  ...(link ? [
                    { type: 'text' as const, value: ' ' },
                    {
                      type: 'element' as const,
                      tagName: 'a',
                      properties: {
                        href: link,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        'data-track-cta': trackName,
                        className: ['cta-kindle-link'],
                        style: 'color:#8a5a1a;text-decoration:underline;font-weight:600;',
                      },
                      children: [{ type: 'text' as const, value: buttonText || 'Amazon で見る' }],
                    },
                    ...(tail ? [{ type: 'text' as const, value: applySoftBreaks(tail) }] : []),
                  ] : []),
                ],
              },
            ] as Element[];
            return;
          }

          (node.properties as Record<string, unknown>).style =
            'background:#faf7f2;border:1px solid #e5dcc9;border-radius:0;padding:16px 20px;margin:1.5em 0;';

          const textColumn: Element = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['cta-kindle-text'], style: 'flex:1;min-width:0;' },
            children: [
              ...(title ? [{
                type: 'element' as const,
                tagName: 'p',
                properties: {
                  className: ['cta-kindle-title'],
                  style: 'font-weight:700;font-size:14px;color:#6b5a3a;margin:0 0 6px;letter-spacing:0.02em;',
                },
                children: [{ type: 'text' as const, value: applySoftBreaks(title) }],
              }] : []),
              {
                type: 'element',
                tagName: 'p',
                properties: {
                  className: ['cta-kindle-description'],
                  style: 'font-size:15px;line-height:1.75;color:#3f3a30;margin:0;',
                },
                children: [
                  { type: 'text', value: applySoftBreaks(description) },
                  ...(link ? [
                    { type: 'text' as const, value: ' ' },
                    {
                      type: 'element' as const,
                      tagName: 'a',
                      properties: {
                        href: link,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        'data-track-cta': trackName,
                        className: ['cta-kindle-link'],
                        style: 'color:#8a5a1a;text-decoration:underline;font-weight:600;white-space:nowrap;',
                      },
                      children: [{ type: 'text' as const, value: buttonText || 'Amazon で見る' }],
                    },
                  ] : []),
                ],
              },
            ],
          };

          const imageColumn: Element | null = image
            ? {
                type: 'element',
                tagName: 'div',
                properties: { className: ['cta-kindle-image'], style: 'flex:none;' },
                children: [
                  {
                    type: 'element',
                    tagName: 'img',
                    properties: {
                      src: image,
                      alt: imageAlt || '',
                      loading: 'lazy',
                      width: '96',
                      style: 'display:block;width:96px;height:auto;border:1px solid #e5dcc9;',
                    },
                    children: [],
                  },
                ],
              }
            : null;

          node.children = [
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['cta-kindle-inner'],
                style: 'display:flex;gap:16px;align-items:flex-start;',
              },
              children: [
                ...(imageColumn ? [imageColumn] : []),
                textColumn,
              ],
            },
          ] as Element[];
          return;
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
                      'data-track-cta': trackCta,
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
