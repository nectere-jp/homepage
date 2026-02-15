import { NextRequest, NextResponse } from 'next/server';
import { generateFullArticle } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { topic, keywords, outline, pillarSlug } = await request.json();

    if (!topic || !keywords || !outline) {
      return NextResponse.json(
        { error: 'Topic, keywords, and outline are required' },
        { status: 400 }
      );
    }

    const content = await generateFullArticle(topic, keywords, outline, {
      pillarSlug: pillarSlug || undefined,
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
