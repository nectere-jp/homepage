import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';
import {
  getImageAssets,
  addImageAsset,
  updateImageAssetTags,
  deleteImageAsset,
  syncImageAssetUsage,
  mergeImageAssets,
  replaceImageAsset,
} from '@/lib/image-assets';

// GET: アセット一覧取得（usedIn同期あり）
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const assets = await syncImageAssetUsage();
    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Failed to get image assets:', error);
    return errorResponse('Failed to get image assets');
  }
}

// POST: アセット追加 or タグ更新
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'add') {
      const { path: imagePath, tags, aspect } = body;
      if (!imagePath) {
        return errorResponse('path is required', 400);
      }
      const asset = await addImageAsset({
        path: imagePath,
        tags: tags || [],
        aspect: aspect || 'body',
      });
      return NextResponse.json({ asset });
    }

    if (action === 'update-tags') {
      const { path: imagePath, tags } = body;
      if (!imagePath || !Array.isArray(tags)) {
        return errorResponse('path and tags are required', 400);
      }
      await updateImageAssetTags(imagePath, tags);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const { path: imagePath } = body;
      if (!imagePath) {
        return errorResponse('path is required', 400);
      }
      await deleteImageAsset(imagePath);
      return NextResponse.json({ success: true });
    }

    if (action === 'merge') {
      const { keepPath, removePath } = body;
      if (!keepPath || !removePath) {
        return errorResponse('keepPath and removePath are required', 400);
      }
      const result = await mergeImageAssets(keepPath, removePath);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'replace') {
      const { oldPath, newPath } = body;
      if (!oldPath || !newPath) {
        return errorResponse('oldPath and newPath are required', 400);
      }
      const result = await replaceImageAsset(oldPath, newPath);
      return NextResponse.json({ success: true, ...result });
    }

    return errorResponse('Unknown action', 400);
  } catch (error) {
    console.error('Image assets error:', error);
    return errorResponse('Failed to process request');
  }
}
