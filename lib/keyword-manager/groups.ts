/**
 * キーワードグループの CRUD と検索（V4）
 */
import type { KeywordGroupData, KeywordVariant, RankHistoryEntry } from './types';
import { loadKeywordDatabase, saveKeywordDatabase } from './storage';

export async function loadKeywordGroups(): Promise<Record<string, KeywordGroupData>> {
  const db = await loadKeywordDatabase();
  return db.keywordGroups;
}

export async function getGroupByVariantKeyword(keyword: string): Promise<KeywordGroupData | null> {
  const groups = await loadKeywordGroups();
  for (const g of Object.values(groups)) {
    if (g.variants.some((v) => v.keyword === keyword)) return g;
  }
  return null;
}

export async function getGroupByIdOrVariant(idOrVariant: string): Promise<KeywordGroupData | null> {
  const groups = await loadKeywordGroups();
  if (groups[idOrVariant]) return groups[idOrVariant];
  return getGroupByVariantKeyword(idOrVariant);
}

export function getRepresentativeKeyword(group: KeywordGroupData): string {
  return group.variants[0]?.keyword ?? group.id;
}

export async function saveKeywordGroup(groupId: string, data: Partial<KeywordGroupData>): Promise<void> {
  const db = await loadKeywordDatabase();
  const now = new Date().toISOString();
  const existing = db.keywordGroups[groupId];
  if (existing) {
    db.keywordGroups[groupId] = { ...existing, ...data, updatedAt: now };
  } else {
    db.keywordGroups[groupId] = {
      id: groupId,
      tier: 'middle',
      parentId: null,
      relatedBusiness: [],
      relatedTags: [],
      assignedArticles: [],
      priority: 3,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      variants: [],
      ...data,
    } as KeywordGroupData;
  }
  await saveKeywordDatabase(db);
}

export async function saveKeywordGroupsBulk(
  updates: Array<{ groupId: string; patch: Partial<KeywordGroupData> }>
): Promise<void> {
  if (updates.length === 0) return;
  const db = await loadKeywordDatabase();
  const now = new Date().toISOString();
  for (const { groupId, patch } of updates) {
    const g = db.keywordGroups[groupId];
    if (g) {
      db.keywordGroups[groupId] = { ...g, ...patch, updatedAt: now };
    }
  }
  await saveKeywordDatabase(db);
}

export async function deleteKeywordGroup(groupId: string): Promise<void> {
  const db = await loadKeywordDatabase();
  delete db.keywordGroups[groupId];
  await saveKeywordDatabase(db);
}

export async function updateVariantRank(
  groupId: string,
  variantKeyword: string,
  rank: number,
  source: 'manual' | 'api' = 'manual'
): Promise<void> {
  const db = await loadKeywordDatabase();
  const group = db.keywordGroups[groupId];
  if (!group) throw new Error(`Group "${groupId}" not found`);
  const variant = group.variants.find((v) => v.keyword === variantKeyword);
  if (!variant) throw new Error(`Variant "${variantKeyword}" not found in group`);
  const entry: RankHistoryEntry = { date: new Date().toISOString(), rank, source };
  variant.rankHistory = variant.rankHistory ?? [];
  variant.rankHistory.push(entry);
  variant.currentRank = rank;
  group.updatedAt = new Date().toISOString();
  await saveKeywordDatabase(db);
}

/**
 * キーワード（variant または groupId）の順位を更新。互換用。
 */
export async function updateRankHistory(
  keyword: string,
  rank: number,
  source: 'manual' | 'api' = 'manual'
): Promise<void> {
  const group = await getGroupByIdOrVariant(keyword);
  if (!group) throw new Error(`Keyword "${keyword}" not found`);
  const variantKeyword = group.variants.some((v) => v.keyword === keyword)
    ? keyword
    : group.variants[0]?.keyword;
  if (!variantKeyword) throw new Error(`No variant in group "${group.id}"`);
  await updateVariantRank(group.id, variantKeyword, rank, source);
}

export function resolveGroupDefaults(group: KeywordGroupData): KeywordGroupData {
  const hasArticles = (group.assignedArticles?.length ?? 0) > 0;
  return {
    ...group,
    workflowFlag: group.workflowFlag ?? (hasArticles ? 'created' : 'pending'),
  };
}
