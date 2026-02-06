import { NextResponse } from 'next/server';
import {
  loadTargetKeywords,
  saveTargetKeyword,
  loadKeywordDatabaseV2,
  type TargetKeywordData,
} from '@/lib/keyword-manager';

/**
 * GET /api/admin/keywords/master
 * すべてのターゲットキーワードを取得
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get('business');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    const db = await loadKeywordDatabaseV2();
    let keywords = Object.entries(db.targetKeywords);

    // フィルタリング
    if (business) {
      keywords = keywords.filter(([, data]) =>
        data.relatedBusiness.includes(business as any)
      );
    }

    if (priority) {
      const priorityNum = parseInt(priority, 10);
      keywords = keywords.filter(([, data]) => data.priority === priorityNum);
    }

    if (status) {
      keywords = keywords.filter(([, data]) => data.status === status);
    }

    // キーワード名でソート
    keywords.sort((a, b) => {
      // 優先度が高い順
      if (b[1].priority !== a[1].priority) {
        return b[1].priority - a[1].priority;
      }
      // PVが多い順
      if (b[1].estimatedPv !== a[1].estimatedPv) {
        return b[1].estimatedPv - a[1].estimatedPv;
      }
      // キーワード名でソート
      return a[0].localeCompare(b[0], 'ja');
    });

    const result = keywords.map(([keyword, data]) => ({
      keyword,
      ...data,
    }));

    return NextResponse.json({
      success: true,
      keywords: result,
      total: result.length,
    });
  } catch (error) {
    console.error('Failed to fetch target keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch target keywords' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/keywords/master
 * 新しいターゲットキーワードを作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, ...data } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    // 既存のキーワードをチェック
    const existing = await loadTargetKeywords();
    if (existing[keyword]) {
      return NextResponse.json(
        { error: 'Keyword already exists' },
        { status: 409 }
      );
    }

    await saveTargetKeyword(keyword, data as Partial<TargetKeywordData>);

    return NextResponse.json({
      success: true,
      message: 'Keyword created successfully',
      keyword,
    });
  } catch (error) {
    console.error('Failed to create keyword:', error);
    return NextResponse.json(
      { error: 'Failed to create keyword' },
      { status: 500 }
    );
  }
}
