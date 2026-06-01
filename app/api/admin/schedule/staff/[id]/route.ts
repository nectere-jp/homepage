import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { updateStaffMember } from '@/lib/schedule';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.email !== undefined) updates.email = body.email.trim();
    if (body.color !== undefined) updates.color = body.color;
    if (body.active !== undefined) updates.active = body.active;

    if (Object.keys(updates).length === 0) {
      return errorResponse('No fields to update', 400);
    }

    await updateStaffMember(id, updates);
    return successResponse({ success: true });
  } catch (error) {
    console.error('Failed to update staff:', error);
    return errorResponse('Failed to update staff');
  }
}
