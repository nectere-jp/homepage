import { NextRequest, NextResponse } from 'next/server';
import { updateOutline } from '@/lib/claude';
import type { ContentOutline } from '@/lib/claude';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { outline, revisionRequest, keywords } = await request.json();

    if (!outline || !revisionRequest || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Outline, revisionRequest, and keywords are required' },
        { status: 400 }
      );
    }

    const updatedOutline = await updateOutline(
      outline as ContentOutline,
      revisionRequest,
      keywords
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
