import { NextRequest, NextResponse } from 'next/server';
import {
  getGroupByIdOrVariant,
  saveKeywordGroup,
  deleteKeywordGroup,
  type KeywordGroupData,
} from '@/lib/keyword-manager';
import { getAllPosts } from '@/lib/blog';
import type { BlogPostMetadata } from '@/lib/blog';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

/**
 * GET /api/admin/keywords/master/[keyword]
 * グループを取得（[keyword] = グループID または variant キーワード）。関連記事メタデータ含む。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ keyword: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const group = await getGroupByIdOrVariant(keyword);

    if (!group) {
      return errorResponse('Keyword not found', 404);
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
    return errorResponse('Failed to fetch keyword');
  }
}

/**
 * PUT /api/admin/keywords/master/[keyword]
 * グループを更新（[keyword] = グループID または variant キーワード）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ keyword: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const group = await getGroupByIdOrVariant(keyword);
    if (!group) {
      return errorResponse('Keyword not found', 404);
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
    return errorResponse('Failed to update keyword');
  }
}

/**
 * DELETE /api/admin/keywords/master/[keyword]
 * グループを削除（[keyword] = グループID または variant キーワード）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyword: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const group = await getGroupByIdOrVariant(keyword);
    if (!group) {
      return errorResponse('Keyword not found', 404);
    }

    await deleteKeywordGroup(group.id);

    return NextResponse.json({
      success: true,
      message: 'Keyword deleted successfully',
      groupId: group.id,
    });
  } catch (error) {
    console.error('Failed to delete keyword:', error);
    return errorResponse('Failed to delete keyword');
  }
}
