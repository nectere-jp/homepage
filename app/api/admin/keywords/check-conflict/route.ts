import { NextRequest, NextResponse } from 'next/server';
import {
  checkKeywordConflicts,
  checkSameIntentConflicts,
  getDisplayLabelForPrimaryKeyword,
} from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { keywords } = await request.json();

    if (!Array.isArray(keywords)) {
      return errorResponse('Keywords must be an array', 400);
    }

    const [conflicts, sameIntentConflicts] = await Promise.all([
      checkKeywordConflicts(keywords),
      checkSameIntentConflicts(keywords),
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
    });
  } catch (error) {
    console.error('Failed to check keyword conflicts:', error);
    return errorResponse('Failed to check keyword conflicts');
  }
}
