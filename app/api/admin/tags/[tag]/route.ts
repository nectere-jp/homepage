import { NextResponse } from 'next/server';
import {
  getTagMaster,
  updateTagMaster,
  deleteTagMaster,
  type TagMasterData,
} from '@/lib/keyword-manager';
import { getAllPosts } from '@/lib/blog';

/**
 * PUT /api/admin/tags/[tag]
 * タグ情報を更新
 */
export async function PUT(
  request: Request,
  props: { params: Promise<{ tag: string }> }
) {
  try {
    const params = await props.params;
    const tag = decodeURIComponent(params.tag);
    const body = await request.json();
    const { displayName, description, targetKeywords } = body;

    // 既存のタグをチェック
    const existing = await getTagMaster();
    if (!existing[tag]) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // タグ情報を更新
    const updateData: Partial<TagMasterData> = {};
    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (targetKeywords !== undefined) {
      updateData.targetKeywords = targetKeywords;
    }

    await updateTagMaster(tag, updateData);

    return NextResponse.json({
      success: true,
      message: 'Tag updated successfully',
      tag,
    });
  } catch (error) {
    console.error('Failed to update tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tags/[tag]
 * タグを削除
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ tag: string }> }
) {
  try {
    const params = await props.params;
    const tag = decodeURIComponent(params.tag);

    // 既存のタグをチェック
    const existing = await getTagMaster();
    if (!existing[tag]) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 使用状況をチェック
    const posts = await getAllPosts(undefined, { includeDrafts: true });
    const usedInArticles = posts.filter((post) => post.tags.includes(tag));

    if (usedInArticles.length > 0) {
      return NextResponse.json(
        {
          error: 'Tag is in use',
          message: `このタグは${usedInArticles.length}件の記事で使用されています。削除する前に記事からタグを削除してください。`,
          usedInArticles: usedInArticles.map((post) => ({
            slug: post.slug,
            title: post.title,
          })),
        },
        { status: 409 }
      );
    }

    // タグを削除
    await deleteTagMaster(tag);

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
      tag,
    });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
