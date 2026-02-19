/**
 * クライアント・サーバー両方で使える純粋な計算のみ。
 * fs/blog に依存しないため Client Component から import 可能。
 */

/** Google Organic SERP CTR 曲線（First Page Sage 2026 等を参考） */
const CTR_BY_RANK: Record<number, number> = {
  1: 0.398,
  2: 0.187,
  3: 0.102,
  4: 0.072,
  5: 0.051,
  6: 0.044,
  7: 0.03,
  8: 0.021,
  9: 0.019,
  10: 0.016,
};

/**
 * 検索順位から CTR を算出（Google Organic SERP CTR 曲線）
 * 11位以降は指数減衰で近似
 */
export function getCTRByRank(rank: number): number {
  if (rank < 1) return 0;
  if (rank <= 10) return CTR_BY_RANK[rank] ?? 0;
  return 0.016 * Math.pow(0.85, rank - 10);
}

/**
 * 事業インパクトを算出（estimatedPv × CTR × CVR）
 * 単位: 想定コンバージョン数/月
 */
export function calculateBusinessImpact(kw: {
  estimatedPv: number;
  expectedRank?: number | null;
  cvr?: number | null;
}): number {
  const rank = kw.expectedRank ?? null;
  const cvr = kw.cvr ?? 0;

  if (rank == null || rank < 1 || cvr <= 0) return 0;

  const ctr = getCTRByRank(rank);
  return Math.round(kw.estimatedPv * ctr * cvr);
}
