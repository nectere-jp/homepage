import { NextRequest, NextResponse } from 'next/server';
import {
  getTagMaster,
  updateTagMaster,
  type TagMasterData,
} from '@/lib/keyword-manager';
import { getAllPosts } from '@/lib/blog';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

/**
 * GET /api/admin/tags
 * すべてのタグを取得
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const tagMaster = await getTagMaster();
    const posts = await getAllPosts(undefined, { includeDrafts: true });

    // 各タグの使用状況を計算
    const tagsWithUsage = Object.entries(tagMaster).map(([tag, data]) => {
      const usedInArticles = posts.filter((post) =>
        post.tags.includes(tag)
      ).map((post) => post.slug);

      return {
        tag,
        displayName: data.displayName || tag,
        description: data.description || '',
        targetKeywords: data.targetKeywords || [],
        usageCount: usedInArticles.length,
        usedInArticles,
      };
    });

    // 検索フィルター
    let filteredTags = tagsWithUsage;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTags = tagsWithUsage.filter(
        (t) =>
          t.tag.toLowerCase().includes(searchLower) ||
          t.displayName.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      );
    }

    // タグ名でソート
    filteredTags.sort((a, b) => a.tag.localeCompare(b.tag, 'ja'));

    return NextResponse.json({
      success: true,
      tags: filteredTags,
      total: filteredTags.length,
    });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return errorResponse('Failed to fetch tags');
  }
}

/**
 * POST /api/admin/tags
 * 新しいタグを作成
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { tag, displayName, description } = body;

    if (!tag || typeof tag !== 'string' || tag.trim() === '') {
      return errorResponse('Tag name is required', 400);
    }

    const trimmedTag = tag.trim();

    // 既存のタグをチェック
    const existing = await getTagMaster();
    if (existing[trimmedTag]) {
      return errorResponse('Tag already exists', 409);
    }

    // 新しいタグを作成
    await updateTagMaster(trimmedTag, {
      displayName: displayName || trimmedTag,
      description: description || '',
      targetKeywords: [],
    });

    return NextResponse.json({
      success: true,
      message: 'Tag created successfully',
      tag: trimmedTag,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return errorResponse('Failed to create tag');
  }
}
