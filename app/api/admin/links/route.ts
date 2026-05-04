import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

interface LinkInfo {
  targetSlug: string;
  anchorText: string;
}

interface ArticleLinkData {
  slug: string;
  title: string;
  published: boolean;
  clusterAxis?: string;
  articleRole?: string;
  outgoingLinks: LinkInfo[];
  incomingLinks: { fromSlug: string; anchorText: string }[];
  brokenLinks: LinkInfo[];
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    // Phase 1: parse all articles
    const articles: Map<string, { title: string; published: boolean; clusterAxis?: string; articleRole?: string; content: string }> = new Map();

    for (const file of mdFiles) {
      const slug = file.replace(/\.md$/, '');
      const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      articles.set(slug, {
        title: data.title || slug,
        published: data.published !== false,
        clusterAxis: data.clusterAxis,
        articleRole: data.articleRole,
        content,
      });
    }

    const publishedSlugs = new Set(
      [...articles.entries()].filter(([, a]) => a.published).map(([slug]) => slug),
    );

    // Phase 2: extract internal links from each article
    const linkRegex = /\[([^\]]*)\]\(\/(?:ja\/|en\/|de\/)?blog\/([^/?#)]+)[^)]*\)/g;
    const result: ArticleLinkData[] = [];
    const incomingMap: Map<string, { fromSlug: string; anchorText: string }[]> = new Map();

    for (const [slug, article] of articles) {
      const outgoingLinks: LinkInfo[] = [];
      const brokenLinks: LinkInfo[] = [];
      let match;
      linkRegex.lastIndex = 0;

      // Reset regex for each article
      const regex = /\[([^\]]*)\]\(\/(?:ja\/|en\/|de\/)?blog\/([^/?#)]+)[^)]*\)/g;
      while ((match = regex.exec(article.content)) !== null) {
        const anchorText = match[1];
        const targetSlug = match[2];

        if (targetSlug === slug) continue; // self-link skip

        outgoingLinks.push({ targetSlug, anchorText });

        if (!articles.has(targetSlug)) {
          brokenLinks.push({ targetSlug, anchorText });
        } else if (!publishedSlugs.has(targetSlug)) {
          brokenLinks.push({ targetSlug, anchorText });
        } else {
          // valid link — record incoming
          if (!incomingMap.has(targetSlug)) incomingMap.set(targetSlug, []);
          incomingMap.get(targetSlug)!.push({ fromSlug: slug, anchorText });
        }
      }

      result.push({
        slug,
        title: article.title,
        published: article.published,
        clusterAxis: article.clusterAxis,
        articleRole: article.articleRole,
        outgoingLinks,
        incomingLinks: [], // filled below
        brokenLinks,
      });
    }

    // Phase 3: fill incoming links
    for (const item of result) {
      item.incomingLinks = incomingMap.get(item.slug) || [];
    }

    return NextResponse.json({ articles: result });
  } catch (error) {
    console.error('Link analysis error:', error);
    return errorResponse('リンク分析に失敗しました');
  }
}
