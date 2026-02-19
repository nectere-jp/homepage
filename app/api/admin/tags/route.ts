import { NextResponse } from 'next/server';
import {
  getTagMaster,
  updateTagMaster,
  type TagMasterData,
} from '@/lib/keyword-manager';
import { getAllPosts } from '@/lib/blog';

/**
 * GET /api/admin/tags
 * すべてのタグを取得
 */
export async function GET(request: Request) {
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
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tags
 * 新しいタグを作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tag, displayName, description } = body;

    if (!tag || typeof tag !== 'string' || tag.trim() === '') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const trimmedTag = tag.trim();

    // 既存のタグをチェック
    const existing = await getTagMaster();
    if (existing[trimmedTag]) {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 409 }
      );
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
    });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
