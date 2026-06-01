import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { bookSlot, unbookSlot } from '@/lib/schedule';

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { staffId, date, startTime, bookedBy, memo } = body;

    if (!staffId || !date || !startTime || !bookedBy) {
      return errorResponse('staffId, date, startTime, bookedBy are required', 400);
    }

    const success = await bookSlot(staffId, date, startTime, bookedBy, memo);
    if (!success) {
      return errorResponse('Slot not found or already booked', 409);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Failed to book slot:', error);
    return errorResponse('Failed to book slot');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = request.nextUrl;
    const staffId = searchParams.get('staffId');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');

    if (!staffId || !date || !startTime) {
      return errorResponse('staffId, date, startTime are required', 400);
    }

    const success = await unbookSlot(staffId, date, startTime);
    if (!success) {
      return errorResponse('Slot not found or not booked', 409);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Failed to unbook slot:', error);
    return errorResponse('Failed to unbook slot');
  }
}
