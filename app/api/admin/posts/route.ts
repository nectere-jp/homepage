import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs/promises';
import { getAllPosts, savePost, generateUniqueSlug, writeBlogIndex } from '@/lib/blog';
import { updateKeywordDatabase, getDisplayLabelForPrimaryKeyword, getGroupByIdOrVariant } from '@/lib/keyword-manager';
import { commitFilesWithBlogImages } from '@/lib/github';

/** 記事種別: ピラー or クラスター（V4: グループの tier から判定。primaryKeyword はグループID or バリアント） */
async function getArticleType(primaryKeyword: string): Promise<'pillar' | 'cluster' | null> {
  if (!primaryKeyword) return null;
  const group = await getGroupByIdOrVariant(primaryKeyword);
  if (!group) return null;
  if (group.tier === 'middle' || group.tier === 'big') return 'pillar';
  if (group.tier === 'longtail') return 'cluster';
  return null;
}

// 記事一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || undefined;
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    const posts = await getAllPosts(locale, { includeDrafts });

    const postsWithType = await Promise.all(
      posts.map(async (p) => {
        const primaryKeyword = p.seo?.primaryKeyword ?? '';
        let displayLabel: string | undefined;
        let articleType: 'pillar' | 'cluster' | null = null;
        if (primaryKeyword) {
          try {
            displayLabel = await getDisplayLabelForPrimaryKeyword(primaryKeyword);
            articleType = await getArticleType(primaryKeyword);
          } catch {
            displayLabel = primaryKeyword;
          }
        }
        return {
          ...p,
          articleType,
          displayLabel: displayLabel || undefined,
        };
      })
    );

    return NextResponse.json({ posts: postsWithType });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// 新規記事作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, ...frontmatter } = body;

    // スラッグを生成（既存のslugとの衝突をチェック）
    const slug = frontmatter.slug || await generateUniqueSlug(title, frontmatter.date);

    // 記事を保存
    await savePost(slug, frontmatter, content);

    // build:blog-index と同様に blog-index.json / keywords.json を更新してから 1 コミットで反映
    let successMessage = '記事を作成しました';
    try {
      await writeBlogIndex();
    } catch (indexError) {
      console.error('Failed to update blog-index.json:', indexError);
    }
    await updateKeywordDatabase();

    try {
      const contentDir = path.join(process.cwd(), 'content');
      const fileContent = matter.stringify(content, frontmatter);
      const [indexContent, keywordsContent] = await Promise.all([
        fs.readFile(path.join(contentDir, 'blog-index.json'), 'utf8'),
        fs.readFile(path.join(contentDir, 'keywords.json'), 'utf8'),
      ]);
      await commitFilesWithBlogImages(
        [
          { path: `content/blog/${slug}.md`, content: fileContent },
          { path: 'content/blog-index.json', content: indexContent },
          { path: 'content/keywords.json', content: keywordsContent },
        ],
        `Add blog post: ${title}`,
        fileContent
      );
      successMessage = '記事を作成し、GitHubにコミットしました';
    } catch (githubError) {
      console.error('GitHub commit failed:', githubError);
      successMessage = '記事を保存しました（GitHubコミット失敗、手動でpushしてください）';
    }

    return NextResponse.json({ 
      success: true, 
      slug,
      message: successMessage
    });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
