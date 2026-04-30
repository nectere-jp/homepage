/**
 * キーワードグループのクエリ・同趣旨競合・クラスタ軸構造（V5）
 */
import { getAllPosts } from '../blog';
import type { BusinessType, ClusterAxis } from '../blog';
import type { KeywordGroupData, SameIntentConflict } from './types';
import {
  loadKeywordGroups,
  getRepresentativeKeyword,
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
      message: `同趣旨のキーワード（${getRepresentativeKeyword(group)}）が ${group.assignedArticles.length} 件の記事に分散しています。1ハブ記事にまとめることを推奨します。`,
    });
  }
  return conflicts;
}

/** 4軸クラスタ構造を取得（ハブ記事＋子記事のツリー形式） */
export async function getClusterAxisStructure(): Promise<{
  axes: Record<ClusterAxis, {
    hub: { slug: string; title?: string; keywords: string[] } | null;
    children: Array<{ slug?: string; title?: string; keywords: string[]; articleStatus?: string }>;
  }>;
  unassigned: string[];
}> {
  const groups = await loadKeywordGroups();
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const slugToTitle = new Map(posts.map((p) => [p.slug, p.title]));

  const axisKeys: ClusterAxis[] = ['time', 'career', 'self', 'relationship', 'other'];
  const axes = Object.fromEntries(
    axisKeys.map((ax) => [ax, { hub: null as { slug: string; title?: string; keywords: string[] } | null, children: [] as Array<{ slug?: string; title?: string; keywords: string[]; articleStatus?: string }> }])
  ) as Record<ClusterAxis, { hub: { slug: string; title?: string; keywords: string[] } | null; children: Array<{ slug?: string; title?: string; keywords: string[]; articleStatus?: string }> }>;

  const unassigned: string[] = [];

  for (const [groupId, group] of Object.entries(groups)) {
    const axis = group.clusterAxis ?? 'other';
    const rep = getRepresentativeKeyword(group);

    if (group.articleRole === 'hub') {
      const slug = group.assignedArticles[0];
      axes[axis].hub = {
        slug: slug ?? groupId,
        title: slug ? slugToTitle.get(slug) : undefined,
        keywords: group.variants.map((v) => v.keyword),
      };
    } else {
      const slug = group.assignedArticles[0];
      axes[axis].children.push({
        slug,
        title: slug ? slugToTitle.get(slug) : undefined,
        keywords: group.variants.map((v) => v.keyword),
        articleStatus: group.articleStatus,
      });
    }

    if (group.assignedArticles.length === 0 && group.articleStatus === 'pending') {
      unassigned.push(rep);
    }
  }

  return { axes, unassigned };
}

/** @deprecated V4 互換用。getClusterAxisStructure を使用してください。 */
export async function getPillarClusterStructure(): Promise<{
  pillars: Array<{ slug: string; title?: string; keywords: string[]; clusters: string[] }>;
  orphans: string[];
}> {
  const { axes } = await getClusterAxisStructure();
  const pillars = Object.values(axes)
    .filter((ax) => ax.hub)
    .map((ax) => ({
      slug: ax.hub!.slug,
      title: ax.hub?.title,
      keywords: ax.hub!.keywords,
      clusters: ax.children.map((c) => c.slug ?? '').filter(Boolean),
    }));
  return { pillars, orphans: [] };
}

/** 記事の primaryKeyword（グループID or バリアント文字列）から表示用ラベルを取得 */
export async function getDisplayLabelForPrimaryKeyword(
  primaryKeyword: string
): Promise<string> {
  if (!primaryKeyword) return '';
  const group = await getGroupByIdOrVariant(primaryKeyword);
  return group ? getRepresentativeKeyword(group) : primaryKeyword;
}
