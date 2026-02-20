import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const {
      topic,
      keywords,
      targetLength,
      pillarSlug,
      isPillar,
      mainKeywordVariants,
      avoidKeywords,
      coOccurrenceWords,
      deepDiveText,
      userFeedbackOnDeepDive,
    } = await request.json();

    if (!topic || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Topic and keywords are required' },
        { status: 400 }
      );
    }

    const outline = await generateOutline(topic, keywords, targetLength, {
      pillarSlug: pillarSlug || undefined,
      isPillar: !!isPillar,
      mainKeywordVariants: Array.isArray(mainKeywordVariants) ? mainKeywordVariants : undefined,
      avoidKeywords: Array.isArray(avoidKeywords) ? avoidKeywords : undefined,
      coOccurrenceWords: Array.isArray(coOccurrenceWords) ? coOccurrenceWords : undefined,
      deepDiveText: deepDiveText || undefined,
      userFeedbackOnDeepDive: userFeedbackOnDeepDive || undefined,
    });

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Failed to generate outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}
