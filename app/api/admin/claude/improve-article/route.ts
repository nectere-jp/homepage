import { NextRequest, NextResponse } from 'next/server';
import { improveArticle } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { content, improvements } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'content is required and must be a string' },
        { status: 400 }
      );
    }

    if (!improvements || !Array.isArray(improvements)) {
      return NextResponse.json(
        { error: 'improvements is required and must be an array of strings' },
        { status: 400 }
      );
    }

    const filtered = improvements
      .map((s: unknown) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);

    if (filtered.length === 0) {
      return NextResponse.json(
        { error: 'At least one improvement point is required' },
        { status: 400 }
      );
    }

    const improved = await improveArticle(content, filtered);
    return NextResponse.json({ content: improved });
  } catch (error) {
    console.error('Failed to improve article:', error);
    return NextResponse.json(
      { error: 'Failed to improve article' },
      { status: 500 }
    );
  }
}
