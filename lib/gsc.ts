import { createSign } from 'crypto';

/**
 * Google Search Console の検索アナリティクスを、サービスアカウントで読む。
 *
 * 環境変数:
 *  - GSC_SERVICE_ACCOUNT_JSON: サービスアカウントの JSON キーを base64 にしたもの
 *  - GSC_SITE_URL: Search Console のプロパティ（例: sc-domain:nectere.jp または https://www.nectere.jp/）
 * サービスアカウントのメールアドレスを、Search Console の「設定 > ユーザーと権限」に「制限付き」で追加しておく。
 */

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(json) as ServiceAccount;
  } catch {
    return null;
  }
}

export function isGscConfigured(): boolean {
  return !!readServiceAccount() && !!process.env.GSC_SITE_URL;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const sa = readServiceAccount();
  if (!sa) throw new Error('GSC_SERVICE_ACCOUNT_JSON is not set');
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = b64url(signer.sign(sa.private_key));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`GSC token error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export type GscDimension = 'page' | 'query' | 'date' | 'device' | 'country';

export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function querySearchAnalytics(params: {
  startDate: string;
  endDate: string;
  dimensions: GscDimension[];
  rowLimit?: number;
  /** 'web'（通常の検索）など。Search Console の searchType */
  type?: string;
  pageContains?: string;
}): Promise<GscRow[]> {
  const site = process.env.GSC_SITE_URL;
  if (!site) throw new Error('GSC_SITE_URL is not set');
  const token = await getAccessToken();
  const body: Record<string, unknown> = {
    startDate: params.startDate,
    endDate: params.endDate,
    dimensions: params.dimensions,
    rowLimit: params.rowLimit ?? 1000,
    type: params.type ?? 'web',
    dataState: 'final',
  };
  if (params.pageContains) {
    body.dimensionFilterGroups = [
      { filters: [{ dimension: 'page', operator: 'contains', expression: params.pageContains }] },
    ];
  }
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`GSC query error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { rows?: GscRow[] };
  return data.rows ?? [];
}
