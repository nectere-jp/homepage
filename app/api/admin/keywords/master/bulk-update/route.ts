import { NextResponse } from 'next/server';
import {
  loadKeywordDatabase,
  saveKeywordDatabase,
  getGroupByIdOrVariant,
  type KeywordTier,
  type WorkflowFlag,
  type KeywordVariant,
} from '@/lib/keyword-manager';

type BulkUpdateItem = {
  keyword: string; // groupId or variant keyword
  estimatedPv?: number;
  expectedRank?: number | null;
  cvr?: number | null;
  relatedTags?: string[];
  workflowFlag?: WorkflowFlag;
  keywordTier?: KeywordTier;
  parentId?: string | null;
  orderInGroup?: number;
};

/**
 * POST /api/admin/keywords/master/bulk-update
 * 複数キーワードグループを一括更新（V4）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body as { updates: BulkUpdateItem[] };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates must be a non-empty array' },
        { status: 400 }
      );
    }

    const db = await loadKeywordDatabase();
    for (const item of updates) {
      const group = await getGroupByIdOrVariant(item.keyword);
      if (!group) continue;
      const g = db.keywordGroups[group.id];
      if (!g) continue;

      const groupPatch: Partial<typeof g> = {};
      if (item.relatedTags !== undefined) groupPatch.relatedTags = item.relatedTags;
      if (item.workflowFlag !== undefined) groupPatch.workflowFlag = item.workflowFlag;
      if (item.keywordTier !== undefined) groupPatch.tier = item.keywordTier;
      if (item.parentId !== undefined) {
        if (item.parentId == null || item.parentId === '') {
          groupPatch.parentId = null;
        } else {
          if (!db.keywordGroups[item.parentId]) {
            return NextResponse.json(
              { error: `親グループ "${item.parentId}" が見つかりません` },
              { status: 400 }
            );
          }
          groupPatch.parentId = String(item.parentId);
        }
      }

      const variantIndex = item.keyword === group.id
        ? 0
        : g.variants.findIndex((v) => v.keyword === item.keyword);

      // variant が見つからない場合はグループレベルの変更のみ適用し variant は更新しない
      const vi = variantIndex >= 0 ? variantIndex : -1;

      const variantPatch: Partial<KeywordVariant> = {};
      if (item.estimatedPv !== undefined) variantPatch.estimatedPv = Number(item.estimatedPv);
      if (item.expectedRank !== undefined) variantPatch.expectedRank = item.expectedRank == null ? null : Number(item.expectedRank);
      if (item.cvr !== undefined) variantPatch.cvr = item.cvr == null ? null : Number(item.cvr);
      if (item.orderInGroup !== undefined) variantPatch.orderInGroup = item.orderInGroup;

      Object.assign(g, groupPatch);
      if (vi >= 0 && g.variants[vi] && Object.keys(variantPatch).length > 0) {
        g.variants[vi] = { ...g.variants[vi], ...variantPatch };
      }
      g.updatedAt = new Date().toISOString();
    }

    await saveKeywordDatabase(db);

    return NextResponse.json({
      success: true,
      message: `${updates.length}件のキーワードを更新しました`,
    });
  } catch (error) {
    console.error('Failed to bulk-update keywords:', error);
    return NextResponse.json(
      { error: 'Failed to bulk-update keywords' },
      { status: 500 }
    );
  }
}
