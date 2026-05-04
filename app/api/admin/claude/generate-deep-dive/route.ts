import { NextRequest, NextResponse } from 'next/server';
import { generateSearchIntentDeepDive } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

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
      return errorResponse('Topic and mainKeyword are required', 400);
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
    return errorResponse('Failed to generate deep dive');
  }
}
