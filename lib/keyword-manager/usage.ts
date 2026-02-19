/**
 * 使用状況・タグ・記事向けキーワード提案（V4）
 */
import { getAllPosts } from '../blog';
import type { BusinessType } from '../blog';
import type { KeywordConflict, KeywordData, TagMasterData } from './types';
import { loadKeywordDatabase, saveKeywordDatabase } from './storage';
import { getGroupByVariantKeyword, getRepresentativeKeyword, loadKeywordGroups } from './groups';
import type { KeywordGroupData } from './types';

export async function updateKeywordDatabase(): Promise<void> {
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const db = await loadKeywordDatabase();

  const usageTracking: Record<string, KeywordData> = {};
  for (const post of posts) {
    const keywords = [post.seo.primaryKeyword, ...post.seo.secondaryKeywords].filter(Boolean);
    for (const keyword of keywords) {
      if (!usageTracking[keyword]) {
        usageTracking[keyword] = { articles: [], frequency: 0, lastUsed: post.date };
      }
      usageTracking[keyword].articles.push(post.slug);
      usageTracking[keyword].frequency += 1;
      if (new Date(post.date) > new Date(usageTracking[keyword].lastUsed)) {
        usageTracking[keyword].lastUsed = post.date;
      }
    }
  }

  const now = new Date().toISOString();
  for (const group of Object.values(db.keywordGroups)) {
    const slugs = new Set<string>();
    for (const v of group.variants) {
      const u = usageTracking[v.keyword];
      if (u) u.articles.forEach((s) => slugs.add(s));
    }
    // 記事が groupId で紐づいている場合（V4: グループ単位選択）
    const byGroupId = usageTracking[group.id];
    if (byGroupId) byGroupId.articles.forEach((s) => slugs.add(s));
    group.assignedArticles = Array.from(slugs);
    group.updatedAt = now;
  }

  db.usageTracking = usageTracking;
  await saveKeywordDatabase(db);
}

export async function checkKeywordConflicts(keywords: string[]): Promise<KeywordConflict[]> {
  const db = await loadKeywordDatabase();
  const usage = db.usageTracking || {};
  const conflicts: KeywordConflict[] = [];
  for (const keyword of keywords) {
    const data = usage[keyword];
    if (data && data.articles.length > 0) {
      let severity: 'high' | 'medium' | 'low' = 'low';
      if (data.frequency >= 3) severity = 'high';
      else if (data.frequency === 2) severity = 'medium';
      conflicts.push({ keyword, articles: data.articles, severity });
    }
  }
  return conflicts;
}

export async function analyzeKeywordGaps(targetKeywords: string[]): Promise<string[]> {
  const db = await loadKeywordDatabase();
  const usedKeywords = Object.keys(db.usageTracking || {});
  return targetKeywords.filter((keyword) => !usedKeywords.includes(keyword));
}

export async function getKeywordUsage(keyword: string): Promise<KeywordData | null> {
  const db = await loadKeywordDatabase();
  return db.usageTracking[keyword] || null;
}

export async function getTopKeywords(
  limit: number = 10
): Promise<Array<{ keyword: string; data: KeywordData }>> {
  const db = await loadKeywordDatabase();
  const entries = Object.entries(db.usageTracking || {});
  entries.sort((a, b) => b[1].frequency - a[1].frequency);
  return entries.slice(0, limit).map(([keyword, data]) => ({ keyword, data }));
}

export async function getTagMaster(): Promise<Record<string, TagMasterData>> {
  const db = await loadKeywordDatabase();
  return db.tagMaster;
}

export async function updateTagMaster(tag: string, data: Partial<TagMasterData>): Promise<void> {
  const db = await loadKeywordDatabase();
  if (db.tagMaster[tag]) {
    db.tagMaster[tag] = { ...db.tagMaster[tag], ...data };
  } else {
    db.tagMaster[tag] = { description: '', targetKeywords: [], displayName: tag, ...data };
  }
  await saveKeywordDatabase(db);
}

export async function deleteTagMaster(tag: string): Promise<void> {
  const db = await loadKeywordDatabase();
  delete db.tagMaster[tag];
  await saveKeywordDatabase(db);
}

export async function getTagsFromKeyword(keyword: string): Promise<string[]> {
  const db = await loadKeywordDatabase();
  const group = db.keywordGroups[keyword] ?? (await getGroupByVariantKeyword(keyword));
  if (group) return group.relatedTags;
  return Object.entries(db.tagMaster)
    .filter(([, data]) => data.targetKeywords.includes(keyword))
    .map(([tag]) => tag);
}

export async function suggestKeywordsForArticle(
  title: string,
  content: string,
  existingKeywords: string[] = []
): Promise<string[]> {
  const db = await loadKeywordDatabase();
  const usage = db.usageTracking || {};
  const allKeywords = Object.keys(usage);
  return allKeywords
    .filter((keyword) => !existingKeywords.includes(keyword))
    .filter(
      (keyword) =>
        title.toLowerCase().includes(keyword.toLowerCase()) ||
        content.toLowerCase().includes(keyword.toLowerCase())
    )
    .sort((a, b) => usage[a].frequency - usage[b].frequency)
    .slice(0, 5);
}

export async function suggestUnusedKeywordsByBusiness(
  business: BusinessType,
  limit: number = 5
): Promise<Array<{ groupId: string; group: KeywordGroupData; representativeKeyword: string }>> {
  const groups = await loadKeywordGroups();
  const firstPv = (g: KeywordGroupData) => g.variants[0]?.estimatedPv ?? 0;
  return Object.entries(groups)
    .filter(
      ([, g]) =>
        g.relatedBusiness.includes(business) &&
        g.status === 'active' &&
        g.assignedArticles.length === 0
    )
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
