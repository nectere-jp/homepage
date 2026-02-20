import { NextResponse } from 'next/server';
import {
  getGroupByIdOrVariant,
  loadKeywordDatabase,
  saveKeywordDatabase,
} from '@/lib/keyword-manager';
import type { KeywordGroupData } from '@/lib/keyword-manager';

function generateGroupId(): string {
  return `kw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * POST /api/admin/keywords/master/[keyword]/detach
 * 指定キーワード（バリアント）を同趣旨グループから切り離し、単独の新規グループにする。
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const group = await getGroupByIdOrVariant(keyword);
    if (!group) {
      return NextResponse.json(
        { error: 'キーワードが見つかりません' },
        { status: 404 }
      );
    }
    if (group.variants.length < 2) {
      return NextResponse.json(
        { error: '同趣旨に他キーワードがありません。切り離せません。' },
        { status: 400 }
      );
    }
    const variant = group.variants.find((v) => v.keyword === keyword);
    if (!variant) {
      return NextResponse.json(
        { error: 'このキーワードはこのグループに含まれていません' },
        { status: 400 }
      );
    }
    const remainingVariants = group.variants.filter((v) => v.keyword !== keyword);
    const now = new Date().toISOString();
    const newId = generateGroupId();
    const newGroup: KeywordGroupData = {
      id: newId,
      tier: group.tier,
      parentId: group.parentId,
      relatedBusiness: group.relatedBusiness ?? [],
      relatedTags: group.relatedTags ?? [],
      assignedArticles: [], // 切り離したキーワードは記事紐づけを引き継がない
      priority: group.priority,
      status: group.status,
      workflowFlag: group.workflowFlag,
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
    return NextResponse.json(
      { error: '切り離しに失敗しました' },
      { status: 500 }
    );
  }
}
