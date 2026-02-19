import { NextRequest, NextResponse } from 'next/server';
import { generateArticleIdeas } from '@/lib/claude';
import { getAllPosts } from '@/lib/blog';
import { getGroupByVariantKeyword, calculateBusinessImpact } from '@/lib/keyword-manager';

export async function POST(request: NextRequest) {
  try {
    const { unusedKeywords } = await request.json();

    if (!unusedKeywords || !Array.isArray(unusedKeywords)) {
      return NextResponse.json(
        { error: 'Unused keywords are required' },
        { status: 400 }
      );
    }

    const posts = await getAllPosts();
    const existingTopics = posts.map((p) => p.title);

    const keywordContext = await Promise.all(
      unusedKeywords.map(async (kw: string) => {
        const group = await getGroupByVariantKeyword(kw);
        if (!group) return null;
        const v = group.variants.find((x) => x.keyword === kw) ?? group.variants[0];
        return {
          keyword: kw,
          tier: group.tier,
          workflowFlag: group.workflowFlag,
          businessImpact: calculateBusinessImpact({
            estimatedPv: v?.estimatedPv ?? 0,
            expectedRank: v?.expectedRank ?? v?.currentRank ?? null,
            cvr: v?.cvr ?? null,
          }),
        };
      })
    );
    const filtered = keywordContext.filter(Boolean) as NonNullable<typeof keywordContext[0]>[];

    const ideas = await generateArticleIdeas(
      unusedKeywords,
      existingTopics,
      filtered
    );

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Failed to generate article ideas:', error);
    return NextResponse.json(
      { error: 'Failed to generate article ideas' },
      { status: 500 }
    );
  }
}
