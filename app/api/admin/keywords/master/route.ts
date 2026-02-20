import { NextResponse } from 'next/server';
import {
  loadKeywordGroups,
  saveKeywordGroup,
  resolveGroupDefaults,
  getCTRByRank,
  calculateBusinessImpact,
  getRepresentativeKeyword,
  type KeywordTier,
  type WorkflowFlag,
  type KeywordGroupData,
} from '@/lib/keyword-manager';

/**
 * GET /api/admin/keywords/master
 * すべてのキーワードを取得（V4: バリアント単位で展開。同趣旨は parentId ?? groupId で導出）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get('business');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const keywordTier = searchParams.get('keywordTier') as KeywordTier | null;
    const workflowFlag = searchParams.get('workflowFlag') as WorkflowFlag | null;

    const keywordGroups = await loadKeywordGroups();
    let entries = Object.entries(keywordGroups);

    if (business) {
      entries = entries.filter(([, g]) => g.relatedBusiness.includes(business as any));
    }
    if (priority) {
      const n = parseInt(priority, 10);
      entries = entries.filter(([, g]) => g.priority === n);
    }
    if (status) {
      entries = entries.filter(([, g]) => g.status === status);
    }
    if (keywordTier) {
      entries = entries.filter(([, g]) => g.tier === keywordTier);
    }
    if (workflowFlag) {
      entries = entries.filter(([, g]) => {
        const resolved = resolveGroupDefaults(g);
        return resolved.workflowFlag === workflowFlag;
      });
    }

    entries.sort((a, b) => {
      if (b[1].priority !== a[1].priority) return b[1].priority - a[1].priority;
      const pvA = a[1].variants[0]?.estimatedPv ?? 0;
      const pvB = b[1].variants[0]?.estimatedPv ?? 0;
      if (pvB !== pvA) return pvB - pvA;
      return getRepresentativeKeyword(a[1]).localeCompare(getRepresentativeKeyword(b[1]), 'ja');
    });

    const result: Array<Record<string, unknown>> = [];
    for (const [groupId, group] of entries) {
      const resolved = resolveGroupDefaults(group);
      const rep = getRepresentativeKeyword(group);
      const effectiveParentId =
        group.parentId && String(group.parentId).trim()
          ? group.parentId
          : null;
      const rootId = effectiveParentId ?? groupId;
      const rootGroup = keywordGroups[rootId];
      const mainInIntent = rootGroup ? getRepresentativeKeyword(rootGroup) : rep;

      const variants = group.variants?.length ? group.variants : [{ keyword: rep, estimatedPv: 0, currentRank: null, rankHistory: [], cvr: null, expectedRank: null }];
      variants.forEach((v, orderInGroup) => {
        const rank = v?.expectedRank ?? v?.currentRank ?? null;
        const ctr = rank != null && rank >= 1 ? getCTRByRank(rank) : null;
        const businessImpact = calculateBusinessImpact({
          estimatedPv: v?.estimatedPv ?? 0,
          expectedRank: v?.expectedRank ?? v?.currentRank ?? null,
          cvr: v?.cvr ?? null,
        });
        result.push({
          groupId,
          parentId: effectiveParentId,
          keyword: v.keyword,
          keywordTier: resolved.tier,
          intentGroupId: rootId,
          mainKeywordInSameIntent: mainInIntent,
          orderInGroup,
          relatedBusiness: group.relatedBusiness,
          relatedTags: group.relatedTags,
          assignedArticles: group.assignedArticles ?? [],
          priority: group.priority,
          status: group.status,
          workflowFlag: resolved.workflowFlag,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          ctr: ctr != null ? Math.round(ctr * 10000) / 100 : null,
          businessImpact,
          estimatedPv: v?.estimatedPv ?? 0,
          currentRank: v?.currentRank ?? null,
          expectedRank: v?.expectedRank ?? null,
          cvr: v?.cvr ?? null,
        });
      });
    }

    return NextResponse.json({
      success: true,
      keywords: result,
      keywordGroups: result,
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
 * 新しいキーワードグループを作成（V4）
 */
function generateGroupId(): string {
  return `kw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const firstKeyword = (body.keyword ?? body.firstKeyword ?? '').trim();
    const addToGroupId = (body.addToGroupId ?? '').trim() || null;

    if (addToGroupId) {
      const groups = await loadKeywordGroups();
      const group = groups[addToGroupId];
      if (!group) {
        return NextResponse.json(
          { error: '指定された同趣旨グループが見つかりません' },
          { status: 404 }
        );
      }
      if (group.variants.some((v) => v.keyword === firstKeyword)) {
        return NextResponse.json(
          { error: 'このキーワードは既にこのグループに含まれています' },
          { status: 409 }
        );
      }
      const estimatedPv = typeof body.estimatedPv === 'number' ? body.estimatedPv : parseInt(String(body.estimatedPv || 0), 10);
      const newVariant = {
        keyword: firstKeyword,
        estimatedPv: Number.isNaN(estimatedPv) ? 0 : estimatedPv,
        currentRank: body.currentRank ?? null,
        rankHistory: [],
        cvr: body.cvr ?? null,
        expectedRank: body.expectedRank ?? null,
      };
      const updated = {
        ...group,
        variants: [...group.variants, newVariant],
        updatedAt: new Date().toISOString(),
      };
      await saveKeywordGroup(addToGroupId, updated);
      return NextResponse.json({
        success: true,
        message: '同趣旨グループにバリアントとして追加しました',
        groupId: addToGroupId,
      });
    }

    const id = (body.id ?? body.groupId ?? '').trim() || generateGroupId();
    if (!firstKeyword) {
      return NextResponse.json(
        { error: 'keyword is required' },
        { status: 400 }
      );
    }

    const existing = await loadKeywordGroups();
    if (existing[id]) {
      return NextResponse.json(
        { error: 'Group already exists' },
        { status: 409 }
      );
    }

    const variantKeyword = firstKeyword;
    const tier = (body.tier ?? body.keywordTier ?? 'middle') as KeywordTier;
    const data: Partial<KeywordGroupData> = {
      tier,
      parentId: body.parentId ?? null,
      relatedBusiness: body.relatedBusiness ?? [],
      relatedTags: body.relatedTags ?? [],
      assignedArticles: body.assignedArticles ?? [],
      priority: body.priority ?? 3,
      status: body.status ?? 'active',
      workflowFlag: body.workflowFlag,
      variants:
        body.variants ?? [
          {
            keyword: variantKeyword,
            estimatedPv: 0,
            currentRank: null,
            rankHistory: [],
            cvr: null,
            expectedRank: null,
          },
        ],
    };
    await saveKeywordGroup(id, data);

    return NextResponse.json({
      success: true,
      message: 'Keyword group created successfully',
      groupId: id,
    });
  } catch (error) {
    console.error('Failed to create keyword:', error);
    return NextResponse.json(
      { error: 'Failed to create keyword' },
      { status: 500 }
    );
  }
}
