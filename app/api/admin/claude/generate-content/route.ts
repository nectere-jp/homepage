import { NextRequest, NextResponse } from 'next/server';
import { generateFullArticle } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const {
      topic,
      keywords,
      outline,
      pillarSlug,
      isPillar,
      mainKeywordVariants,
      avoidKeywords,
      coOccurrenceWords,
    } = await request.json();

    if (!topic || !keywords || !outline) {
      return NextResponse.json(
        { error: 'Topic, keywords, and outline are required' },
        { status: 400 }
      );
    }

    const content = await generateFullArticle(topic, keywords, outline, {
      pillarSlug: pillarSlug || undefined,
      isPillar: !!isPillar,
      mainKeywordVariants: Array.isArray(mainKeywordVariants) ? mainKeywordVariants : undefined,
      avoidKeywords: Array.isArray(avoidKeywords) ? avoidKeywords : undefined,
      coOccurrenceWords: Array.isArray(coOccurrenceWords) ? coOccurrenceWords : undefined,
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to generate content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
