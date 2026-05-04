import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const LEGAL_DIR = path.join(process.cwd(), 'content', 'legal');

export interface LegalDocument {
  title: string;
  description?: string;
  lastUpdated?: string;
  app?: string;
  content: string;
}

export async function getLegalDocument(
  slug: string[],
  locale: string
): Promise<LegalDocument | null> {
  const slugPath = slug.join('/');

  // ロケール別ファイルを優先、なければ ja にフォールバック
  const candidates = [
    path.join(LEGAL_DIR, `${slugPath}.${locale}.md`),
    path.join(LEGAL_DIR, `${slugPath}.ja.md`),
  ];

  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(raw);
      return {
        title: data.title ?? '',
        description: data.description,
        lastUpdated: data.lastUpdated,
        app: data.app,
        content,
      };
    } catch {
      // ファイルが存在しない場合は次を試す
    }
  }

  return null;
}
