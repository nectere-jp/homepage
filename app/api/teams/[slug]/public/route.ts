import { NextRequest, NextResponse } from 'next/server';
import { getTeamBySlug } from '@/lib/teams';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team || !team.active) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({
    slug: team.slug,
    teamName: team.teamName,
    category: team.category,
    offerVariant: team.offerVariant ?? 'C',
  });
}
