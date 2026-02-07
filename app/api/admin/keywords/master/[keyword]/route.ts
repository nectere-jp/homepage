import { NextResponse } from 'next/server';
import {
  loadTargetKeywords,
  saveTargetKeyword,
  deleteTargetKeyword,
  type TargetKeywordData,
} from '@/lib/keyword-manager';

/**
 * GET /api/admin/keywords/master/[keyword]
 * 特定のターゲットキーワードを取得
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const keywords = await loadTargetKeywords();

    if (!keywords[keyword]) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      keyword,
      data: keywords[keyword],
    });
  } catch (error) {
    console.error('Failed to fetch keyword:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keyword' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/keywords/master/[keyword]
 * ターゲットキーワードを更新
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const body = await request.json();

    // 既存のキーワードをチェック
    const existing = await loadTargetKeywords();
    if (!existing[keyword]) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    await saveTargetKeyword(keyword, body as Partial<TargetKeywordData>);

    return NextResponse.json({
      success: true,
      message: 'Keyword updated successfully',
      keyword,
    });
  } catch (error) {
    console.error('Failed to update keyword:', error);
    return NextResponse.json(
      { error: 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/keywords/master/[keyword]
 * ターゲットキーワードを削除
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);

    // 既存のキーワードをチェック
    const existing = await loadTargetKeywords();
    if (!existing[keyword]) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    await deleteTargetKeyword(keyword);

    return NextResponse.json({
      success: true,
      message: 'Keyword deleted successfully',
      keyword,
    });
  } catch (error) {
    console.error('Failed to delete keyword:', error);
    return NextResponse.json(
      { error: 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}
