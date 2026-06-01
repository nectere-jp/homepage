import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getSlotsForRange, setSlotsForDate } from '@/lib/schedule';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = request.nextUrl;
    const staffId = searchParams.get('staffId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!staffId || !startDate || !endDate) {
      return errorResponse('staffId, startDate, endDate are required', 400);
    }

    const slots = await getSlotsForRange(staffId, startDate, endDate);
    return successResponse({ slots });
  } catch (error) {
    console.error('Failed to fetch slots:', error);
    return errorResponse('Failed to fetch slots');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { staffId, staffName, date, startTimes } = body;

    if (!staffId || !staffName || !date || !Array.isArray(startTimes)) {
      return errorResponse('staffId, staffName, date, startTimes[] are required', 400);
    }

    await setSlotsForDate(staffId, staffName, date, startTimes);
    return successResponse({ success: true });
  } catch (error) {
    console.error('Failed to save slots:', error);
    return errorResponse('Failed to save slots');
  }
}
