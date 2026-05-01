import { NextRequest, NextResponse } from 'next/server';
import { getClusterAxisStructure } from '@/lib/keyword-manager';
import { requireAdmin } from '@/lib/api-auth';

/**
 * GET /api/admin/keywords/pillar-cluster
 * 4軸クラスタ構造を取得（V5: cluster-axis 構造）
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const structure = await getClusterAxisStructure();
    return NextResponse.json({ success: true, ...structure });
  } catch (error) {
    console.error('Failed to fetch cluster axis structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cluster axis structure' },
      { status: 500 }
    );
  }
}
