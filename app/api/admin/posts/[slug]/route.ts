import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import { getPostBySlug, savePost, deletePost } from '@/lib/blog';
import { updateKeywordDatabase } from '@/lib/keyword-manager';
import { commitFile, deleteFile } from '@/lib/github';

// 記事取得
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await getPostBySlug(params.slug);

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
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { content, ...frontmatter } = body;

    await savePost(params.slug, frontmatter, content);

    // GitHubにコミット
    let successMessage = '記事を更新しました';
    try {
      const filePath = `content/blog/${params.slug}.md`;
      const fileContent = matter.stringify(content, frontmatter);
      await commitFile(
        filePath,
        fileContent,
        `Update blog post: ${frontmatter.title}`
      );
      successMessage = '記事を更新し、GitHubにコミットしました';
    } catch (githubError) {
      console.error('GitHub commit failed:', githubError);
      successMessage = '記事を保存しました（GitHubコミット失敗、手動でpushしてください）';
    }

    // キーワードデータベースを更新
    await updateKeywordDatabase();

    return NextResponse.json({ 
      success: true,
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
  { params }: { params: { slug: string } }
) {
  try {
    // 記事情報を取得（タイトル用）
    const post = await getPostBySlug(params.slug);

    await deletePost(params.slug);

    // GitHubから削除
    let successMessage = '記事を削除しました';
    try {
      const filePath = `content/blog/${params.slug}.md`;
      await deleteFile(
        filePath,
        `Delete blog post: ${post?.title || params.slug}`
      );
      successMessage = '記事を削除し、GitHubにコミットしました';
    } catch (githubError) {
      console.error('GitHub delete failed:', githubError);
      successMessage = '記事を削除しました（GitHubコミット失敗、手動でpushしてください）';
    }

    // キーワードデータベースを更新
    await updateKeywordDatabase();

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
