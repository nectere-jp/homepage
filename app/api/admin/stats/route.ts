import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { loadKeywordDatabase } from '@/lib/keyword-manager';
import { getContactStats } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const posts = await getAllPosts(undefined, { includeDrafts: true });
    const publishedPosts = posts.filter(p => p.published !== false);
    const draftPosts = posts.filter(p => p.published === false);
    
    const keywordDb = await loadKeywordDatabase();
    
    // お問い合わせ統計を取得
    let contactStats = {
      total: 0,
      new: 0,
      inProgress: 0,
      resolved: 0,
    };
    
    try {
      contactStats = await getContactStats();
    } catch (error) {
      console.error('Failed to fetch contact stats:', error);
      // お問い合わせ統計の取得に失敗してもエラーにしない
    }
    
    return NextResponse.json({
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalKeywords: Object.keys(keywordDb.globalKeywords).length,
      totalContacts: contactStats.total,
      newContacts: contactStats.new,
      inProgressContacts: contactStats.inProgress,
      resolvedContacts: contactStats.resolved,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
