import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { verifyIdToken, isAdmin } from '@/lib/firebase/admin';

/**
 * エージェント用トークンで読める API。数字の集計だけにする
 * （問い合わせ・申込みの個人情報や、チームのセッション詳細は含めない）
 */
const AGENT_ALLOWED_PATHS: RegExp[] = [
  /^\/api\/admin\/analytics\/?$/,
  /^\/api\/admin\/posts\/analytics\/?$/,
  /^\/api\/admin\/posts\/[^/]+\/analytics\/?$/,
  /^\/api\/admin\/teams\/analytics\/?$/,
  /^\/api\/admin\/teams\/cta-stats\/?$/,
  /^\/api\/admin\/gsc\/?$/,
];

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

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

  // 予約タスク（週次分析など）からの読み取り専用アクセス。
  // `Authorization: Bearer agent:<AGENT_REPORT_TOKEN>` で、GET だけを通す
  const agentToken = process.env.AGENT_REPORT_TOKEN;
  if (token.startsWith('agent:')) {
    if (
      agentToken &&
      agentToken.length >= 32 &&
      request.method === 'GET' &&
      AGENT_ALLOWED_PATHS.some((re) => re.test(request.nextUrl.pathname)) &&
      timingSafeEqualStr(token.slice(6), agentToken)
    ) {
      return null;
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const uid = await verifyIdToken(token);

  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
