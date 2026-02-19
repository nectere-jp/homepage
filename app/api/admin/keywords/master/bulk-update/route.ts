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
      if (item.parentId !== undefined) groupPatch.parentId = item.parentId == null || item.parentId === '' ? null : String(item.parentId);

      const variantIndex = item.keyword === group.id
        ? 0
        : g.variants.findIndex((v) => v.keyword === item.keyword);
      const vi = variantIndex >= 0 ? variantIndex : 0;
      const variantPatch: Partial<KeywordVariant> = {};
      if (item.estimatedPv !== undefined) variantPatch.estimatedPv = Number(item.estimatedPv);
      if (item.expectedRank !== undefined) variantPatch.expectedRank = item.expectedRank == null ? null : Number(item.expectedRank);
      if (item.cvr !== undefined) variantPatch.cvr = item.cvr == null ? null : Number(item.cvr);

      Object.assign(g, groupPatch);
      if (g.variants[vi] && Object.keys(variantPatch).length > 0) {
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
