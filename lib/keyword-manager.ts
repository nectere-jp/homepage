import fs from 'fs/promises';
import path from 'path';
import { getAllPosts } from './blog';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');

export interface KeywordData {
  articles: string[];
  frequency: number;
  lastUsed: string;
}

export interface KeywordDatabase {
  globalKeywords: Record<string, KeywordData>;
  keywordGaps: string[];
  analysis: {
    lastAnalyzed: string | null;
    totalArticles: number;
    uniqueKeywords: number;
  };
}

export interface KeywordConflict {
  keyword: string;
  articles: string[];
  severity: 'high' | 'medium' | 'low';
}

/**
 * キーワードデータベースを読み込む
 */
export async function loadKeywordDatabase(): Promise<KeywordDatabase> {
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は初期データを返す
    return {
      globalKeywords: {},
      keywordGaps: [],
      analysis: {
        lastAnalyzed: null,
        totalArticles: 0,
        uniqueKeywords: 0,
      },
    };
  }
}

/**
 * キーワードデータベースを保存
 */
export async function saveKeywordDatabase(db: KeywordDatabase): Promise<void> {
  await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
}

/**
 * すべての記事からキーワードを抽出して更新
 */
export async function updateKeywordDatabase(): Promise<KeywordDatabase> {
  const posts = await getAllPosts();
  const db: KeywordDatabase = {
    globalKeywords: {},
    keywordGaps: [],
    analysis: {
      lastAnalyzed: new Date().toISOString(),
      totalArticles: posts.length,
      uniqueKeywords: 0,
    },
  };

  // 各記事からキーワードを抽出
  for (const post of posts) {
    const keywords = [
      post.seo.primaryKeyword,
      ...post.seo.secondaryKeywords,
    ].filter(Boolean);

    for (const keyword of keywords) {
      if (!db.globalKeywords[keyword]) {
        db.globalKeywords[keyword] = {
          articles: [],
          frequency: 0,
          lastUsed: post.date,
        };
      }

      db.globalKeywords[keyword].articles.push(post.slug);
      db.globalKeywords[keyword].frequency += 1;

      // 最新の使用日を更新
      if (new Date(post.date) > new Date(db.globalKeywords[keyword].lastUsed)) {
        db.globalKeywords[keyword].lastUsed = post.date;
      }
    }
  }

  db.analysis.uniqueKeywords = Object.keys(db.globalKeywords).length;

  await saveKeywordDatabase(db);
  return db;
}

/**
 * キーワードの競合をチェック
 */
export async function checkKeywordConflicts(
  keywords: string[]
): Promise<KeywordConflict[]> {
  const db = await loadKeywordDatabase();
  const conflicts: KeywordConflict[] = [];

  for (const keyword of keywords) {
    const data = db.globalKeywords[keyword];
    if (data && data.articles.length > 0) {
      let severity: 'high' | 'medium' | 'low' = 'low';
      
      if (data.frequency >= 3) {
        severity = 'high';
      } else if (data.frequency === 2) {
        severity = 'medium';
      }

      conflicts.push({
        keyword,
        articles: data.articles,
        severity,
      });
    }
  }

  return conflicts;
}

/**
 * キーワードギャップを分析
 * SEO戦略ドキュメントのキーワードと比較
 */
export async function analyzeKeywordGaps(
  targetKeywords: string[]
): Promise<string[]> {
  const db = await loadKeywordDatabase();
  const usedKeywords = Object.keys(db.globalKeywords);

  // 使用されていないキーワードを抽出
  const gaps = targetKeywords.filter(
    keyword => !usedKeywords.includes(keyword)
  );

  return gaps;
}

/**
 * キーワードの使用状況を取得
 */
export async function getKeywordUsage(keyword: string): Promise<KeywordData | null> {
  const db = await loadKeywordDatabase();
  return db.globalKeywords[keyword] || null;
}

/**
 * よく使われているキーワードを取得
 */
export async function getTopKeywords(limit: number = 10): Promise<Array<{
  keyword: string;
  data: KeywordData;
}>> {
  const db = await loadKeywordDatabase();
  const entries = Object.entries(db.globalKeywords);

  entries.sort((a, b) => b[1].frequency - a[1].frequency);

  return entries.slice(0, limit).map(([keyword, data]) => ({
    keyword,
    data,
  }));
}

/**
 * 記事に最適なキーワードを提案
 */
export async function suggestKeywordsForArticle(
  title: string,
  content: string,
  existingKeywords: string[] = []
): Promise<string[]> {
  const db = await loadKeywordDatabase();
  const allKeywords = Object.keys(db.globalKeywords);

  // 既存のキーワードから、使用頻度が低いものを優先的に提案
  const suggestions = allKeywords
    .filter(keyword => !existingKeywords.includes(keyword))
    .filter(keyword => {
      // タイトルまたは本文に含まれるキーワード
      return (
        title.toLowerCase().includes(keyword.toLowerCase()) ||
        content.toLowerCase().includes(keyword.toLowerCase())
      );
    })
    .sort((a, b) => {
      // 使用頻度が低い順
      return db.globalKeywords[a].frequency - db.globalKeywords[b].frequency;
    })
    .slice(0, 5);

  return suggestions;
}
