import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface RefCode {
  id: string;
  code: string;
  label: string;
  targetPath: string;
  createdAt: string;
}

/** 4文字の英数字コードを生成 (紛らわしい文字を除外) */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET: 一覧取得
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection('refCodes')
    .orderBy('createdAt', 'desc')
    .get();

  const codes: RefCode[] = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      code: d.code,
      label: d.label,
      targetPath: d.targetPath,
      createdAt: d.createdAt?.toDate?.()?.toISOString() || '',
    };
  });

  return NextResponse.json({ codes });
}

const createSchema = z.object({
  label: z.string().min(1).max(100),
  targetPath: z.string().min(1).max(200),
});

// POST: 新規作成
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { label, targetPath } = createSchema.parse(body);

  const { firestore } = getFirebaseAdmin();

  // ユニークなコードを生成 (衝突チェック)
  let code = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    code = generateCode();
    const existing = await firestore
      .collection('refCodes')
      .where('code', '==', code)
      .limit(1)
      .get();
    if (existing.empty) break;
  }

  const docRef = await firestore.collection('refCodes').add({
    code,
    label,
    targetPath,
    createdAt: Timestamp.now(),
  });

  return NextResponse.json({
    id: docRef.id,
    code,
    label,
    targetPath,
  });
}

const deleteSchema = z.object({
  id: z.string().min(1),
});

// DELETE: 削除
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { id } = deleteSchema.parse(body);

  const { firestore } = getFirebaseAdmin();
  await firestore.collection('refCodes').doc(id).delete();

  return NextResponse.json({ ok: true });
}
