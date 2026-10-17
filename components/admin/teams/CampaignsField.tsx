"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { TeamCampaign } from "@/lib/teams";

interface Props {
  teamSlug: string;
  teamName: string;
  campaigns: TeamCampaign[];
  onChange: (next: TeamCampaign[]) => void;
}

type DraftState = {
  slug: string;
  label: string;
  distributedAt: string;
  description: string;
  active: boolean;
  /** 編集中かどうか。null = フォーム非表示、空文字 = 新規作成、slug文字列 = 既存の編集 */
  mode: "new" | "edit" | null;
  originalSlug: string | null;
};

const EMPTY_DRAFT: DraftState = {
  slug: "",
  label: "",
  distributedAt: "",
  description: "",
  active: true,
  mode: null,
  originalSlug: null,
};

function buildCampaignUrl(teamSlug: string, campaignSlug: string): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  return `${origin}/ja/services/nobilva/teams/${teamSlug}?c=${campaignSlug}`;
}

export const CampaignsField = ({ teamSlug, teamName, campaigns, onChange }: Props) => {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const openNew = () => {
    setError(null);
    setDraft({ ...EMPTY_DRAFT, mode: "new" });
  };

  const openEdit = (c: TeamCampaign) => {
    setError(null);
    setDraft({
      slug: c.slug,
      label: c.label,
      distributedAt: c.distributedAt ?? "",
      description: c.description ?? "",
      active: c.active,
      mode: "edit",
      originalSlug: c.slug,
    });
  };

  const cancelDraft = () => {
    setDraft(EMPTY_DRAFT);
    setError(null);
  };

  const submitDraft = async () => {
    setError(null);

    const slug = draft.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!slug) {
      setError("slug は必須です");
      return;
    }
    if (!draft.label.trim()) {
      setError("ラベルは必須です");
      return;
    }

    // 新規作成時の slug 重複チェック（既存に同 slug が存在する & 編集元 slug と違う場合）
    const dupe = campaigns.find((c) => c.slug === slug);
    if (dupe && draft.mode === "new") {
      setError(`slug「${slug}」は既に存在します`);
      return;
    }
    if (dupe && draft.mode === "edit" && draft.originalSlug !== slug) {
      setError(`slug「${slug}」は既に存在します`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/teams/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamSlug,
          campaign: {
            slug,
            label: draft.label.trim(),
            distributedAt: draft.distributedAt || undefined,
            description: draft.description.trim() || undefined,
            active: draft.active,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }
      const data = await res.json();
      const saved: TeamCampaign = data.campaign;

      let next: TeamCampaign[];
      if (draft.mode === "edit" && draft.originalSlug && draft.originalSlug !== saved.slug) {
        // slug 自体を変更したケースは原則起きないが、API は upsert なので保険で両方除外
        next = campaigns
          .filter((c) => c.slug !== draft.originalSlug && c.slug !== saved.slug)
          .concat(saved);
      } else {
        const exists = campaigns.some((c) => c.slug === saved.slug);
        next = exists
          ? campaigns.map((c) => (c.slug === saved.slug ? saved : c))
          : campaigns.concat(saved);
      }
      onChange(next);
      cancelDraft();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const removeCampaign = async (campaignSlug: string) => {
    if (!confirm(`「${campaignSlug}」を削除します。計測履歴は残ります。よろしいですか？`)) {
      return;
    }
    try {
      const res = await adminFetch("/api/admin/teams/campaigns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamSlug, campaignSlug }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }
      onChange(campaigns.filter((c) => c.slug !== campaignSlug));
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };

  const copyUrl = async (campaignSlug: string) => {
    const url = buildCampaignUrl(teamSlug, campaignSlug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(campaignSlug);
      setTimeout(() => setCopiedSlug((cur) => (cur === campaignSlug ? null : cur)), 1500);
    } catch {
      // noop
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">配布経路（キャンペーン）</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {teamName}向けに発行する `?c=xxx` 付きURL。チラシ・LINE・口頭など配布先ごとに分けると流入が追えます。
          </p>
        </div>
        {draft.mode === null && (
          <button
            type="button"
            onClick={openNew}
            className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            + 追加
          </button>
        )}
      </div>

      {campaigns.length === 0 && draft.mode !== "new" && (
        <p className="text-xs text-gray-400 py-6 text-center">
          まだ配布経路がありません。「+ 追加」から作成してください。
        </p>
      )}

      {campaigns.length > 0 && (
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-md overflow-hidden">
          {campaigns.map((c) => (
            <div
              key={c.slug}
              className="flex items-center gap-3 px-3 py-2.5 bg-white"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono text-gray-900">{c.slug}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      c.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {c.active ? "active" : "停止"}
                  </span>
                  {c.distributedAt && (
                    <span className="text-[10px] text-gray-500">
                      配布 {c.distributedAt}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 mt-0.5 truncate">{c.label}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => copyUrl(c.slug)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="URL をコピー"
                >
                  {copiedSlug === c.slug ? "✓ コピー済" : "URLコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => removeCampaign(c.slug)}
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft.mode !== null && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-xs font-bold text-gray-900 mb-3">
            {draft.mode === "edit" ? "配布経路を編集" : "新しい配布経路"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="20260517-flyer"
                value={draft.slug}
                disabled={draft.mode === "edit"}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                英小文字・数字・ハイフン。編集時は変更不可
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                配布日
              </label>
              <input
                type="date"
                value={draft.distributedAt}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, distributedAt: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ラベル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="5/17 配布チラシ"
              value={draft.label}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              メモ（任意）
            </label>
            <textarea
              rows={2}
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
              className="accent-primary"
            />
            有効（無効にすると `?c=xxx` を無視して計測）
          </label>

          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={cancelDraft}
              disabled={submitting}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={submitDraft}
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 transition-colors"
            >
              {submitting ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
