import { NextRequest, NextResponse } from 'next/server';
import { getPillarClusterStructure } from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';

/**
 * GET /api/admin/keywords/pillar-cluster
 * ピラー→クラスター構造を取得
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const structure = await getPillarClusterStructure();
    return NextResponse.json({ success: true, ...structure });
  } catch (error) {
    console.error('Failed to fetch pillar-cluster structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pillar-cluster structure' },
      { status: 500 }
    );
  }
}
