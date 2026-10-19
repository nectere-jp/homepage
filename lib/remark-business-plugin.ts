import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Paragraph, Heading } from "mdast";

import { business } from "./business";
import { nobilvaPricing } from "./nobilva-pricing";

/**
 * 法務文書 Markdown 用の remark プラグイン
 *
 * 3 つの機能を提供する:
 *
 * 1. `{{<namespace>.<path>}}` のテキスト差し込み
 *    サポートする名前空間: `business`, `nobilvaPricing`
 *    例: `{{business.ownerName}}` → "養田貴大"
 *        `{{nobilvaPricing.enrollmentFee.amountYen}}` → "18000"
 *    ネストしたキーもドット区切りで参照可能。
 *
 * 2. 行頭ブロック `:::business-info` / `:::contact-info[ service=<key>]`
 *    paragraph を `<div data-legal-block="business-info" />` 等に変換する。
 *    描画は ReactMarkdown の `components.div` で <BusinessInfo /> / <ContactInfo /> に差し替える。
 *
 * 3. 見出し末尾の ` {#id}` を抜き出して hProperties.id に移す
 *    例: `## Nobilva {#nobilva}` → `<h2 id="nobilva">Nobilva</h2>`
 */

const NAMESPACES: Record<string, unknown> = { business, nobilvaPricing };

/** `foo.bar.baz` 形式のドット区切りキーで値を引く。string または number を返す */
function resolvePath(root: unknown, path: string): string | number | undefined {
  const segments = path.split(".");
  let current: unknown = root;
  for (const seg of segments) {
    if (current && typeof current === "object" && seg in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  if (typeof current === "string" || typeof current === "number") return current;
  return undefined;
}

const PLACEHOLDER_RE = /\{\{\s*(business|nobilvaPricing)\.([a-zA-Z0-9_.]+)\s*\}\}/g;

/** paragraph の text ノード群からプレーンテキストを再構築（autolink・softbreak 対策） */
function extractText(node: { type: string; value?: string; url?: string; children?: unknown[] }): string {
  if (node.type === "text") return node.value || "";
  if (node.type === "break" || node.type === "softbreak") return "\n";
  if (node.children) return (node.children as Array<Parameters<typeof extractText>[0]>).map(extractText).join("");
  return "";
}

function extractParagraphText(node: Paragraph): string {
  return node.children.map((c) => extractText(c as Parameters<typeof extractText>[0])).join("");
}

const BUSINESS_INFO_RE = /^:::business-info\s*$/;
const CONTACT_INFO_RE = /^:::contact-info(?:\s+service=([a-zA-Z]+))?\s*$/;
const HEADING_ID_RE = /^(.*?)\s+\{#([a-zA-Z0-9_-]+)\}\s*$/;

export const remarkBusinessPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    // 1) テキストノード内の {{<ns>.<path>}} 差し込み
    //    数値は ja-JP ロケールの桁区切り（例: 19,800）に整形する
    visit(tree, "text", (node: { value: string }) => {
      if (!node.value.includes("{{")) return;
      node.value = node.value.replace(PLACEHOLDER_RE, (_match, ns: string, path: string) => {
        const root = NAMESPACES[ns];
        if (!root) return `[[UNRESOLVED NS: ${ns}]]`;
        const value = resolvePath(root, path);
        if (value === undefined) {
          return `[[UNRESOLVED: ${ns}.${path}]]`;
        }
        if (typeof value === "number") return value.toLocaleString("ja-JP");
        return value;
      });
    });

    // 2) 見出し末尾の ` {#id}` を抜き出して hProperties.id に移す
    visit(tree, "heading", (node: Heading) => {
      const lastChild = node.children[node.children.length - 1];
      if (!lastChild || lastChild.type !== "text") return;
      const match = lastChild.value.match(HEADING_ID_RE);
      if (!match) return;
      const [, text, id] = match;
      lastChild.value = text;
      const data = (node as unknown as { data?: { hProperties?: Record<string, string> } }).data ?? {};
      data.hProperties = { ...(data.hProperties ?? {}), id };
      (node as unknown as { data: typeof data }).data = data;
    });

    // 3) `:::business-info` / `:::contact-info` ブロックを className 付き div に変換
    //    ReactMarkdown v10 の components.div で className を見て差し替える。
    //    data-* 属性は hast → React 変換でキー名が揺れるため、className ベースにする。
    visit(tree, "paragraph", (node: Paragraph) => {
      const text = extractParagraphText(node).trim();

      if (BUSINESS_INFO_RE.test(text)) {
        (node as unknown as { data: Record<string, unknown> }).data = {
          hName: "div",
          hProperties: {
            className: ["legal-block", "legal-block-business-info"],
          },
        };
        node.children = [];
        return;
      }

      const contactMatch = text.match(CONTACT_INFO_RE);
      if (contactMatch) {
        const service = contactMatch[1];
        const classNames = ["legal-block", "legal-block-contact-info"];
        if (service) classNames.push(`legal-contact-service-${service}`);
        (node as unknown as { data: Record<string, unknown> }).data = {
          hName: "div",
          hProperties: {
            className: classNames,
          },
        };
        node.children = [];
        return;
      }
    });
  };
};
