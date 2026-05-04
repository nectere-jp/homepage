import { NextRequest, NextResponse } from 'next/server';
import {
  updateKeywordDatabase,
  getTopKeywords,
  loadKeywordDatabase,
} from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

function buildAnalysisFromDb(db: Awaited<ReturnType<typeof loadKeywordDatabase>>) {
  const usage = db.usageTracking || {};
  return {
    lastAnalyzed: db.metadata?.lastUpdated || null,
    totalArticles: 0,
    uniqueKeywords: Object.keys(usage).length,
  };
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    await updateKeywordDatabase();
    const db = await loadKeywordDatabase();
    const topKeywords = await getTopKeywords(20);
    const conflicts = topKeywords.filter(({ data }) => data.frequency >= 2);

    return NextResponse.json({
      success: true,
      analysis: buildAnalysisFromDb(db),
      topKeywords,
      conflicts,
    });
  } catch (error) {
    console.error('Failed to analyze keywords:', error);
    return errorResponse('Failed to analyze keywords');
  }
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const db = await loadKeywordDatabase();
    const topKeywords = await getTopKeywords(20);
    const conflicts = topKeywords.filter(({ data }) => data.frequency >= 2);

    return NextResponse.json({
      analysis: buildAnalysisFromDb(db),
      topKeywords,
      conflicts,
      keywordGaps: [],
    });
  } catch (error) {
    console.error('Failed to fetch keyword data:', error);
    return errorResponse('Failed to fetch keyword data');
  }
}
