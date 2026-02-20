import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs/promises';
import { getPostBySlug, savePost, deletePost, writeBlogIndex } from '@/lib/blog';
import { updateKeywordDatabase } from '@/lib/keyword-manager';
import { commitFiles } from '@/lib/github';

// 記事取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: '記事が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// 記事更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: originalSlug } = await params;
    const body = await request.json();
    const { content, newSlug, ...frontmatter } = body;
    
    const targetSlug = newSlug || originalSlug;
    const slugChanged = newSlug && newSlug !== originalSlug;

    // slugが変更された場合は、古いファイルを削除
    if (slugChanged) {
      await deletePost(originalSlug);
    }

    // 新しいslugで保存
    await savePost(targetSlug, frontmatter, content);

    // build:blog-index と同様に blog-index.json / keywords.json を更新してから 1 コミットで反映
    let successMessage = '記事を更新しました';
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
      const commitMessage = slugChanged
        ? `Rename blog post slug: ${originalSlug} -> ${targetSlug}`
        : `Update blog post: ${frontmatter.title}`;
      const files: { path: string; content: string | null }[] = [
        { path: 'content/blog-index.json', content: indexContent },
        { path: 'content/keywords.json', content: keywordsContent },
      ];
      if (slugChanged) {
        files.push({ path: `content/blog/${originalSlug}.md`, content: null });
        files.push({ path: `content/blog/${targetSlug}.md`, content: fileContent });
      } else {
        files.push({ path: `content/blog/${originalSlug}.md`, content: fileContent });
      }
      await commitFiles(files, commitMessage);
      successMessage = slugChanged
        ? '記事を更新し、スラッグを変更しました'
        : '記事を更新し、GitHubにコミットしました';
    } catch (githubError) {
      console.error('GitHub commit failed:', githubError);
      successMessage = '記事を保存しました（GitHubコミット失敗、手動でpushしてください）';
    }

    return NextResponse.json({ 
      success: true,
      newSlug: slugChanged ? targetSlug : undefined,
      message: successMessage
    });
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// 記事削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    // 記事情報を取得（タイトル用）
    const post = await getPostBySlug(slug);

    await deletePost(slug);

    // build:blog-index と同様に blog-index.json / keywords.json を更新してから 1 コミットで反映（記事削除含む）
    let successMessage = '記事を削除しました';
    try {
      await writeBlogIndex();
    } catch (indexError) {
      console.error('Failed to update blog-index.json:', indexError);
    }
    await updateKeywordDatabase();

    try {
      const contentDir = path.join(process.cwd(), 'content');
      const [indexContent, keywordsContent] = await Promise.all([
        fs.readFile(path.join(contentDir, 'blog-index.json'), 'utf8'),
        fs.readFile(path.join(contentDir, 'keywords.json'), 'utf8'),
      ]);
      await commitFiles(
        [
          { path: `content/blog/${slug}.md`, content: null },
          { path: 'content/blog-index.json', content: indexContent },
          { path: 'content/keywords.json', content: keywordsContent },
        ],
        `Delete blog post: ${post?.title || slug}`
      );
      successMessage = '記事を削除し、GitHubにコミットしました';
    } catch (githubError) {
      console.error('GitHub commit failed:', githubError);
      successMessage = '記事を削除しました（GitHubコミット失敗、手動でpushしてください）';
    }

    return NextResponse.json({ 
      success: true,
      message: successMessage
    });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
