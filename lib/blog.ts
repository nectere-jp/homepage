import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const BLOG_INDEX_PATH = path.join(process.cwd(), 'content', 'blog-index.json');

export interface BlogIndexFile {
  updatedAt: string;
  posts: BlogPostMetadata[];
}

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
 * content/blog 内の全 .md からメタデータを組み立てる（パース失敗時は throw）
 */
async function buildBlogIndexFromFiles(): Promise<BlogPostMetadata[]> {
  const files = await fs.readdir(BLOG_DIR);
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  const posts: BlogPostMetadata[] = [];
  for (const filename of mdFiles) {
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(BLOG_DIR, filename);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data } = matter(fileContents);

    const dateStr = data.date || '';
    const date = dateStr ? new Date(dateStr) : null;
    const isValidDate = date && !isNaN(date.getTime());

    posts.push({
      slug,
      title: data.title || '',
      description: data.description || '',
      date: isValidDate ? dateStr : new Date().toISOString().split('T')[0],
      author: data.author || 'Nectere編集部',
      category: data.category || '',
      categoryType: data.categoryType || 'article',
      relatedBusiness: data.relatedBusiness || [],
      tags: data.tags || [],
      image: data.image,
      seo: {
        primaryKeyword: data.seo?.primaryKeyword || '',
        secondaryKeywords: data.seo?.secondaryKeywords || [],
        relatedArticles: data.seo?.relatedArticles || [],
      },
      locale: data.locale || 'ja',
      published: data.published !== false,
    });
  }
  return posts;
}

/**
 * 全 .md から blog-index.json を生成して書き出す（スクリプト・管理API用）
 */
export async function writeBlogIndex(): Promise<void> {
  const posts = await buildBlogIndexFromFiles();
  const sorted = posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
  const index: BlogIndexFile = {
    updatedAt: new Date().toISOString(),
    posts: sorted,
  };
  await fs.writeFile(BLOG_INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
}

function filterAndSortPosts(
  posts: BlogPostMetadata[],
  locale?: string,
  options?: { includeDrafts?: boolean }
): BlogPostMetadata[] {
  let filtered = posts;
  if (locale) {
    filtered = filtered.filter((p) => p.locale === locale);
  }
  if (!options?.includeDrafts) {
    filtered = filtered.filter((p) => p.published !== false);
  }
  return filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
}

/**
 * すべてのブログ記事を取得
 * blog-index.json があればそれを参照し、なければ .md を都度パース（フォールバック）
 * @param locale - ロケールでフィルタリング（オプション）
 * @param options - オプション設定
 * @param options.includeDrafts - 下書き記事を含めるかどうか（デフォルト: false）
 */
export async function getAllPosts(
  locale?: string,
  options?: {
    includeDrafts?: boolean;
  }
): Promise<BlogPostMetadata[]> {
  try {
    const raw = await fs.readFile(BLOG_INDEX_PATH, 'utf8');
    const index = JSON.parse(raw) as BlogIndexFile;
    if (index?.posts && Array.isArray(index.posts)) {
      return filterAndSortPosts(index.posts, locale, options);
    }
  } catch {
    // ファイルがない・壊れている場合は .md から取得にフォールバック
  }

  try {
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter((file) => file.endsWith('.md'));

    const posts = await Promise.all(
      mdFiles.map(async (filename) => {
        try {
          const slug = filename.replace(/\.md$/, '');
          const filePath = path.join(BLOG_DIR, filename);
          const fileContents = await fs.readFile(filePath, 'utf8');
          const { data } = matter(fileContents);

          const dateStr = data.date || '';
          const date = dateStr ? new Date(dateStr) : null;
          const isValidDate = date && !isNaN(date.getTime());

          const post: BlogPostMetadata = {
            slug,
            title: data.title || '',
            description: data.description || '',
            date: isValidDate ? dateStr : new Date().toISOString().split('T')[0],
            author: data.author || 'Nectere編集部',
            category: data.category || '',
            categoryType: data.categoryType || 'article',
            relatedBusiness: data.relatedBusiness || [],
            tags: data.tags || [],
            image: data.image,
            seo: {
              primaryKeyword: data.seo?.primaryKeyword || '',
              secondaryKeywords: data.seo?.secondaryKeywords || [],
              relatedArticles: data.seo?.relatedArticles || [],
            },
            locale: data.locale || 'ja',
            published: data.published !== false,
          };
          return post;
        } catch (error) {
          console.error(`Error reading post ${filename}:`, error);
          return null;
        }
      })
    );

    const validPosts = posts.filter((post): post is BlogPostMetadata => post !== null);
    return filterAndSortPosts(validPosts, locale, options);
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
 * タイトルからスラッグを生成（英数字とハイフンのみ、日付プレフィックスなし）
 */
export function generateSlug(title: string, date?: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // 英数字以外をハイフンに変換
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
  return slug;
}

/**
 * 既存のスラッグと衝突しないユニークなスラッグを生成
 */
export async function generateUniqueSlug(title: string, date?: string): Promise<string> {
  const baseSlug = generateSlug(title, date);
  
  // 既存の記事のスラッグを取得
  const existingPosts = await getAllPosts();
  const existingSlugs = new Set(existingPosts.map(post => post.slug));
  
  // ベーススラッグが既に存在しない場合はそのまま返す
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }
  
  // 衝突する場合は番号を付与
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  while (existingSlugs.has(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}

/**
 * スラッグをバリデーション
 */
export function validateSlug(slug: string): boolean {
  // 英数字とハイフンのみを許可
  return /^[a-z0-9-]+$/.test(slug);
}
