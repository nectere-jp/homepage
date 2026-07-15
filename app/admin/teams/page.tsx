"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import type { Team, TeamEndorsement } from "@/lib/teams";
import type { TeamStats } from "@/app/api/admin/teams/analytics/route";

type Tab = "list" | "create" | "edit" | "analytics";

interface AnalyticsMap {
  [slug: string]: TeamStats;
}

export default function AdminTeamsPage() {
  const [tab, setTab] = useState<Tab>("list");
  const [teams, setTeams] = useState<Team[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsMap>({});
  const [loading, setLoading] = useState(true);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [teamsRes, analyticsRes] = await Promise.all([
      adminFetch("/api/admin/teams"),
      adminFetch("/api/admin/teams/analytics"),
    ]);

    if (teamsRes.ok) {
      const data = await teamsRes.json();
      setTeams(data.teams);
    }
    if (analyticsRes.ok) {
      const data = await analyticsRes.json();
      const map: AnalyticsMap = {};
      for (const s of data.analytics as TeamStats[]) {
        map[s.slug] = s;
      }
      setAnalytics(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setTab("edit");
  };

  const tabLabels: Record<string, string> = {
    list: "一覧",
    create: "新規作成",
    analytics: "アナリティクス",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          チーム管理
        </h1>
        <div className="flex gap-2">
          {(["list", "create", "analytics"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : tab === "list" ? (
        <TeamList
          teams={teams}
          analytics={analytics}
          onRefresh={fetchData}
          onEdit={handleEdit}
        />
      ) : tab === "create" ? (
        <TeamForm
          onDone={() => {
            setTab("list");
            fetchData();
          }}
        />
      ) : tab === "edit" && editingTeam ? (
        <TeamForm
          team={editingTeam}
          onDone={() => {
            setEditingTeam(null);
            setTab("list");
            fetchData();
          }}
        />
      ) : (
        <TeamAnalytics
          teams={teams}
          analytics={analytics}
          detailSlug={detailSlug}
          setDetailSlug={setDetailSlug}
        />
      )}
    </div>
  );
}

// ---------- Team List ----------

function TeamList({
  teams,
  analytics,
  onRefresh,
  onEdit,
}: {
  teams: Team[];
  analytics: AnalyticsMap;
  onRefresh: () => void;
  onEdit: (team: Team) => void;
}) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const copyURL = (slug: string) => {
    const url = `${window.location.origin}/ja/services/nobilva/teams/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const toggleActive = async (team: Team) => {
    await adminFetch("/api/admin/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: team.slug,
        updates: { active: !team.active },
      }),
    });
    onRefresh();
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        まだチームページがありません。「新規作成」タブから作成してください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => {
        const stats = analytics[team.slug];
        return (
          <div
            key={team.slug}
            className={`bg-white rounded-2xl shadow-soft p-6 border ${
              team.active ? "border-transparent" : "border-gray-300 opacity-60"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {team.teamName}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {team.category}
                  </span>
                  {team.offerVariant === "A" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      🎁 モニター (A)
                    </span>
                  )}
                  {team.offerVariant === "B" && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      🛡️ オール3保証 (B)
                    </span>
                  )}
                  {(!team.offerVariant || team.offerVariant === "C") && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      オファーなし (C)
                    </span>
                  )}
                  {!team.active && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      無効
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  /{team.slug} | 特別価格: {team.specialPrice.toLocaleString()}円
                  (通常 {team.normalPrice.toLocaleString()}円)
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.pageViews ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">閲覧</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-nobilva-accent">
                    {stats?.ctaClicks ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">CTA</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.signups ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">申込</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(team)}
                  className="px-3 py-2 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => copyURL(team.slug)}
                  className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedSlug === team.slug ? "コピー済み!" : "URL コピー"}
                </button>
                <button
                  onClick={() => toggleActive(team)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    team.active
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {team.active ? "無効化" : "有効化"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Team Form (Create / Edit) ----------

function TeamForm({
  team,
  onDone,
}: {
  team?: Team;
  onDone: () => void;
}) {
  const isEdit = !!team;

  const [form, setForm] = useState({
    teamName: team?.teamName ?? "",
    slug: team?.slug ?? "",
    category: (team?.category ?? "中学硬式") as Team["category"],
    specialPrice: team?.specialPrice ?? 15000,
    normalPrice: team?.normalPrice ?? 18000,
    basicSpecialPrice: team?.basicSpecialPrice ?? 23000,
    basicNormalPrice: team?.basicNormalPrice ?? 26000,
    discountLabel: team?.discountLabel ?? "",
    contactPerson: team?.contactPerson ?? "",
    permissionPerson: team?.permissionPerson ?? "",
    logoUrl: team?.logoUrl ?? "",
    heroImageUrl: team?.heroImageUrl ?? "",
    note: team?.note ?? "",
    endorsements: (team?.endorsements ?? []) as TeamEndorsement[],
    offerVariant: (team?.offerVariant ?? "C") as "A" | "B" | "C",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate discountLabel
  useEffect(() => {
    const diff = form.normalPrice - form.specialPrice;
    if (diff > 0) {
      setForm((f) => ({
        ...f,
        discountLabel: `チーム特別割引 ${diff.toLocaleString()}円OFF`,
      }));
    }
  }, [form.normalPrice, form.specialPrice]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const { slug: _slug, ...updates } = form;
        const res = await adminFetch("/api/admin/teams", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: team.slug, updates }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "更新に失敗しました");
        }
      } else {
        const res = await adminFetch("/api/admin/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, active: true }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "作成に失敗しました");
        }
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setSubmitting(false);
    }
  };

  const isValid = form.teamName && form.slug && form.specialPrice > 0;

  return (
    <div className="max-w-2xl bg-white rounded-2xl shadow-soft p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onDone}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; 戻る
        </button>
        <h2 className="text-lg font-bold text-gray-900">
          {isEdit ? `${team.teamName} を編集` : "新しいチームページを作成"}
        </h2>
      </div>

      <div className="space-y-5">
        {/* Team name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            チーム名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="桜ヶ丘リトルシニア"
            value={form.teamName}
            onChange={(e) => setForm({ ...form, teamName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            URL スラッグ <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">/teams/</span>
            {isEdit ? (
              <span className="flex-1 px-4 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-lg">
                {form.slug}
              </span>
            ) : (
              <input
                type="text"
                placeholder="sakura-senior"
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ""),
                  })
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>
          {isEdit ? (
            <p className="text-xs text-gray-400 mt-1">
              スラッグは変更できません
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              英小文字・数字・ハイフンのみ
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            カテゴリ
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as Team["category"] })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="中学硬式">中学硬式</option>
            <option value="中学軟式">中学軟式</option>
            <option value="高校">高校</option>
            <option value="その他">その他</option>
          </select>
        </div>

        {/* Pricing: プランごとに設定 */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">
              エッセンシャルプラン価格
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  通常価格（円/月）
                </label>
                <input
                  type="number"
                  value={form.normalPrice}
                  onChange={(e) =>
                    setForm({ ...form, normalPrice: Number(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  チーム特別価格（円/月）
                </label>
                <input
                  type="number"
                  value={form.specialPrice}
                  onChange={(e) =>
                    setForm({ ...form, specialPrice: Number(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">
              ベーシックプラン価格
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  通常価格（円/月）
                </label>
                <input
                  type="number"
                  value={form.basicNormalPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      basicNormalPrice: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  チーム特別価格（円/月）
                </label>
                <input
                  type="number"
                  value={form.basicSpecialPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      basicSpecialPrice: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Discount label */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            割引ラベル
          </label>
          <input
            type="text"
            value={form.discountLabel}
            onChange={(e) =>
              setForm({ ...form, discountLabel: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Contact person */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            紹介者名（任意）
          </label>
          <input
            type="text"
            placeholder="山田監督"
            value={form.contactPerson}
            onChange={(e) =>
              setForm({ ...form, contactPerson: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Permission person */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            配信許可者名（任意）
          </label>
          <input
            type="text"
            placeholder="福田事務局長"
            value={form.permissionPerson}
            onChange={(e) =>
              setForm({ ...form, permissionPerson: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-400 mt-1">
            「○○様に許可をいただいて配信しております」と表示されます
          </p>
        </div>

        {/* Offer variant */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            オファータイプ
          </label>
          <div className="grid grid-cols-1 gap-2">
            {(
              [
                {
                  value: "A",
                  title: "🎁 A: モニター型",
                  desc: "全員 初月無料 + 翌学期末までチーム特別価格からさらに月3,000円割引",
                },
                {
                  value: "B",
                  title: "🛡️ B: オール3保証型",
                  desc: "ベーシックプラン限定。オール3が取れなければ、対象学期の月額を全額返金",
                },
                {
                  value: "C",
                  title: "オファーなし",
                  desc: "チーム限定価格のみ適用。オファー帯は表示しません",
                },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                htmlFor={`offer-variant-${opt.value}`}
                className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  form.offerVariant === opt.value
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  id={`offer-variant-${opt.value}`}
                  name="offerVariant"
                  value={opt.value}
                  checked={form.offerVariant === opt.value}
                  onChange={() =>
                    setForm({ ...form, offerVariant: opt.value })
                  }
                  className="mt-1 accent-yellow-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">
                    {opt.title}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Logo upload */}
        <TeamLogoUpload
          value={form.logoUrl}
          onChange={(url) => setForm({ ...form, logoUrl: url })}
        />

        {/* Hero image upload */}
        <TeamHeroImageUpload
          value={form.heroImageUrl}
          onChange={(url) => setForm({ ...form, heroImageUrl: url })}
        />

        {/* Endorsements */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            推薦コメント（任意・複数可）
          </label>
          <p className="text-xs text-gray-400 mb-3">
            監督・コーチ・保護者代表など、チーム関係者からのコメントを追加できます。
          </p>
          {form.endorsements.map((e, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-500">コメント {i + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      endorsements: form.endorsements.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="名前（例: 山田監督）"
                  value={e.name}
                  onChange={(ev) => {
                    const updated = [...form.endorsements];
                    updated[i] = { ...updated[i], name: ev.target.value };
                    setForm({ ...form, endorsements: updated });
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="肩書（例: 監督 / 保護者代表）"
                  value={e.title}
                  onChange={(ev) => {
                    const updated = [...form.endorsements];
                    updated[i] = { ...updated[i], title: ev.target.value };
                    setForm({ ...form, endorsements: updated });
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <textarea
                rows={2}
                placeholder="コメント内容"
                value={e.comment}
                onChange={(ev) => {
                  const updated = [...form.endorsements];
                  updated[i] = { ...updated[i], comment: ev.target.value };
                  setForm({ ...form, endorsements: updated });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-2"
              />
              <EndorsementImageUpload
                value={e.imageUrl ?? ""}
                onChange={(url) => {
                  const updated = [...form.endorsements];
                  updated[i] = { ...updated[i], imageUrl: url };
                  setForm({ ...form, endorsements: updated });
                }}
                index={i}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                endorsements: [
                  ...form.endorsements,
                  { name: "", title: "", comment: "" },
                ],
              })
            }
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            + コメントを追加
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className={`w-full font-bold py-3 px-6 rounded-xl transition-colors ${
            isValid && !submitting
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting
            ? isEdit ? "保存中..." : "作成中..."
            : isEdit ? "変更を保存" : "チームページを作成"}
        </button>
      </div>
    </div>
  );
}

// ---------- Team Analytics ----------

function TeamAnalytics({
  teams,
  analytics,
  detailSlug,
  setDetailSlug,
}: {
  teams: Team[];
  analytics: AnalyticsMap;
  detailSlug: string | null;
  setDetailSlug: (slug: string | null) => void;
}) {
  if (detailSlug) {
    const team = teams.find((t) => t.slug === detailSlug);
    const stats = analytics[detailSlug];
    if (!team) return null;

    // Sort daily data by date descending
    const dailyEntries = stats?.daily
      ? Object.entries(stats.daily).sort(([a], [b]) => b.localeCompare(a))
      : [];

    return (
      <div>
        <button
          onClick={() => setDetailSlug(null)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          &larr; 一覧に戻る
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {team.teamName} のアナリティクス
        </h2>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {stats?.pageViews ?? 0}
            </p>
            <p className="text-sm text-gray-500">ページ閲覧数</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl font-bold text-nobilva-accent">
              {stats?.ctaClicks ?? 0}
            </p>
            <p className="text-sm text-gray-500">CTA クリック数</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats?.signups ?? 0}
            </p>
            <p className="text-sm text-gray-500">申込数</p>
          </div>
        </div>

        {/* Conversion rate */}
        {(stats?.pageViews ?? 0) > 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              コンバージョン率
            </h3>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    ((stats?.ctaClicks ?? 0) / stats!.pageViews) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">閲覧 → CTA</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    ((stats?.signups ?? 0) / stats!.pageViews) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">閲覧 → 申込</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily breakdown */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">日別推移</h3>
          {dailyEntries.length === 0 ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500">日付</th>
                  <th className="text-right py-2 text-gray-500">閲覧</th>
                  <th className="text-right py-2 text-gray-500">CTA</th>
                  <th className="text-right py-2 text-gray-500">申込</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.map(([date, d]) => (
                  <tr key={date} className="border-b border-gray-50">
                    <td className="py-2 text-gray-700">{date}</td>
                    <td className="py-2 text-right text-gray-900">
                      {d.pageViews}
                    </td>
                    <td className="py-2 text-right text-nobilva-accent font-medium">
                      {d.ctaClicks}
                    </td>
                    <td className="py-2 text-right text-green-600 font-medium">
                      {d.signups}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Overview table
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        チーム名をクリックで詳細を表示します。
      </p>
      {teams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          チームがありません
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-500">
                  チーム名
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  閲覧
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  CTA
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  申込
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  CVR
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const stats = analytics[team.slug];
                const pv = stats?.pageViews ?? 0;
                const cvr = pv > 0 ? ((stats?.signups ?? 0) / pv) * 100 : 0;
                return (
                  <tr
                    key={team.slug}
                    onClick={() => setDetailSlug(team.slug)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium text-gray-900">
                        {team.teamName}
                      </span>
                      {!team.active && (
                        <span className="ml-2 text-xs text-red-500">
                          (無効)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right text-gray-700">{pv}</td>
                    <td className="p-4 text-right text-nobilva-accent font-medium">
                      {stats?.ctaClicks ?? 0}
                    </td>
                    <td className="p-4 text-right text-green-600 font-medium">
                      {stats?.signups ?? 0}
                    </td>
                    <td className="p-4 text-right text-gray-700">
                      {cvr.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- Endorsement Image Upload ----------

function EndorsementImageUpload({
  value,
  onChange,
  index,
}: {
  value: string;
  onChange: (url: string) => void;
  index: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error, upload } = useImageUpload();
  const inputId = `endorsement-image-${index}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, { dir: "teams" });
    if (url) onChange(url);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      {/* Preview (4:3 rectangle, matches display) */}
      <div className="flex-shrink-0 w-16 aspect-[4/3] rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <svg
            className="w-1/2 h-1/2 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 cursor-pointer"
        >
          {uploading ? "..." : value ? "画像を変更" : "画像をアップロード"}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-gray-600 hover:text-gray-800 underline"
          >
            クリア
          </button>
        )}
        {error && (
          <p className="text-xs text-red-600 w-full">{error}</p>
        )}
      </div>
    </div>
  );
}

// ---------- Team Logo Upload ----------

function TeamLogoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error, upload } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, { dir: "teams" });
    if (url) onChange(url);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        チームロゴ（任意）
      </label>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="flex-shrink-0 w-20 h-20 rounded-lg border border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="ロゴ" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-gray-400">未設定</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="team-logo-upload"
            />
            <label
              htmlFor="team-logo-upload"
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer"
            >
              {uploading ? "アップロード中..." : "ロゴをアップロード"}
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                クリア
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamHeroImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error, upload } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, { dir: "teams" });
    if (url) onChange(url);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = value || "/images/nobilva/hero_transparent.png";
  const isDefault = !value;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        Hero 切り抜き画像（任意）
      </label>
      <p className="text-xs text-gray-400 mb-2">
        ページ上部の右側に表示される選手画像。未設定時はデフォルト画像を使用します。透過 PNG 推奨。
      </p>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="flex-shrink-0 w-24 h-32 rounded-lg border border-gray-300 bg-nobilva-main overflow-hidden flex items-center justify-center relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Hero 画像プレビュー"
            className="w-full h-full object-contain object-right-bottom"
          />
          {isDefault && (
            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
              デフォルト
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="team-hero-upload"
            />
            <label
              htmlFor="team-hero-upload"
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer"
            >
              {uploading ? "アップロード中..." : "Hero 画像をアップロード"}
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                デフォルトに戻す
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
