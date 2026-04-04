import { getIdToken } from '@/lib/firebase/auth';

/**
 * Admin API 用の fetch ラッパー。
 * Firebase IDトークンを Authorization ヘッダーに自動付与する。
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
