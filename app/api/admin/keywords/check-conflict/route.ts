import { NextRequest, NextResponse } from 'next/server';
import {
  checkKeywordConflicts,
  checkSameIntentConflicts,
  getDisplayLabelForPrimaryKeyword,
} from '@/lib/keyword-manager';

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json();

    if (!Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Keywords must be an array' },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: 'Failed to check keyword conflicts' },
      { status: 500 }
    );
  }
}
