import { NextRequest, NextResponse } from 'next/server';
import { loadKeywordGroups } from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

/**
 * GET /api/admin/keywords/intent-groups
 * グループ一覧を取得（V4: 各グループの variant キーワード一覧）
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const keywordGroups = await loadKeywordGroups();
    const groups = Object.entries(keywordGroups).map(([id, g]) => ({
      id,
      keywords: g.variants.map((v) => v.keyword),
    }));

    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('Failed to fetch same-intent groups:', error);
    return errorResponse('Failed to fetch same-intent groups');
  }
}
