import { NextRequest } from 'next/server';
import { getContactInquiries } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'new' | 'in_progress' | 'resolved' | null;
    const inquiryType = searchParams.get('inquiryType');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const contacts = await getContactInquiries({
      status: status || undefined,
      inquiryType: inquiryType || undefined,
      limit,
      offset,
    });

    return successResponse({ contacts });
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return errorResponse('Failed to fetch contacts');
  }
}
