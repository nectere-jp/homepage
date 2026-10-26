import { NextResponse } from 'next/server';
import { isQuotaError } from '@/lib/analytics/events-cache';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * try/catch の catch 側から呼ぶ。Firestore の RESOURCE_EXHAUSTED (code 8) を
 * 検知した場合は 429 + 分かりやすいメッセージを返し、それ以外は fallbackMessage で 500。
 * これにより、管理画面側は status === 429 を見るだけでクォータ超過を扱える。
 */
export function errorResponseFromException(error: unknown, fallbackMessage: string) {
  if (isQuotaError(error)) {
    return NextResponse.json(
      {
        error:
          'Firestore の読み取りクォータに達しました。日次リセット（JST 9:00頃）までお待ちください。',
        quotaExceeded: true,
      },
      { status: 429 },
    );
  }
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
