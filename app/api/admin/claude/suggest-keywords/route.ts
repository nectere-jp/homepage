import { NextRequest, NextResponse } from 'next/server';
import { suggestKeywords } from '@/lib/claude';
import { checkKeywordConflicts } from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { topic, context } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Claude APIでキーワードを提案
    const suggestion = await suggestKeywords(topic, context);

    // キーワードの競合をチェック
    const allKeywords = [
      suggestion.primaryKeyword,
      ...suggestion.secondaryKeywords,
    ];
    const conflicts = await checkKeywordConflicts(allKeywords);

    return NextResponse.json({
      suggestion,
      conflicts,
    });
  } catch (error) {
    console.error('Failed to suggest keywords:', error);
    return NextResponse.json(
      { error: 'Failed to suggest keywords' },
      { status: 500 }
    );
  }
}
