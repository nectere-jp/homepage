import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { commitFiles } from '@/lib/github';
import { requireAdmin } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

/**
 * POST /api/admin/keywords/commit
 * content/keywords.json を GitHub にコミット
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
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
    return errorResponse('Failed to commit keywords');
  }
}
