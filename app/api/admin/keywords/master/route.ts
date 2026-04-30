import { NextRequest, NextResponse } from 'next/server';
import {
  loadKeywordGroups,
  saveKeywordGroup,
  resolveGroupDefaults,
  getCTRByRank,
  calculateBusinessImpact,
  getRepresentativeKeyword,
  type ClusterAxis,
  type ArticleStatus,
  type KeywordGroupData,
} from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';

/**
 * GET /api/admin/keywords/master
 * すべてのキーワードを取得（V5: clusterAxis・articleRole・articleStatus）
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get('business');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const clusterAxis = searchParams.get('clusterAxis') as ClusterAxis | null;
    const articleStatus = searchParams.get('articleStatus') as ArticleStatus | null;

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
    if (clusterAxis) {
      entries = entries.filter(([, g]) => g.clusterAxis === clusterAxis);
    }
    if (articleStatus) {
      entries = entries.filter(([, g]) => {
        const resolved = resolveGroupDefaults(g);
        return resolved.articleStatus === articleStatus;
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

      const rawVariants = group.variants?.length
        ? group.variants
        : [{ keyword: rep, estimatedPv: 0, currentRank: null, rankHistory: [], cvr: null, expectedRank: null }];
      const variants = [...rawVariants].sort((a, b) => {
        const oa = a.orderInGroup ?? Infinity;
        const ob = b.orderInGroup ?? Infinity;
        return oa - ob;
      });
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
          keyword: v.keyword,
          clusterAxis: group.clusterAxis,
          articleRole: group.articleRole,
          articleStatus: resolved.articleStatus,
          hubArticleSlug: group.hubArticleSlug ?? null,
          intentGroupId: groupId,
          mainKeywordInSameIntent: rep,
          orderInGroup,
          relatedBusiness: group.relatedBusiness,
          relatedTags: group.relatedTags,
          assignedArticles: group.assignedArticles ?? [],
          priority: group.priority,
          status: group.status,
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
 * 新しいキーワードグループを作成（V5）
 */
function generateGroupId(): string {
  return `kw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
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

    const clusterAxis = (body.clusterAxis ?? 'other') as ClusterAxis;
    const data: Partial<KeywordGroupData> = {
      clusterAxis,
      articleRole: body.articleRole ?? 'child',
      articleStatus: body.articleStatus ?? 'pending',
      hubArticleSlug: body.hubArticleSlug ?? null,
      relatedBusiness: body.relatedBusiness ?? [],
      relatedTags: body.relatedTags ?? [],
      assignedArticles: body.assignedArticles ?? [],
      priority: body.priority ?? 3,
      status: body.status ?? 'active',
      variants: body.variants ?? [
        {
          keyword: firstKeyword,
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
