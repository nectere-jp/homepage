import { NextRequest, NextResponse } from 'next/server';
import {
  getIntentGroups,
  assignKeywordsToIntentGroup,
  loadTargetKeywords,
  saveTargetKeyword,
} from '@/lib/keyword-manager';

/**
 * GET /api/admin/keywords/intent-groups
 * 意図グループ一覧を取得
 */
export async function GET() {
  try {
    const groups = await getIntentGroups();
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('Failed to fetch intent groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intent groups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/keywords/intent-groups
 * 意図グループを作成し、キーワードを割り当て
 * Body: { id: string, keywords?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, keywords = [] } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Intent group id is required' },
        { status: 400 }
      );
    }

    const existing = await loadTargetKeywords();
    const validKeywords = keywords.filter((kw: string) => existing[kw]);

    if (validKeywords.length > 0) {
      await assignKeywordsToIntentGroup(id, validKeywords);
    }

    const groups = await getIntentGroups();
    return NextResponse.json({
      success: true,
      message: 'Intent group created',
      groups,
    });
  } catch (error) {
    console.error('Failed to create intent group:', error);
    return NextResponse.json(
      { error: 'Failed to create intent group' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/keywords/intent-groups
 * 意図グループのキーワードを更新
 * Body: { id: string, keywords: string[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, keywords } = body;

    if (!id || typeof id !== 'string' || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'id and keywords array are required' },
        { status: 400 }
      );
    }

    const existing = await loadTargetKeywords();

    // このグループに属していたキーワードのうち、keywordsに含まれないものはグループから外す
    const currentGroups = await getIntentGroups();
    const currentGroup = currentGroups.find((g) => g.id === id);
    if (currentGroup) {
      for (const kw of currentGroup.keywords) {
        if (!keywords.includes(kw)) {
          await saveTargetKeyword(kw, { intentGroupId: null });
        }
      }
    }

    // keywordsをグループに割り当て
    const validKeywords = keywords.filter((kw: string) => existing[kw]);
    if (validKeywords.length > 0) {
      await assignKeywordsToIntentGroup(id, validKeywords);
    }

    const groups = await getIntentGroups();
    return NextResponse.json({
      success: true,
      message: 'Intent group updated',
      groups,
    });
  } catch (error) {
    console.error('Failed to update intent group:', error);
    return NextResponse.json(
      { error: 'Failed to update intent group' },
      { status: 500 }
    );
  }
}
