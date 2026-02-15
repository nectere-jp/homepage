import { NextRequest, NextResponse } from 'next/server';
import { generateArticleIdeas } from '@/lib/claude';
import { getAllPosts } from '@/lib/blog';
import { loadTargetKeywords, calculateBusinessImpact } from '@/lib/keyword-manager';

export async function POST(request: NextRequest) {
  try {
    const { unusedKeywords } = await request.json();

    if (!unusedKeywords || !Array.isArray(unusedKeywords)) {
      return NextResponse.json(
        { error: 'Unused keywords are required' },
        { status: 400 }
      );
    }

    // 既存記事のトピックを取得
    const posts = await getAllPosts();
    const existingTopics = posts.map((p) => p.title);

    // キーワードのメタデータ（階層・フラグ・事業インパクト）を取得
    const targetKeywords = await loadTargetKeywords();
    const keywordContext = unusedKeywords
      .filter((kw: string) => targetKeywords[kw])
      .map((kw: string) => {
        const d = targetKeywords[kw];
        return {
          keyword: kw,
          tier: d.keywordTier,
          workflowFlag: d.workflowFlag,
          businessImpact: calculateBusinessImpact({
            estimatedPv: d.estimatedPv,
            expectedRank: d.expectedRank ?? d.currentRank,
            cvr: d.cvr,
          }),
        };
      });

    const ideas = await generateArticleIdeas(
      unusedKeywords,
      existingTopics,
      keywordContext
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
