import { NextRequest } from 'next/server';
import { getContactInquiry, updateContactStatus } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const contact = await getContactInquiry(id);

    if (!contact) {
      return errorResponse('Contact not found', 404);
    }

    return successResponse({ contact });
  } catch (error) {
    console.error('Failed to fetch contact:', error);
    return errorResponse('Failed to fetch contact');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    await updateContactStatus(id, status);
    const contact = await getContactInquiry(id);

    return successResponse({ contact });
  } catch (error) {
    console.error('Failed to update contact:', error);

    if (error instanceof z.ZodError) {
      return errorResponse('Invalid request', 400);
    }

    return errorResponse('Failed to update contact');
  }
}
