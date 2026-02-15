import { NextRequest, NextResponse } from 'next/server';
import {
  checkKeywordConflicts,
  checkIntentGroupConflicts,
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

    const [conflicts, intentGroupConflicts] = await Promise.all([
      checkKeywordConflicts(keywords),
      checkIntentGroupConflicts(keywords),
    ]);

    return NextResponse.json({
      conflicts,
      intentGroupConflicts,
    });
  } catch (error) {
    console.error('Failed to check keyword conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to check keyword conflicts' },
      { status: 500 }
    );
  }
}
