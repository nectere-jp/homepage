import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { loadKeywordDatabase } from '@/lib/keyword-manager';

export async function GET() {
  try {
    const posts = await getAllPosts();
    const publishedPosts = posts.filter(p => p.published !== false);
    const draftPosts = posts.filter(p => p.published === false);
    
    const keywordDb = await loadKeywordDatabase();
    
    return NextResponse.json({
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalKeywords: Object.keys(keywordDb.globalKeywords).length,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
