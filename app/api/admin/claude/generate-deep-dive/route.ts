import { NextRequest, NextResponse } from 'next/server';
import { generateSearchIntentDeepDive } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const {
      topic,
      mainKeyword,
      mainKeywordVariants,
      coOccurrenceWords,
    } = await request.json();

    if (!topic || !mainKeyword) {
      return NextResponse.json(
        { error: 'Topic and mainKeyword are required' },
        { status: 400 }
      );
    }

    const deepDiveText = await generateSearchIntentDeepDive(topic, mainKeyword, {
      mainKeywordVariants:
        Array.isArray(mainKeywordVariants) ? mainKeywordVariants : undefined,
      coOccurrenceWords:
        Array.isArray(coOccurrenceWords) ? coOccurrenceWords : undefined,
    });

    return NextResponse.json({ deepDiveText });
  } catch (error) {
    console.error('Failed to generate deep dive:', error);
    return NextResponse.json(
      { error: 'Failed to generate deep dive' },
      { status: 500 }
    );
  }
}
