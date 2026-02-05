import { NextRequest, NextResponse } from 'next/server';
import { generateArticleIdeas } from '@/lib/claude';
import { getAllPosts } from '@/lib/blog';

export async function POST(request: NextRequest) {
  try {
    const { unusedKeywords } = await request.json();

    if (!unusedKeywords || !Array.isArray(unusedKeywords)) {
      return NextResponse.json(
        { error: 'Unused keywords are required' },
        { status: 400 }
      );
    }

    // 既存記事のトピックを取得
    const posts = await getAllPosts();
    const existingTopics = posts.map(p => p.title);

    const ideas = await generateArticleIdeas(unusedKeywords, existingTopics);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Failed to generate article ideas:', error);
    return NextResponse.json(
      { error: 'Failed to generate article ideas' },
      { status: 500 }
    );
  }
}
