"use client";

import { useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import type { SourceSummary } from "@/app/api/admin/analytics/route";
import type { RefCode } from "@/app/api/admin/ref-codes/route";
import { TARGET_PATH_OPTIONS } from "./labels";
import { downloadJson, todayStr, type InternalFilter } from "./utils";

interface RefManagementTabProps {
  refCodes: RefCode[];
  onRefCodesChange: (codes: RefCode[]) => void;
  sources: SourceSummary[];
  days: number;
  internalFilter: InternalFilter;
}

export const RefManagementTab = ({
  refCodes,
  onRefCodesChange,
  sources,
  days,
  internalFilter,
}: RefManagementTabProps) => {
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState(TARGET_PATH_OPTIONS[0].value);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const confirm = useConfirm();

  const sourceMap = new Map(
    sources.filter((s) => s.type === "ref").map((s) => [s.source.slice(4), s])
  );

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    setCreating(true);
    const res = await adminFetch("/api/admin/ref-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim(), targetPath: newPath }),
    });
    if (res.ok) {
      const created = await res.json();
      onRefCodesChange([
        { ...created, createdAt: new Date().toISOString() },
        ...refCodes,
      ]);
      setNewLabel("");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "リファラルコードを削除",
      description: "このコードを削除しますか？",
      confirmLabel: "削除",
      variant: "danger",
    });
    if (!ok) return;
    const res = await adminFetch("/api/admin/ref-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      onRefCodesChange(refCodes.filter((c) => c.id !== id));
    }
  };

  const buildUrl = (code: string, targetPath: string) =>
    `https://www.nectere.jp${targetPath}?ref=${code}`;

  const handleCopy = async (code: string, targetPath: string) => {
    const url = buildUrl(code, targetPath);
    await navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleExport = () => {
    downloadJson(`nobilva-analytics-refcodes-${todayStr()}.json`, {
      meta: {
        tab: "refcodes",
        generatedAt: new Date().toISOString(),
        rangeDays: days,
        internalFilter,
      },
      refCodes: refCodes.map((rc) => {
        const stats = sourceMap.get(rc.code);
        return {
          id: rc.id,
          code: rc.code,
          label: rc.label,
          targetPath: rc.targetPath,
          createdAt: rc.createdAt,
          url: buildUrl(rc.code, rc.targetPath),
          stats: stats
            ? {
                sessions: stats.sessions,
                pageViews: stats.pageViews,
                ctaClicks: stats.ctaClicks,
                diagnosisStarts: stats.diagnosisStarts,
                diagnosisCompletes: stats.diagnosisCompletes,
                cvRate:
                  stats.sessions > 0
                    ? Number(
                        ((stats.diagnosisCompletes / stats.sessions) * 100).toFixed(2)
                      )
                    : 0,
              }
            : null,
        };
      }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={refCodes.length === 0}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          JSON ダウンロード
        </button>
      </div>

      {/* 新規作成 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">リファラルコード作成</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="メモ (例: Instagram プロフ, 保護者配布QR)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <select
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {TARGET_PATH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={creating || !newLabel.trim()}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? "作成中..." : "コード生成"}
          </button>
        </div>
      </div>

      {/* コード一覧 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">コード一覧</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">コード</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">メモ</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">遷移先</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CV</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {refCodes.map((rc) => {
                const stats = sourceMap.get(rc.code);
                return (
                  <tr key={rc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {rc.code}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-700">{rc.label}</td>
                    <td className="py-2 px-2 text-gray-500 text-xs">
                      {TARGET_PATH_OPTIONS.find((o) => o.value === rc.targetPath)?.label ||
                        rc.targetPath}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-900">
                      {stats?.sessions || 0}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {(stats?.diagnosisCompletes || 0) > 0 ? (
                        <span className="text-green-600">{stats!.diagnosisCompletes}</span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <Link
                          href={`/admin/analytics?tab=sessions&source=${encodeURIComponent(`ref:${rc.code}`)}`}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                        >
                          セッション
                        </Link>
                        <button
                          onClick={() => handleCopy(rc.code, rc.targetPath)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                        >
                          {copied === rc.code ? "Copied!" : "URL"}
                        </button>
                        <button
                          onClick={() => handleDelete(rc.id)}
                          className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {refCodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    コードがまだありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
