import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getStaffMembers, createStaffMember, STAFF_COLORS } from '@/lib/schedule';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const activeOnly = request.nextUrl.searchParams.get('activeOnly') === 'true';
    const staff = await getStaffMembers(activeOnly);
    return successResponse({ staff });
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return errorResponse('Failed to fetch staff');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, email } = body;

    if (!name || typeof name !== 'string') {
      return errorResponse('name is required', 400);
    }

    // 色が未指定の場合、既存スタッフ数に基づいて自動割り当て
    let color = body.color;
    if (!color) {
      const existing = await getStaffMembers();
      color = STAFF_COLORS[existing.length % STAFF_COLORS.length];
    }

    const staff = await createStaffMember({
      name: name.trim(),
      email: (email || '').trim(),
      color,
    });

    return successResponse({ staff }, 201);
  } catch (error) {
    console.error('Failed to create staff:', error);
    return errorResponse('Failed to create staff');
  }
}
