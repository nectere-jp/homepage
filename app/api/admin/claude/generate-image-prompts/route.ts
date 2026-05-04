import { NextRequest, NextResponse } from 'next/server';
import { generateArticleImagePrompts } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';
import type { ClusterAxis } from '@/lib/blog';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { topic, clusterAxis, bodyPlaceholders, content } = await request.json();
    if (!topic || typeof topic !== 'string') {
      return errorResponse('topic is required', 400);
    }
    const result = await generateArticleImagePrompts({
      topic,
      clusterAxis: clusterAxis as ClusterAxis | undefined,
      bodyPlaceholders: Array.isArray(bodyPlaceholders) ? bodyPlaceholders : [],
      content: typeof content === 'string' ? content : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate image prompts:', error);
    return errorResponse('Failed to generate image prompts');
  }
}
