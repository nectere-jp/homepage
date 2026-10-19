import fs from 'fs/promises';
import path from 'path';

// ---------- Types ----------

export interface TeamEndorsement {
  name: string;
  title: string;
  comment: string;
  /** アバター画像URL（任意）。未設定時はプレースホルダーを表示 */
  imageUrl?: string;
}

/**
 * 配布経路ごとの計測用スラッグ（例: 5/17 配布チラシ、6/1 LINE 送付 など）。
 * URL は `/teams/<team.slug>?c=<campaign.slug>` の形で発行し、
 * 遷移先はチーム専用ページそのまま。流入経路を Session に紐付けて集計する。
 */
export interface TeamCampaign {
  slug: string;
  label: string;
  /** 配布日（ISO 8601, 任意）。チラシ配布日などを記録 */
  distributedAt?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  slug: string;
  teamName: string;
  category: '中学硬式' | '中学軟式' | '高校' | 'その他';
  /** エッセンシャルプランのチーム限定価格 */
  specialPrice: number;
  /** エッセンシャルプランの通常価格 */
  normalPrice: number;
  /** ベーシックプランの通常価格（未設定時: 26000） */
  basicNormalPrice?: number;
  /** ベーシックプランのチーム限定価格（未設定時: BASIC_PRICE - (normalPrice - specialPrice)） */
  basicSpecialPrice?: number;
  discountLabel: string;
  contactPerson: string;
  permissionPerson?: string;
  logoUrl?: string;
  /** Hero セクション右側の切り抜き画像（未設定時はデフォルト `/images/nobilva/hero_transparent.png`） */
  heroImageUrl?: string;
  note: string;
  endorsements?: TeamEndorsement[];
  /**
   * オファータイプ:
   *  - 'A' モニター型（初月無料＋翌学期末まで月3,000円割引）
   *  - 'B' オール3保証型（ベーシック限定・全額返金）
   *  - 'C' なし（チーム限定価格のみ、オファー帯を表示しない）
   * 未指定は 'C' 相当。
   */
  offerVariant?: 'A' | 'B' | 'C';
  /** 配布経路ごとの計測スラッグ一覧 */
  campaigns?: TeamCampaign[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamsData {
  version: string;
  teams: Record<string, Team>;
}

export type TeamEvent =
  | 'page_view'
  | 'cta_click'
  | 'cta_click_outbound'
  | 'section_view'
  | 'scroll_depth'
  | 'session_end'
  | 'invalid_campaign'
  | 'signup';

// ---------- File I/O ----------

const TEAMS_PATH = path.join(process.cwd(), 'content', 'teams.json');

export async function readTeams(): Promise<TeamsData> {
  const raw = await fs.readFile(TEAMS_PATH, 'utf-8');
  return JSON.parse(raw) as TeamsData;
}

export async function writeTeams(data: TeamsData): Promise<void> {
  await fs.writeFile(TEAMS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ---------- CRUD ----------

export async function getAllTeams(): Promise<Team[]> {
  const data = await readTeams();
  return Object.values(data.teams).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const data = await readTeams();
  return data.teams[slug] ?? null;
}

export async function createTeam(
  input: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Team> {
  const data = await readTeams();
  if (data.teams[input.slug]) {
    throw new Error(`Team slug "${input.slug}" already exists`);
  }
  const now = new Date().toISOString();
  const team: Team = {
    ...input,
    id: `team_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  data.teams[input.slug] = team;
  await writeTeams(data);
  return team;
}

export async function updateTeam(
  slug: string,
  updates: Partial<Omit<Team, 'id' | 'slug' | 'createdAt'>>,
): Promise<Team> {
  const data = await readTeams();
  const existing = data.teams[slug];
  if (!existing) {
    throw new Error(`Team "${slug}" not found`);
  }
  const updated: Team = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  data.teams[slug] = updated;
  await writeTeams(data);
  return updated;
}

export async function deleteTeam(slug: string): Promise<void> {
  const data = await readTeams();
  if (!data.teams[slug]) {
    throw new Error(`Team "${slug}" not found`);
  }
  delete data.teams[slug];
  await writeTeams(data);
}

// ---------- Campaign CRUD ----------

export function getCampaign(team: Team, campaignSlug: string): TeamCampaign | null {
  return team.campaigns?.find((c) => c.slug === campaignSlug) ?? null;
}

export async function upsertCampaign(
  teamSlug: string,
  input: Omit<TeamCampaign, 'createdAt' | 'updatedAt'>,
): Promise<{ team: Team; campaign: TeamCampaign }> {
  const data = await readTeams();
  const team = data.teams[teamSlug];
  if (!team) throw new Error(`Team "${teamSlug}" not found`);

  const now = new Date().toISOString();
  const campaigns = team.campaigns ?? [];
  const idx = campaigns.findIndex((c) => c.slug === input.slug);

  let campaign: TeamCampaign;
  if (idx >= 0) {
    campaign = { ...campaigns[idx], ...input, updatedAt: now };
    campaigns[idx] = campaign;
  } else {
    campaign = { ...input, createdAt: now, updatedAt: now };
    campaigns.push(campaign);
  }

  const updated: Team = { ...team, campaigns, updatedAt: now };
  data.teams[teamSlug] = updated;
  await writeTeams(data);
  return { team: updated, campaign };
}

export async function removeCampaign(
  teamSlug: string,
  campaignSlug: string,
): Promise<Team> {
  const data = await readTeams();
  const team = data.teams[teamSlug];
  if (!team) throw new Error(`Team "${teamSlug}" not found`);

  const campaigns = (team.campaigns ?? []).filter((c) => c.slug !== campaignSlug);
  const updated: Team = { ...team, campaigns, updatedAt: new Date().toISOString() };
  data.teams[teamSlug] = updated;
  await writeTeams(data);
  return updated;
}
