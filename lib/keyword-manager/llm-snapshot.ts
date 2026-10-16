import { adminFetch } from "@/lib/admin-fetch";
import type { MasterKeyword } from "@/components/admin/keywords/types";

/** グループ化済みキーワード（軸・ハブ・チャイルドで切り分けた形） */
export interface LlmSnapshotGroup {
  gid: string;
  label: string;
  middle: MasterKeyword[];
  longtail: MasterKeyword[];
}

/** 役割ラベル */
const roleLabel = (r?: string) => (r === "hub" ? "ハブ" : "チャイルド");

/**
 * 現在のキーワード一覧と記事概要を Markdown にまとめてクリップボードにコピーする。
 *
 * - `groupedByIntent` は page.tsx で算出済みの軸ごとのグループ
 * - `getMergedKw` は pendingEdits を適用済みの kw を返す
 * - `totalCount` は見出しに出す件数（フィルタ後の件数）
 */
export async function copyKeywordsForLLM(params: {
  groupedByIntent: LlmSnapshotGroup[];
  getMergedKw: (kw: MasterKeyword) => MasterKeyword;
  totalCount: number;
}): Promise<void> {
  const { groupedByIntent, getMergedKw, totalCount } = params;

  // キーワードセクション
  const kwLines: string[] = [
    `## キーワード一覧（${totalCount}件）`,
    "",
  ];
  for (const { label, middle, longtail } of groupedByIntent) {
    kwLines.push(`### ${label}`);
    for (const kw of middle) {
      const merged = getMergedKw(kw);
      const parts = [`**[${roleLabel(merged.articleRole)}] ${merged.keyword}**`];
      if (merged.estimatedPv) parts.push(`月間PV: ${merged.estimatedPv.toLocaleString()}`);
      if (merged.expectedRank) parts.push(`期待順位: ${merged.expectedRank}位`);
      if (merged.cvr != null) parts.push(`CVR: ${merged.cvr}%`);
      kwLines.push(parts.join(" | "));
      if (merged.relatedTags?.length) kwLines.push(`  タグ: ${merged.relatedTags.join(", ")}`);
      if (merged.assignedArticles?.length) kwLines.push(`  記事: ${merged.assignedArticles.join(", ")}`);
    }
    for (const kw of longtail) {
      const merged = getMergedKw(kw);
      const parts = [`  - ${merged.keyword}`];
      if (merged.estimatedPv) parts.push(`月間PV: ${merged.estimatedPv.toLocaleString()}`);
      if (merged.expectedRank) parts.push(`期待順位: ${merged.expectedRank}位`);
      kwLines.push(parts.join(" | "));
    }
    kwLines.push("");
  }

  // 記事セクション
  let postLines: string[] = [];
  try {
    const res = await adminFetch("/api/admin/posts?includeDrafts=true");
    if (res.ok) {
      const data = await res.json();
      const posts: Array<{
        title: string;
        slug: string;
        description: string;
        tags: string[];
        published: boolean;
        seo: { primaryKeyword?: string; secondaryKeywords?: string[] };
      }> = data.posts ?? [];
      postLines = [
        `## 記事一覧（${posts.length}件）`,
        "",
        ...posts.flatMap((p) => {
          const lines = [`### ${p.title}${p.published === false ? " [下書き]" : ""}`];
          lines.push(`- URL: /blog/${p.slug}`);
          if (p.seo.primaryKeyword) lines.push(`- メインキーワード: ${p.seo.primaryKeyword}`);
          if (p.seo.secondaryKeywords?.length) lines.push(`- サブキーワード: ${p.seo.secondaryKeywords.join(", ")}`);
          if (p.tags?.length) lines.push(`- タグ: ${p.tags.join(", ")}`);
          if (p.description) lines.push(`- 概要: ${p.description}`);
          return [...lines, ""];
        }),
      ];
    }
  } catch {
    // 記事取得失敗は無視してキーワードだけコピー
  }

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const text = [
    `# サイト現況スナップショット（${today}）`,
    "",
    kwLines.join("\n"),
    postLines.join("\n"),
  ].join("\n");

  await navigator.clipboard.writeText(text);
}
