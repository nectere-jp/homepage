import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { topic, keywords, targetLength } = await request.json();

    if (!topic || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Topic and keywords are required' },
        { status: 400 }
      );
    }

    const outline = await generateOutline(topic, keywords, targetLength);

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Failed to generate outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}
