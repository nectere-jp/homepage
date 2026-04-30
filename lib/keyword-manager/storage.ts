/**
 * キーワードデータベースの永続化（V5: keywords.json の読み書き）
 * V4 形式のデータは自動的に V5 へマイグレーション。
 */
import fs from 'fs/promises';
import path from 'path';
import type { BusinessType, KeywordDatabaseV5, KeywordGroupData } from './types';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');

export function getKeywordsFilePath(): string {
  return KEYWORDS_FILE;
}

export function emptyV5(): KeywordDatabaseV5 {
  return {
    version: '5.0',
    keywordGroups: {},
    usageTracking: {},
    tagMaster: {},
    metadata: {
      version: '5.0',
      lastUpdated: new Date().toISOString(),
      totalTargetKeywords: 0,
      totalTags: 0,
    },
  };
}

/** V4 グループを V5 形式に変換 */
function migrateGroupV4toV5(g: Record<string, unknown>): KeywordGroupData {
  // tier → clusterAxis のマッピング（V4 では tier が big/middle/longtail）
  // V4 は野球特化前のデータなので other にフォールバック
  const clusterAxis = (g.clusterAxis as string) ?? 'other';
  const articleRole = (g.articleRole as string) ?? 'child';
  const articleStatus = (g.articleStatus as string) ??
    ((g.assignedArticles as string[] ?? []).length > 0 ? 'needs_update' : 'pending');

  return {
    id: g.id as string,
    clusterAxis: clusterAxis as KeywordGroupData['clusterAxis'],
    articleRole: articleRole as KeywordGroupData['articleRole'],
    articleStatus: articleStatus as KeywordGroupData['articleStatus'],
    hubArticleSlug: (g.hubArticleSlug as string | null) ?? null,
    relatedBusiness: (g.relatedBusiness as BusinessType[]) ?? [],
    relatedTags: (g.relatedTags as string[]) ?? [],
    assignedArticles: (g.assignedArticles as string[]) ?? [],
    priority: (g.priority as 1 | 2 | 3 | 4 | 5) ?? 3,
    status: (g.status as 'active' | 'paused' | 'achieved') ?? 'active',
    createdAt: (g.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (g.updatedAt as string) ?? new Date().toISOString(),
    variants: (g.variants as KeywordGroupData['variants']) ?? [],
  };
}

export async function loadKeywordDatabase(): Promise<KeywordDatabaseV5> {
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    const parsed = JSON.parse(data);

    if (parsed.version === '5.0' && parsed.keywordGroups) {
      return parsed as KeywordDatabaseV5;
    }

    // V4 → V5 自動マイグレーション
    if ((parsed.version === '4.0' || parsed.keywordGroups) && parsed.keywordGroups) {
      const migratedGroups: Record<string, KeywordGroupData> = {};
      for (const [id, g] of Object.entries(parsed.keywordGroups)) {
        migratedGroups[id] = migrateGroupV4toV5(g as Record<string, unknown>);
      }
      return {
        version: '5.0',
        keywordGroups: migratedGroups,
        usageTracking: parsed.usageTracking ?? {},
        tagMaster: parsed.tagMaster ?? {},
        metadata: {
          version: '5.0',
          lastUpdated: parsed.metadata?.lastUpdated ?? new Date().toISOString(),
          totalTargetKeywords: Object.keys(migratedGroups).length,
          totalTags: Object.keys(parsed.tagMaster ?? {}).length,
        },
      };
    }

    return emptyV5();
  } catch {
    return emptyV5();
  }
}

export async function saveKeywordDatabase(db: KeywordDatabaseV5): Promise<void> {
  db.metadata.lastUpdated = new Date().toISOString();
  db.metadata.totalTargetKeywords = Object.keys(db.keywordGroups).length;
  db.metadata.totalTags = Object.keys(db.tagMaster).length;
  await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
}
