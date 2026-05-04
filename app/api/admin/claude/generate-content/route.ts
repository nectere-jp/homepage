import { NextRequest, NextResponse } from 'next/server';
import { generateFullArticle } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const {
      topic,
      keywords,
      outline,
      clusterAxis,
      articleRole,
      targetReader,
      volume,
      hubSlug,
      mainKeywordVariants,
      avoidKeywords,
      coOccurrenceWords,
    } = await request.json();

    if (!topic || !keywords || !outline) {
      return errorResponse('Topic, keywords, and outline are required', 400);
    }

    const content = await generateFullArticle(topic, keywords, outline, {
      clusterAxis: clusterAxis || undefined,
      articleRole: articleRole || undefined,
      targetReader: targetReader || undefined,
      volume: volume || undefined,
      hubSlug: hubSlug || undefined,
      mainKeywordVariants: Array.isArray(mainKeywordVariants) ? mainKeywordVariants : undefined,
      avoidKeywords: Array.isArray(avoidKeywords) ? avoidKeywords : undefined,
      coOccurrenceWords: Array.isArray(coOccurrenceWords) ? coOccurrenceWords : undefined,
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to generate content:', error);
    return errorResponse('Failed to generate content');
  }
}
