import { NextRequest, NextResponse } from 'next/server';
import { improveArticle } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { content, improvements } = body;

    if (!content || typeof content !== 'string') {
      return errorResponse('content is required and must be a string', 400);
    }

    if (!improvements || !Array.isArray(improvements)) {
      return errorResponse('improvements is required and must be an array of strings', 400);
    }

    const filtered = improvements
      .map((s: unknown) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);

    if (filtered.length === 0) {
      return errorResponse('At least one improvement point is required', 400);
    }

    const { clusterAxis, articleRole, targetReader } = body;
    const improved = await improveArticle(content, filtered, {
      clusterAxis: clusterAxis || undefined,
      articleRole: articleRole || undefined,
      targetReader: targetReader || undefined,
    });
    return NextResponse.json({ content: improved });
  } catch (error) {
    console.error('Failed to improve article:', error);
    return errorResponse('Failed to improve article');
  }
}
