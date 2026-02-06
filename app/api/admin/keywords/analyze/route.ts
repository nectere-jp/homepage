import { NextResponse } from 'next/server';
import { 
  updateKeywordDatabase, 
  getTopKeywords,
  loadKeywordDatabase 
} from '@/lib/keyword-manager';

export async function POST() {
  try {
    // キーワードデータベースを更新
    const db = await updateKeywordDatabase();
    
    // トップキーワードを取得
    const topKeywords = await getTopKeywords(20);

    // 競合しているキーワードを抽出
    const conflicts = topKeywords.filter(({ data }) => data.frequency >= 2);

    return NextResponse.json({
      success: true,
      analysis: db.analysis,
      topKeywords,
      conflicts,
    });
  } catch (error) {
    console.error('Failed to analyze keywords:', error);
    return NextResponse.json(
      { error: 'Failed to analyze keywords' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await loadKeywordDatabase();
    const topKeywords = await getTopKeywords(20);

    // 競合しているキーワードを抽出
    const conflicts = topKeywords.filter(({ data }) => data.frequency >= 2);

    return NextResponse.json({
      analysis: db.analysis,
      topKeywords,
      conflicts,
      keywordGaps: db.keywordGaps,
    });
  } catch (error) {
    console.error('Failed to fetch keyword data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keyword data' },
      { status: 500 }
    );
  }
}
