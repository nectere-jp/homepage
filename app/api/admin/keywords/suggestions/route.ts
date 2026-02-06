import { NextResponse } from 'next/server';
import {
  suggestUnusedKeywords,
  suggestUnusedKeywordsByBusiness,
  type BusinessType,
} from '@/lib/keyword-manager';

/**
 * GET /api/admin/keywords/suggestions
 * 未使用の重要キーワードを提案
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get('business') as BusinessType | null;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let suggestions;
    
    if (business) {
      // 事業別の未使用キーワード
      suggestions = await suggestUnusedKeywordsByBusiness(business, limit);
    } else {
      // 全体の未使用キーワード
      suggestions = await suggestUnusedKeywords(limit);
    }

    return NextResponse.json({
      success: true,
      suggestions,
      total: suggestions.length,
      business: business || 'all',
    });
  } catch (error) {
    console.error('Failed to get keyword suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get keyword suggestions' },
      { status: 500 }
    );
  }
}
