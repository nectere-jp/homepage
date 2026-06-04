import { NextRequest, NextResponse } from 'next/server';
import {
  checkKeywordConflicts,
  checkSameIntentConflicts,
  checkCannibalizeRisk,
  getDisplayLabelForPrimaryKeyword,
} from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { keywords, hubSlug, excludeGroupId } = await request.json();

    if (!Array.isArray(keywords)) {
      return errorResponse('Keywords must be an array', 400);
    }

    const [conflicts, sameIntentConflicts, cannibalizeRisks] = await Promise.all([
      checkKeywordConflicts(keywords),
      checkSameIntentConflicts(keywords),
      checkCannibalizeRisk(keywords, hubSlug, excludeGroupId),
    ]);

    // groupId の場合は表示用ラベルを付与
    const conflictsWithLabel = await Promise.all(
      conflicts.map(async (c) => ({
        ...c,
        displayLabel: await getDisplayLabelForPrimaryKeyword(c.keyword),
      }))
    );

    return NextResponse.json({
      conflicts: conflictsWithLabel,
      sameIntentConflicts,
      intentGroupConflicts: sameIntentConflicts,
      cannibalizeRisks,
    });
  } catch (error) {
    console.error('Failed to check keyword conflicts:', error);
    return errorResponse('Failed to check keyword conflicts');
  }
}
