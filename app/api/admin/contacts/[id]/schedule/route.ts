import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { updateContactStatus, updateContactSchedule } from '@/lib/firebase/admin';
import { bookSlot } from '@/lib/schedule';
import { sendScheduleConfirmEmail, sendScheduleRescheduleEmail } from '@/lib/email';

/**
 * POST /api/admin/contacts/[id]/schedule
 *
 * action: 'confirm' — 日時を確定し、ユーザーに通知メール送信
 * action: 'reschedule' — 別日時を問い合わせるメール送信
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id: contactId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'confirm') {
      const { staffId, staffName, date, startTime, endTime, dateDisplay, userName, userEmail } = body;

      if (!staffId || !date || !startTime || !userName || !userEmail) {
        return errorResponse('Required fields missing', 400);
      }

      // Book the slot
      const booked = await bookSlot(staffId, date, startTime, userName);
      if (!booked) {
        return errorResponse('この枠は既に予約済みか、登録されていません。日程管理ページで空き状況を確認してください。', 409);
      }

      // Send confirmation email to user
      await sendScheduleConfirmEmail({
        userName,
        userEmail,
        staffName: staffName || '',
        date: dateDisplay || date,
        time: `${startTime}-${endTime || ''}`,
      });

      // Update contact status + save confirmed schedule info
      await updateContactStatus(contactId, 'in_progress');
      await updateContactSchedule(contactId, {
        confirmedSchedule: {
          staffId,
          staffName: staffName || '',
          date,
          startTime,
          endTime: endTime || '',
          confirmedAt: new Date().toISOString(),
        },
      });

      return successResponse({ success: true, message: '日時を確定し、通知メールを送信しました。' });

    } else if (action === 'reschedule') {
      const { userName, userEmail, message } = body;

      if (!userEmail || !userName || !message) {
        return errorResponse('Required fields missing', 400);
      }

      await sendScheduleRescheduleEmail({ userName, userEmail, message });
      await updateContactStatus(contactId, 'in_progress');
      await updateContactSchedule(contactId, {
        rescheduleSentAt: new Date().toISOString(),
      });

      return successResponse({ success: true, message: '日程再調整のメールを送信しました。' });

    } else {
      return errorResponse('Invalid action. Use "confirm" or "reschedule".', 400);
    }
  } catch (error) {
    console.error('Failed to process schedule action:', error);
    return errorResponse('処理に失敗しました');
  }
}
