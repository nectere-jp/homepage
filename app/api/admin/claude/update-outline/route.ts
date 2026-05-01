import { NextRequest, NextResponse } from 'next/server';
import { updateOutline } from '@/lib/claude';
import type { ContentOutline } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { outline, revisionRequest, keywords, clusterAxis, articleRole, targetReader, volume, hubSlug } = await request.json();

    if (!outline || !revisionRequest || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Outline, revisionRequest, and keywords are required' },
        { status: 400 }
      );
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
      }
    );

    return NextResponse.json({ outline: updatedOutline });
  } catch (error) {
    console.error('Failed to update outline:', error);
    return NextResponse.json(
      { error: 'Failed to update outline' },
      { status: 500 }
    );
  }
}
