import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const {
      topic,
      keywords,
      targetLength,
      clusterAxis,
      articleRole,
      targetReader,
      volume,
      hubSlug,
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
      clusterAxis: clusterAxis || undefined,
      articleRole: articleRole || undefined,
      targetReader: targetReader || undefined,
      volume: volume || undefined,
      hubSlug: hubSlug || undefined,
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
