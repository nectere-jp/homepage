import { NextResponse } from 'next/server';
import {
  getGroupByIdOrVariant,
  saveKeywordGroup,
  deleteKeywordGroup,
  type KeywordGroupData,
} from '@/lib/keyword-manager';
import { getAllPosts } from '@/lib/blog';
import type { BlogPostMetadata } from '@/lib/blog';

/**
 * GET /api/admin/keywords/master/[keyword]
 * グループを取得（[keyword] = グループID または variant キーワード）。関連記事メタデータ含む。
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const group = await getGroupByIdOrVariant(keyword);

    if (!group) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    let assignedArticlesDetail: BlogPostMetadata[] = [];
    if (group.assignedArticles?.length) {
      const allPosts = await getAllPosts(undefined, { includeDrafts: true });
      const slugSet = new Set(group.assignedArticles);
      assignedArticlesDetail = allPosts.filter((p) => slugSet.has(p.slug));
      assignedArticlesDetail.sort(
        (a, b) =>
          group.assignedArticles!.indexOf(a.slug) -
          group.assignedArticles!.indexOf(b.slug)
      );
    }

    return NextResponse.json({
      success: true,
      groupId: group.id,
      keyword: group.variants[0]?.keyword ?? group.id,
      data: {
        ...group,
        assignedArticlesDetail,
      },
    });
  } catch (error) {
    console.error('Failed to fetch keyword:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keyword' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/keywords/master/[keyword]
 * グループを更新（[keyword] = グループID または variant キーワード）
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const group = await getGroupByIdOrVariant(keyword);
    if (!group) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    await saveKeywordGroup(group.id, body as Partial<KeywordGroupData>);

    return NextResponse.json({
      success: true,
      message: 'Keyword updated successfully',
      groupId: group.id,
    });
  } catch (error) {
    console.error('Failed to update keyword:', error);
    return NextResponse.json(
      { error: 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/keywords/master/[keyword]
 * グループを削除（[keyword] = グループID または variant キーワード）
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const group = await getGroupByIdOrVariant(keyword);
    if (!group) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    await deleteKeywordGroup(group.id);

    return NextResponse.json({
      success: true,
      message: 'Keyword deleted successfully',
      groupId: group.id,
    });
  } catch (error) {
    console.error('Failed to delete keyword:', error);
    return NextResponse.json(
      { error: 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}
