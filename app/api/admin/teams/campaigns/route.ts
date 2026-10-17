import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-auth';
import { upsertCampaign, removeCampaign, getTeamBySlug } from '@/lib/teams';
import { commitFiles } from '@/lib/github';
import fs from 'fs/promises';
import path from 'path';

const upsertSchema = z.object({
  teamSlug: z.string().min(1),
  campaign: z.object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'campaign slug は英小文字・数字・ハイフンのみ'),
    label: z.string().min(1),
    distributedAt: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean().default(true),
  }),
});

const deleteSchema = z.object({
  teamSlug: z.string().min(1),
  campaignSlug: z.string().min(1),
});

async function commitTeamsJson(message: string) {
  const teamsJson = await fs.readFile(
    path.join(process.cwd(), 'content', 'teams.json'),
    'utf-8',
  );
  await commitFiles([{ path: 'content/teams.json', content: teamsJson }], message);
}

// POST: キャンペーンの追加/更新
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { teamSlug, campaign } = upsertSchema.parse(body);

    const team = await getTeamBySlug(teamSlug);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const existing = team.campaigns?.find((c) => c.slug === campaign.slug);
    const action = existing ? '更新' : '追加';

    const { campaign: saved } = await upsertCampaign(teamSlug, campaign);
    await commitTeamsJson(`Teams: ${team.teamName} / campaign ${saved.slug} を${action}`);

    return NextResponse.json({ campaign: saved });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: error.errors },
        { status: 400 },
      );
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: キャンペーン削除
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { teamSlug, campaignSlug } = deleteSchema.parse(body);

    const team = await getTeamBySlug(teamSlug);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    await removeCampaign(teamSlug, campaignSlug);
    await commitTeamsJson(`Teams: ${team.teamName} / campaign ${campaignSlug} を削除`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: error.errors },
        { status: 400 },
      );
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
