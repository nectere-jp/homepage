import { NextRequest, NextResponse } from 'next/server';
import { generateImagePrompts } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';
import type { ClusterAxis, ArticleRole } from '@/lib/blog';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { topic, clusterAxis, articleRole, volume, sections } = await request.json();
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }
    const prompts = await generateImagePrompts({
      topic,
      clusterAxis: clusterAxis as ClusterAxis | undefined,
      articleRole: articleRole as ArticleRole | undefined,
      volume,
      sections: Array.isArray(sections) ? sections : [],
    });
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Failed to generate image prompts:', error);
    return NextResponse.json({ error: 'Failed to generate image prompts' }, { status: 500 });
  }
}
