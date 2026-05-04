import { NextRequest, NextResponse } from 'next/server';
import { updateOutline } from '@/lib/claude';
import type { ContentOutline } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { outline, revisionRequest, keywords, clusterAxis, articleRole, targetReader, volume, hubSlug, deepDiveText, userFeedbackOnDeepDive } = await request.json();

    if (!outline || !revisionRequest || !keywords || !Array.isArray(keywords)) {
      return errorResponse('Outline, revisionRequest, and keywords are required', 400);
    }

    const updatedOutline = await updateOutline(
      outline as ContentOutline,
      revisionRequest,
      keywords,
      {
        clusterAxis: clusterAxis || undefined,
        articleRole: articleRole || undefined,
        targetReader: targetReader || undefined,
        volume: volume || undefined,
        hubSlug: hubSlug || undefined,
        deepDiveText: deepDiveText || undefined,
        userFeedbackOnDeepDive: userFeedbackOnDeepDive || undefined,
      }
    );

    return NextResponse.json({ outline: updatedOutline });
  } catch (error) {
    console.error('Failed to update outline:', error);
    return errorResponse('Failed to update outline');
  }
}
