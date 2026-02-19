import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { commitFiles } from '@/lib/github';

/**
 * POST /api/admin/keywords/commit
 * content/keywords.json を GitHub にコミット
 */
export async function POST() {
  try {
    const contentDir = path.join(process.cwd(), 'content');
    const keywordsContent = await fs.readFile(
      path.join(contentDir, 'keywords.json'),
      'utf8'
    );

    await commitFiles(
      [{ path: 'content/keywords.json', content: keywordsContent }],
      'Update keywords (inline edit)'
    );

    return NextResponse.json({
      success: true,
      message: 'GitHubにコミットしました',
    });
  } catch (error) {
    console.error('Failed to commit keywords:', error);
    return NextResponse.json(
      { error: 'Failed to commit keywords' },
      { status: 500 }
    );
  }
}
