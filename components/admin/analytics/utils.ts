import type { RefCode } from "@/app/api/admin/ref-codes/route";
import { PAGE_LABELS } from "./labels";

// ── 共通ヘルパー（純粋関数は function 宣言のまま維持） ──

export function getPageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  // ブログ記事（旧 /ja/blog/*・新 /blog/* の両方を吸収）
  if (path.startsWith("/blog/")) return path.replace("/blog/", "blog/");
  if (path.startsWith("/ja/blog/")) return path.replace("/ja/blog/", "blog/");
  return path;
}

export function getSourceLabel(source: string, refCodes: RefCode[]): string {
  if (source.startsWith("ref:")) {
    const code = source.slice(4);
    const rc = refCodes.find((c) => c.code === code);
    return rc ? rc.label : `ref:${code}`;
  }
  return source;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "-";
  if (seconds < 60) return `${seconds}秒`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}時間${m % 60}分`;
  }
  return s > 0 ? `${m}分${s}秒` : `${m}分`;
}

// JST 固定で表示 (管理者が時差地域からアクセスしても JST ログと突き合わせられるようにする)
const JST_TIME_FMT = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const JST_TIME_SHORT_FMT = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const JST_DATE_SHORT_FMT = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
});

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // "10/26 14:23" (ja-JP だと "10/26 14:23" になる)
  return JST_TIME_FMT.format(d).replace(/\s+/g, " ");
}

/** "HH:mm" (JST) */
export function formatTimeOnly(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return JST_TIME_SHORT_FMT.format(d);
}

/** "M/D" (JST) */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return JST_DATE_SHORT_FMT.format(d);
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── 共通型（タブ間で使い回す filter 値） ──

export type InternalFilter = "exclude" | "only" | "all";
