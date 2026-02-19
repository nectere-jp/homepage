/**
 * キーワードデータベースの永続化（V4: keywords.json の読み書き）
 */
import fs from 'fs/promises';
import path from 'path';
import type { KeywordDatabaseV4 } from './types';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');

export function getKeywordsFilePath(): string {
  return KEYWORDS_FILE;
}

export function emptyV4(): KeywordDatabaseV4 {
  return {
    version: '4.0',
    keywordGroups: {},
    usageTracking: {},
    tagMaster: {},
    metadata: {
      version: '4.0',
      lastUpdated: new Date().toISOString(),
      totalTargetKeywords: 0,
      totalTags: 0,
    },
  };
}

export async function loadKeywordDatabase(): Promise<KeywordDatabaseV4> {
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (parsed.version === '4.0' && parsed.keywordGroups) {
      return parsed as KeywordDatabaseV4;
    }
    return emptyV4();
  } catch {
    return emptyV4();
  }
}

export async function saveKeywordDatabase(db: KeywordDatabaseV4): Promise<void> {
  db.metadata.lastUpdated = new Date().toISOString();
  db.metadata.totalTargetKeywords = Object.keys(db.keywordGroups).length;
  db.metadata.totalTags = Object.keys(db.tagMaster).length;
  await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
}
