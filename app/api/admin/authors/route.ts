import { NextRequest, NextResponse } from 'next/server';
import { getAuthors } from '@/lib/blog';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const authors = await getAuthors();
    return NextResponse.json({ success: true, authors });
  } catch (error) {
    console.error('Failed to fetch authors:', error);
    return errorResponse('Failed to fetch authors');
  }
}
