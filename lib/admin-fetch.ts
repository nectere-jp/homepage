import { getIdToken } from '@/lib/firebase/auth';

/**
 * Admin API 用の fetch ラッパー。
 * Firebase IDトークンを Authorization ヘッダーに自動付与する。
 *
 * 401/403 を受けた場合、トークンを強制 refresh してもう 1 回だけ再試行する。
 * ID トークンは 1 時間で失効するため、長時間開きっぱなしの admin タブで
 * 「次の操作が突然 Forbidden になる」事故を自動復旧させるのが目的。
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const doFetch = async (forceRefresh: boolean): Promise<Response> => {
    const token = await getIdToken(forceRefresh);
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  };

  const first = await doFetch(false);
  if (first.status !== 401 && first.status !== 403) {
    return first;
  }

  // 401/403 のとき: トークンを refresh してもう一度だけ試す。
  // body は Response ストリームなので 1 回しか読めず、呼び出し側は再試行の有無を
  // 意識せずに扱える（成功した方の Response を返す）。
  const retried = await doFetch(true);
  return retried;
}
