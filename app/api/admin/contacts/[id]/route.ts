import { NextRequest, NextResponse } from 'next/server';
import { getContactInquiry, updateContactStatus } from '@/lib/firebase/admin';
import { verifyIdToken, isAdmin } from '@/lib/firebase/admin';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // paramsを展開
    const { id } = await params;

    // お問い合わせを取得
    const contact = await getContactInquiry(id);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Failed to fetch contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // paramsを展開
    const { id } = await params;

    // リクエストボディの検証
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    // ステータス更新
    await updateContactStatus(id, status);

    // 更新後のデータを取得
    const contact = await getContactInquiry(id);

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Failed to update contact:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}
