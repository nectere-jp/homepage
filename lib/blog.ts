import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export type CategoryType = 'article' | 'press-release' | 'other';
export type BusinessType = 'translation' | 'web-design' | 'print' | 'nobilva' | 'teachit';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  categoryType: CategoryType; // 記事/プレスリリース/その他
  relatedBusiness?: BusinessType[]; // 記事（article）の場合のみ、事業との紐付け
  tags: string[];
  image?: string;
  seo: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    relatedArticles?: string[];
  };
  locale: string;
  content: string;
  published?: boolean;
}

export interface BlogPostMetadata extends Omit<BlogPost, 'content'> {}

/**
 * すべてのブログ記事を取得
 */
export async function getAllPosts(locale?: string): Promise<BlogPostMetadata[]> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    const posts = await Promise.all(
      mdFiles.map(async (filename) => {
        const slug = filename.replace(/\.md$/, '');
        const post = await getPostBySlug(slug);
        return post;
      })
    );

    // localeでフィルタ
    let filteredPosts = posts.filter(post => post !== null) as BlogPostMetadata[];
    if (locale) {
      filteredPosts = filteredPosts.filter(post => post.locale === locale);
    }

    // 日付でソート（新しい順）
    return filteredPosts
      .filter(post => post.published !== false)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading blog directory:', error);
    return [];
  }
}

/**
 * スラッグから記事を取得
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      author: data.author || 'Nectere編集部',
      category: data.category || '',
      categoryType: data.categoryType || 'article', // デフォルトは記事
      relatedBusiness: data.relatedBusiness || [],
      tags: data.tags || [],
      image: data.image,
      seo: {
        primaryKeyword: data.seo?.primaryKeyword || '',
        secondaryKeywords: data.seo?.secondaryKeywords || [],
        relatedArticles: data.seo?.relatedArticles || [],
      },
      locale: data.locale || 'ja',
      content,
      published: data.published !== false,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * カテゴリーで記事を取得
 */
export async function getPostsByCategory(
  category: string,
  locale?: string
): Promise<BlogPostMetadata[]> {
  const posts = await getAllPosts(locale);
  return posts.filter(post => post.category === category);
}

/**
 * タグで記事を取得
 */
export async function getPostsByTag(
  tag: string,
  locale?: string
): Promise<BlogPostMetadata[]> {
  const posts = await getAllPosts(locale);
  return posts.filter(post => post.tags.includes(tag));
}

/**
 * すべてのカテゴリーを取得
 */
export async function getAllCategories(locale?: string): Promise<string[]> {
  const posts = await getAllPosts(locale);
  const categories = [...new Set(posts.map(post => post.category))];
  return categories.filter(Boolean);
}

/**
 * すべてのタグを取得
 */
export async function getAllTags(locale?: string): Promise<string[]> {
  const posts = await getAllPosts(locale);
  const tags = [...new Set(posts.flatMap(post => post.tags))];
  return tags.filter(Boolean);
}

/**
 * 関連記事を取得
 */
export async function getRelatedPosts(
  slug: string,
  limit: number = 3
): Promise<BlogPostMetadata[]> {
  const post = await getPostBySlug(slug);
  if (!post) return [];

  const allPosts = await getAllPosts(post.locale);
  
  // 現在の記事を除外
  const otherPosts = allPosts.filter(p => p.slug !== slug);

  // タグの一致数でスコアリング
  const scoredPosts = otherPosts.map(p => {
    const matchingTags = p.tags.filter(tag => post.tags.includes(tag)).length;
    const categoryMatch = p.category === post.category ? 1 : 0;
    return {
      post: p,
      score: matchingTags * 2 + categoryMatch,
    };
  });

  // スコアでソート
  scoredPosts.sort((a, b) => b.score - a.score);

  return scoredPosts.slice(0, limit).map(s => s.post);
}

/**
 * 記事を保存
 */
export async function savePost(slug: string, frontmatter: any, content: string): Promise<void> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const fileContent = matter.stringify(content, frontmatter);
  await fs.writeFile(filePath, fileContent, 'utf8');
}

/**
 * 記事を削除
 */
export async function deletePost(slug: string): Promise<void> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  await fs.unlink(filePath);
}

/**
 * 新しいスラッグを生成（英数字とハイフンのみ）
 */
export function generateSlug(title: string, date?: string): string {
  const dateStr = date || new Date().toISOString().split('T')[0];
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // 英数字以外をハイフンに変換
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
  return `${dateStr}-${slug}`;
}

/**
 * スラッグをバリデーション
 */
export function validateSlug(slug: string): boolean {
  // 英数字とハイフンのみを許可
  return /^[a-z0-9-]+$/.test(slug);
}
