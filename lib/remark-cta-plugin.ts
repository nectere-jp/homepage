import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Paragraph, Text } from 'mdast';

interface CTANode extends Paragraph {
  type: 'paragraph';
  data?: {
    hName?: string;
    hProperties?: Record<string, any>;
  };
}

function parseCtaContent(content: string): Record<string, string> {
  const ctaData: Record<string, string> = {};

  // 1行形式 (title: xxx description: yyy) の場合は、キーで分割
  const keyBoundaryRe = /\s+(?=title:|description:|button:|link:)/;
  const parts = content.includes('\n')
    ? content.split('\n').filter((line) => line.trim())
    : content.split(keyBoundaryRe).filter((s) => s.trim());

  parts.forEach((part) => {
    const colonIndex = part.indexOf(':');
    if (colonIndex > -1) {
      const key = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();
      ctaData[key] = value;
    }
  });

  return ctaData;
}

function createCtaNode(ctaType: string, ctaData: Record<string, string>): CTANode {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: `[CTA_BLOCK:${JSON.stringify({ ...ctaData, type: ctaType })}]`,
      },
    ],
    data: {
      hName: 'div',
      hProperties: {
        className: ['cta-block', `cta-block-${ctaType}`],
        'data-cta-type': ctaType,
        'data-cta-title': ctaData.title || '',
        'data-cta-description': ctaData.description || '',
        'data-cta-button': ctaData.button || '詳しく見る',
        'data-cta-link': ctaData.link || '#',
      },
    },
  } as CTANode;
}

/**
 * Remark plugin to parse custom CTA blocks
 * Supports:
 * - Single paragraph (no blank lines): entire block in one paragraph
 * - Single line: :::cta-nobilva title: xxx description: yyy button: zzz link: /path :::
 * - Multi paragraph: :::cta-nobilva on own line, then content, then :::
 */
export const remarkCtaPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      const firstChild = node.children[0];
      if (firstChild?.type !== 'text') return;

      const text = (firstChild as Text).value;
      const trimmed = text.trim();

      // Case 1: 単一 paragraph にブロック全体が含まれる（空行なしで連結された形式）
      const singleBlockMatch = trimmed.match(
        /^:::cta-(nobilva|teachit|translation|web-design|print)\s*([\s\S]*?)\s*:::\s*$/,
      );
      if (singleBlockMatch) {
        const [, ctaType, content] = singleBlockMatch;
        const ctaData = parseCtaContent(content.trim());
        const ctaNode = createCtaNode(ctaType, ctaData);
        parent.children.splice(index, 1, ctaNode as any);
        return;
      }

      // Case 2: 複数 paragraph（先頭行のみ :::cta-xxx）
      const ctaMatch = trimmed.match(/^:::cta-(nobilva|teachit|translation|web-design|print)$/);
      if (!ctaMatch) return;

      const ctaType = ctaMatch[1];
      let endIndex = index + 1;
      let ctaContent = '';

      while (endIndex < parent.children.length) {
        const currentNode = parent.children[endIndex] as Paragraph;
        if (currentNode.type !== 'paragraph') {
          endIndex++;
          continue;
        }
        const currentFirstChild = currentNode.children[0];
        if (currentFirstChild?.type !== 'text') {
          endIndex++;
          continue;
        }
        const currentText = (currentFirstChild as Text).value;
        if (currentText.trim() === ':::') {
          break;
        }
        ctaContent += currentText + '\n';
        endIndex++;
      }

      const ctaData = parseCtaContent(ctaContent);
      const ctaNode = createCtaNode(ctaType, ctaData);
      parent.children.splice(index, endIndex - index + 1, ctaNode as any);
    });
  };
};
