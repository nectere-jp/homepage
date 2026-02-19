/**
 * キーワードグループのクエリ・同趣旨競合・ピラー構造（V4）
 */
import { getAllPosts } from '../blog';
import type { BusinessType } from '../blog';
import type { KeywordGroupData, SameIntentConflict } from './types';
import {
  loadKeywordGroups,
  getRepresentativeKeyword,
  getGroupByVariantKeyword,
  getGroupByIdOrVariant,
} from './groups';

export async function getKeywordsByBusiness(
  business: BusinessType
): Promise<Array<{ groupId: string; group: KeywordGroupData; representativeKeyword: string }>> {
  const groups = await loadKeywordGroups();
  return Object.entries(groups)
    .filter(([, g]) => g.relatedBusiness.includes(business))
    .map(([groupId, group]) => ({
      groupId,
      group,
      representativeKeyword: getRepresentativeKeyword(group),
    }));
}

export async function getKeywordsByPriority(
  priority: 1 | 2 | 3 | 4 | 5
): Promise<Array<{ groupId: string; group: KeywordGroupData; representativeKeyword: string }>> {
  const groups = await loadKeywordGroups();
  const firstPv = (g: KeywordGroupData) => g.variants[0]?.estimatedPv ?? 0;
  return Object.entries(groups)
    .filter(([, g]) => g.priority === priority)
    .map(([groupId, group]) => ({
      groupId,
      group,
      representativeKeyword: getRepresentativeKeyword(group),
    }))
    .sort((a, b) => firstPv(b.group) - firstPv(a.group));
}

export async function suggestUnusedKeywords(
  limit: number = 10
): Promise<Array<{ groupId: string; group: KeywordGroupData; representativeKeyword: string }>> {
  const groups = await loadKeywordGroups();
  const firstPv = (g: KeywordGroupData) => g.variants[0]?.estimatedPv ?? 0;
  return Object.entries(groups)
    .filter(([, g]) => g.status === 'active' && g.assignedArticles.length === 0)
    .sort((a, b) => {
      if (b[1].priority !== a[1].priority) return b[1].priority - a[1].priority;
      return firstPv(b[1]) - firstPv(a[1]);
    })
    .slice(0, limit)
    .map(([groupId, group]) => ({
      groupId,
      group,
      representativeKeyword: getRepresentativeKeyword(group),
    }));
}

export function getSameIntentKeywordIds(
  keywordGroups: Record<string, KeywordGroupData>,
  keywordOrGroupId: string
): string[] {
  const group = keywordGroups[keywordOrGroupId];
  if (group) return group.variants.map((v) => v.keyword);
  for (const g of Object.values(keywordGroups)) {
    if (g.variants.some((v) => v.keyword === keywordOrGroupId)) {
      return g.variants.map((v) => v.keyword);
    }
  }
  return [];
}

export async function checkSameIntentConflicts(
  keywords: string[]
): Promise<SameIntentConflict[]> {
  const groups = await loadKeywordGroups();
  const conflicts: SameIntentConflict[] = [];
  const seenGroupIds = new Set<string>();

  for (const keyword of keywords) {
    let group: KeywordGroupData | null = groups[keyword] ?? null;
    if (!group) {
      for (const g of Object.values(groups)) {
        if (g.variants.some((v) => v.keyword === keyword)) {
          group = g;
          break;
        }
      }
    }
    if (!group) continue;
    if (seenGroupIds.has(group.id)) continue;
    seenGroupIds.add(group.id);
    if (group.assignedArticles.length <= 1) continue;
    const variantKeywords = group.variants.map((v) => v.keyword);
    conflicts.push({
      sameIntentKey: group.id,
      keywords: variantKeywords,
      existingArticles: group.assignedArticles,
      message: `同趣旨のキーワード（${getRepresentativeKeyword(group)}）が ${group.assignedArticles.length} 件の記事に分散しています。1ピラーページにまとめることを推奨します。`,
    });
  }
  return conflicts;
}

export async function getPillarClusterStructure(): Promise<{
  pillars: Array<{ slug: string; title?: string; keywords: string[]; clusters: string[] }>;
  orphans: string[];
}> {
  const groups = await loadKeywordGroups();
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const slugToTitle = new Map(posts.map((p) => [p.slug, p.title]));
  const pillarMap = new Map<string, { keywords: string[]; clusters: string[] }>();

  for (const [groupId, group] of Object.entries(groups)) {
    if (group.tier !== 'middle' && group.tier !== 'big') continue;
    for (const slug of group.assignedArticles) {
      const entry = pillarMap.get(slug) ?? { keywords: [], clusters: [] };
      if (!entry.keywords.includes(groupId)) entry.keywords.push(groupId);
      pillarMap.set(slug, entry);
    }
  }
  for (const [groupId, group] of Object.entries(groups)) {
    if (group.tier === 'longtail' && group.parentId) {
      for (const [slug, entry] of pillarMap.entries()) {
        if (
          entry.keywords.includes(group.parentId) &&
          !entry.clusters.includes(groupId)
        ) {
          entry.clusters.push(groupId);
          pillarMap.set(slug, entry);
        }
      }
    }
  }
  const clusteredLongtail = new Set<string>();
  for (const { clusters } of pillarMap.values()) {
    clusters.forEach((id) => clusteredLongtail.add(id));
  }
  const orphans = Object.entries(groups)
    .filter(
      ([, g]) =>
        g.tier === 'longtail' && g.parentId && !clusteredLongtail.has(g.id)
    )
    .map(([id]) => id);

  const pillars = Array.from(pillarMap.entries()).map(
    ([slug, { keywords, clusters }]) => ({
      slug,
      title: slugToTitle.get(slug),
      keywords,
      clusters,
    })
  );
  return { pillars, orphans };
}

/** 記事の primaryKeyword（グループID or バリアント文字列）から表示用ラベルを取得（V4） */
export async function getDisplayLabelForPrimaryKeyword(
  primaryKeyword: string
): Promise<string> {
  if (!primaryKeyword) return '';
  const group = await getGroupByIdOrVariant(primaryKeyword);
  return group ? getRepresentativeKeyword(group) : primaryKeyword;
}
