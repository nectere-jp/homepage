import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-auth';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '@/lib/teams';
import { commitFiles } from '@/lib/github';
import fs from 'fs/promises';
import path from 'path';

// GET: チーム一覧
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const teams = await getAllTeams();
  return NextResponse.json({ teams });
}

const endorsementSchema = z.object({
  name: z.string(),
  title: z.string(),
  comment: z.string(),
  imageUrl: z.string().optional(),
});

const createSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug は英小文字・数字・ハイフンのみ'),
  teamName: z.string().min(1),
  category: z.enum(['中学硬式', '中学軟式', '高校', 'その他']),
  specialPrice: z.number().min(0),
  normalPrice: z.number().min(0),
  basicSpecialPrice: z.number().min(0).optional(),
  basicNormalPrice: z.number().min(0).optional(),
  discountLabel: z.string(),
  contactPerson: z.string().default(''),
  permissionPerson: z.string().default(''),
  logoUrl: z.string().default(''),
  heroImageUrl: z.string().optional(),
  note: z.string().default(''),
  endorsements: z.array(endorsementSchema).default([]),
  offerVariant: z.enum(['A', 'B', 'C']).default('C'),
  active: z.boolean().default(true),
});

// POST: チーム作成
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const input = createSchema.parse(body);
    const team = await createTeam(input);

    // GitHub commit
    const teamsJson = await fs.readFile(
      path.join(process.cwd(), 'content', 'teams.json'),
      'utf-8',
    );
    await commitFiles(
      [{ path: 'content/teams.json', content: teamsJson }],
      `Teams: ${team.teamName} を追加`,
    );

    return NextResponse.json({ team }, { status: 201 });
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

const updateSchema = z.object({
  slug: z.string().min(1),
  updates: z.object({
    teamName: z.string().min(1).optional(),
    category: z.enum(['中学硬式', '中学軟式', '高校', 'その他']).optional(),
    specialPrice: z.number().min(0).optional(),
    normalPrice: z.number().min(0).optional(),
    basicSpecialPrice: z.number().min(0).optional(),
    basicNormalPrice: z.number().min(0).optional(),
    discountLabel: z.string().optional(),
    contactPerson: z.string().optional(),
    permissionPerson: z.string().optional(),
    logoUrl: z.string().optional(),
    heroImageUrl: z.string().optional(),
    note: z.string().optional(),
    endorsements: z.array(endorsementSchema).optional(),
    offerVariant: z.enum(['A', 'B', 'C']).optional(),
    active: z.boolean().optional(),
  }),
});

// PATCH: チーム更新
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { slug, updates } = updateSchema.parse(body);
    const team = await updateTeam(slug, updates);

    const teamsJson = await fs.readFile(
      path.join(process.cwd(), 'content', 'teams.json'),
      'utf-8',
    );
    await commitFiles(
      [{ path: 'content/teams.json', content: teamsJson }],
      `Teams: ${team.teamName} を更新`,
    );

    return NextResponse.json({ team });
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

// DELETE: チーム削除
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { slug } = await request.json();
    await deleteTeam(slug);

    const teamsJson = await fs.readFile(
      path.join(process.cwd(), 'content', 'teams.json'),
      'utf-8',
    );
    await commitFiles(
      [{ path: 'content/teams.json', content: teamsJson }],
      `Teams: ${slug} を削除`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
