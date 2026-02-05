import { NextRequest, NextResponse } from 'next/server';
import { suggestKeywords } from '@/lib/claude';
import { checkKeywordConflicts } from '@/lib/keyword-manager';

export async function POST(request: NextRequest) {
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
