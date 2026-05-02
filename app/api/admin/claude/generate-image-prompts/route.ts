import { NextRequest, NextResponse } from 'next/server';
import { generateArticleImagePrompts } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';
import type { ClusterAxis } from '@/lib/blog';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { topic, clusterAxis, bodyPlaceholders } = await request.json();
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }
    const result = await generateArticleImagePrompts({
      topic,
      clusterAxis: clusterAxis as ClusterAxis | undefined,
      bodyPlaceholders: Array.isArray(bodyPlaceholders) ? bodyPlaceholders : [],
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate image prompts:', error);
    return NextResponse.json({ error: 'Failed to generate image prompts' }, { status: 500 });
  }
}
