import fs from 'fs/promises';
import path from 'path';

// ---------- Types ----------

export interface TeamEndorsement {
  name: string;
  title: string;
  comment: string;
}

export interface Team {
  id: string;
  slug: string;
  teamName: string;
  category: '中学硬式' | '中学軟式' | '高校' | 'その他';
  specialPrice: number;
  normalPrice: number;
  discountLabel: string;
  contactPerson: string;
  permissionPerson?: string;
  logoUrl?: string;
  note: string;
  endorsements?: TeamEndorsement[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamsData {
  version: string;
  teams: Record<string, Team>;
}

export type TeamEvent = 'page_view' | 'cta_click' | 'signup';

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
