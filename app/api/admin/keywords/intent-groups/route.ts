import { NextResponse } from 'next/server';
import { loadKeywordGroups } from '@/lib/keyword-manager';

/**
 * GET /api/admin/keywords/intent-groups
 * グループ一覧を取得（V4: 各グループの variant キーワード一覧）
 */
export async function GET() {
  try {
    const keywordGroups = await loadKeywordGroups();
    const groups = Object.entries(keywordGroups).map(([id, g]) => ({
      id,
      keywords: g.variants.map((v) => v.keyword),
    }));

    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('Failed to fetch same-intent groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch same-intent groups' },
      { status: 500 }
    );
  }
}
