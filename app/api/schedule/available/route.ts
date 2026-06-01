import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getPublicAvailableSlots } from '@/lib/schedule';

export async function GET(request: NextRequest) {
  try {
    const days = parseInt(request.nextUrl.searchParams.get('days') || '14', 10);
    const slots = await getPublicAvailableSlots(Math.min(days, 30));
    return successResponse({ slots });
  } catch (error) {
    console.error('Failed to fetch available slots:', error);
    return errorResponse('Failed to fetch available slots');
  }
}
