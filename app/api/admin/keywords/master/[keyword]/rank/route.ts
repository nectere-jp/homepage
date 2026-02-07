import { NextResponse } from 'next/server';
import { updateRankHistory } from '@/lib/keyword-manager';

/**
 * POST /api/admin/keywords/master/[keyword]/rank
 * キーワードの検索順位を記録
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: rawKeyword } = await params;
    const keyword = decodeURIComponent(rawKeyword);
    const body = await request.json();
    const { rank, source = 'manual' } = body;

    if (typeof rank !== 'number' || rank < 1) {
      return NextResponse.json(
        { error: 'Invalid rank value' },
        { status: 400 }
      );
    }

    await updateRankHistory(keyword, rank, source);

    return NextResponse.json({
      success: true,
      message: 'Rank history updated successfully',
      keyword,
      rank,
    });
  } catch (error: any) {
    console.error('Failed to update rank history:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update rank history' },
      { status: 500 }
    );
  }
}
