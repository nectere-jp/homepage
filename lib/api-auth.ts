import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, isAdmin } from '@/lib/firebase/admin';

/**
 * Admin API 用の認証チェック。
 * 未認証・権限不足の場合は 401/403 レスポンスを返す。
 * 認証 OK の場合は null を返す。
 *
 * 使い方:
 *   const authError = await requireAdmin(request);
 *   if (authError) return authError;
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const uid = await verifyIdToken(token);

  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
