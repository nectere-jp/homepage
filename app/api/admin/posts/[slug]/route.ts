import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs/promises';
import { getPostBySlug, savePost, deletePost, writeBlogIndex } from '@/lib/blog';
import { updateKeywordDatabase } from '@/lib/keyword-manager';
import { commitFile, commitFiles, deleteFile } from '@/lib/github';

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

    // GitHubにコミット
    let successMessage = '記事を更新しました';
    try {
      if (slugChanged) {
        // 古いファイルを削除
        const oldFilePath = `content/blog/${originalSlug}.md`;
        await deleteFile(
          oldFilePath,
          `Remove old slug: ${originalSlug}`
        );
        
        // 新しいファイルを追加
        const newFilePath = `content/blog/${targetSlug}.md`;
        const fileContent = matter.stringify(content, frontmatter);
        await commitFile(
          newFilePath,
          fileContent,
          `Rename blog post slug: ${originalSlug} -> ${targetSlug}`
        );
        successMessage = '記事を更新し、スラッグを変更しました';
      } else {
        const filePath = `content/blog/${originalSlug}.md`;
        const fileContent = matter.stringify(content, frontmatter);
        await commitFile(
          filePath,
          fileContent,
          `Update blog post: ${frontmatter.title}`
        );
        successMessage = '記事を更新し、GitHubにコミットしました';
      }
    } catch (githubError) {
      console.error('GitHub commit failed:', githubError);
      successMessage = '記事を保存しました（GitHubコミット失敗、手動でpushしてください）';
    }

    // ブログ一覧インデックスを先に更新（updateKeywordDatabase が getAllPosts → blog-index を参照するため）
    try {
      await writeBlogIndex();
    } catch (indexError) {
      console.error('Failed to update blog-index.json:', indexError);
    }

    // キーワードデータベースを更新（assignedArticles / usageTracking を記事一覧に合わせる）
    await updateKeywordDatabase();

    // blog-index.json と keywords.json を 1 コミットで GitHub に反映
    try {
      const contentDir = path.join(process.cwd(), 'content');
      const [indexContent, keywordsContent] = await Promise.all([
        fs.readFile(path.join(contentDir, 'blog-index.json'), 'utf8'),
        fs.readFile(path.join(contentDir, 'keywords.json'), 'utf8'),
      ]);
      await commitFiles(
        [
          { path: 'content/blog-index.json', content: indexContent },
          { path: 'content/keywords.json', content: keywordsContent },
        ],
        'Update blog index and keywords'
      );
    } catch (indexCommitError) {
      console.error('Failed to commit blog-index.json or keywords.json:', indexCommitError);
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

    // ブログ一覧インデックスを先に更新（updateKeywordDatabase が getAllPosts → blog-index を参照するため）
    try {
      await writeBlogIndex();
    } catch (indexError) {
      console.error('Failed to update blog-index.json:', indexError);
    }

    // GitHubから削除
    let successMessage = '記事を削除しました';
    try {
      const filePath = `content/blog/${slug}.md`;
      await deleteFile(
        filePath,
        `Delete blog post: ${post?.title || slug}`
      );
      successMessage = '記事を削除し、GitHubにコミットしました';
    } catch (githubError) {
      console.error('GitHub delete failed:', githubError);
      successMessage = '記事を削除しました（GitHubコミット失敗、手動でpushしてください）';
    }

    // キーワードデータベースを更新（assignedArticles / usageTracking から削除記事を除外）
    await updateKeywordDatabase();

    // blog-index.json と keywords.json を 1 コミットで GitHub に反映
    try {
      const contentDir = path.join(process.cwd(), 'content');
      const [indexContent, keywordsContent] = await Promise.all([
        fs.readFile(path.join(contentDir, 'blog-index.json'), 'utf8'),
        fs.readFile(path.join(contentDir, 'keywords.json'), 'utf8'),
      ]);
      await commitFiles(
        [
          { path: 'content/blog-index.json', content: indexContent },
          { path: 'content/keywords.json', content: keywordsContent },
        ],
        'Update blog index and keywords'
      );
    } catch (indexCommitError) {
      console.error('Failed to commit blog-index.json or keywords.json:', indexCommitError);
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
