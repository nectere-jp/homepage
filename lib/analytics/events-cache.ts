import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

/**
 * nobilvaAnalytics の読み出しを 5 分だけメモリに保持する軽量キャッシュ。
 *
 * 目的:
 *  - /api/admin/posts/analytics と /api/admin/posts/[slug]/analytics の両方が
 *    同じ期間を集計するため、同一時刻に複数回クエリを投げるとクォータを食う
 *  - 管理画面を開いた直後は数十回連続で叩かれるので、5 分覚えておけば
 *    Firestore の読み取り数を 1 回/5 分 まで下げられる（分析ダッシュボードは
 *    リアルタイム性が要らないので 5 分遅延で十分）
 *  - 2026-10-26 に .limit(100000) で 1 回のロードが日次クォータ 50000 を
 *    一瞬で突破した事故を踏まえ、TTL を 60 秒 → 5 分に延長
 *
 * 制約:
 *  - Vercel の serverless function は冷えると消える → cold start 直後は必ず 1 回フェッチ
 *  - startDateStr + limit が完全一致した場合のみヒット（部分一致はしない）
 */

const CACHE_TTL_MS = 5 * 60_000;
const DEFAULT_LIMIT = 20_000;

interface CacheEntry {
  startDateStr: string;
  limit: number;
  docs: QueryDocumentSnapshot[];
  expiresAt: number;
}

let cache: CacheEntry | null = null;

export interface GetNobilvaEventsOptions {
  startDateStr: string;
  limit?: number;
}

export async function getNobilvaEvents(
  opts: GetNobilvaEventsOptions,
): Promise<QueryDocumentSnapshot[]> {
  const now = Date.now();
  const limit = opts.limit ?? DEFAULT_LIMIT;

  if (
    cache &&
    cache.startDateStr === opts.startDateStr &&
    cache.limit === limit &&
    cache.expiresAt > now
  ) {
    return cache.docs;
  }

  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection('nobilvaAnalytics')
    .where('date', '>=', opts.startDateStr)
    .limit(limit)
    .get();

  cache = {
    startDateStr: opts.startDateStr,
    limit,
    docs: snapshot.docs,
    expiresAt: now + CACHE_TTL_MS,
  };
  return snapshot.docs;
}

/** Firestore の RESOURCE_EXHAUSTED (code 8) を判別するユーティリティ */
export function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: number; message?: string };
  if (e.code === 8) return true;
  if (typeof e.message === 'string' && /quota.*exceeded/i.test(e.message)) {
    return true;
  }
  return false;
}
