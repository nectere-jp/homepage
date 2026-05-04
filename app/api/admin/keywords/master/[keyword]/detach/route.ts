import { NextRequest, NextResponse } from 'next/server';
import {
  getGroupByIdOrVariant,
  loadKeywordDatabase,
  saveKeywordDatabase,
} from '@/lib/keyword-manager';
import type { KeywordGroupData } from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

function generateGroupId(): string {
  return `kw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * POST /api/admin/keywords/master/[keyword]/detach
 * 指定キーワード（バリアント）を同趣旨グループから切り離し、単独の新規グループにする。
 */
export async function POST(
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
      return errorResponse('キーワードが見つかりません', 404);
    }
    if (group.variants.length < 2) {
      return errorResponse('同趣旨に他キーワードがありません。切り離せません。', 400);
    }
    const variant = group.variants.find((v) => v.keyword === keyword);
    if (!variant) {
      return errorResponse('このキーワードはこのグループに含まれていません', 400);
    }
    const remainingVariants = group.variants.filter((v) => v.keyword !== keyword);
    const now = new Date().toISOString();
    const newId = generateGroupId();
    const newGroup: KeywordGroupData = {
      id: newId,
      clusterAxis: group.clusterAxis,
      articleRole: group.articleRole,
      articleStatus: group.articleStatus,
      hubArticleSlug: null,
      relatedBusiness: group.relatedBusiness ?? [],
      relatedTags: group.relatedTags ?? [],
      assignedArticles: [], // 切り離したキーワードは記事紐づけを引き継がない
      priority: group.priority,
      status: group.status,
      createdAt: now,
      updatedAt: now,
      variants: [{ ...variant }],
    };
    const db = await loadKeywordDatabase();
    db.keywordGroups[newId] = newGroup;
    db.keywordGroups[group.id] = {
      ...group,
      variants: remainingVariants,
      updatedAt: now,
    };
    await saveKeywordDatabase(db);
    return NextResponse.json({
      success: true,
      message: '同趣旨から切り離しました',
      groupId: newId,
      keyword,
    });
  } catch (error) {
    console.error('Failed to detach keyword:', error);
    return errorResponse('切り離しに失敗しました');
  }
}
