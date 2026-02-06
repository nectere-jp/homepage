import { NextRequest, NextResponse } from 'next/server';
import { getContactInquiries } from '@/lib/firebase/admin';
import { verifyIdToken, isAdmin } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const uid = await verifyIdToken(token);
    
    if (!uid || !(await isAdmin(uid))) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'new' | 'in_progress' | 'resolved' | null;
    const inquiryType = searchParams.get('inquiryType');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // お問い合わせ一覧を取得
    const contacts = await getContactInquiries({
      status: status || undefined,
      inquiryType: inquiryType || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
