import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';
import { getImageAssets, addImageAsset } from '@/lib/image-assets';

const BLOG_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'blog');

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const existingAssets = await getImageAssets();
    const existingPaths = new Set(existingAssets.map((a) => a.path));

    const files = await fs.readdir(BLOG_IMAGE_DIR);
    const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

    let added = 0;
    for (const file of imageFiles) {
      const imagePath = `/images/blog/${file}`;
      if (!existingPaths.has(imagePath)) {
        await addImageAsset({
          path: imagePath,
          tags: [],
          aspect: 'body', // デフォルト。あとでUIから変更可能
        });
        added++;
      }
    }

    return NextResponse.json({ added, total: imageFiles.length });
  } catch (error) {
    console.error('Failed to register images:', error);
    return errorResponse('Failed to register images');
  }
}
