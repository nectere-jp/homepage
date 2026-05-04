import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';
import { addImageAsset } from '@/lib/image-assets';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return errorResponse('ファイルが指定されていません', 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse('対応形式は JPEG / PNG / GIF / WebP です', 400);
    }

    if (file.size > MAX_SIZE) {
      return errorResponse('ファイルサイズは 5MB 以下にしてください', 400);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(ext)
      ? ext === 'jpeg'
        ? 'jpg'
        : ext
      : 'jpg';
    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}.${safeExt}`;
    const blogDir = path.join(process.cwd(), 'public', 'images', 'blog');
    await mkdir(blogDir, { recursive: true });
    const filePath = path.join(blogDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/images/blog/${filename}`;

    // 画像アセットに自動登録
    const aspect = (formData.get('aspect') as string) === 'thumbnail' ? 'thumbnail' : 'body';
    const alt = (formData.get('alt') as string) || '';
    const tags = alt ? [alt] : [];
    try {
      await addImageAsset({ path: url, tags, aspect });
    } catch (e) {
      console.error('Failed to auto-register image asset:', e);
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Image upload failed:', error);
    return errorResponse('アップロードに失敗しました');
  }
}
