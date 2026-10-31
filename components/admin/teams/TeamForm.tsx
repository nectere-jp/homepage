"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { Team, TeamEndorsement, TeamCampaign, OfferVariant } from "@/lib/teams";
import { TeamImageUpload } from "./TeamImageUpload";
import { DreaminaPromptHelper } from "./DreaminaPromptHelper";
import { EndorsementsField } from "./EndorsementsField";
import { CampaignsField } from "./CampaignsField";

interface TeamFormProps {
  team?: Team;
  onDone: () => void;
}

type FormState = {
  teamName: string;
  slug: string;
  category: Team["category"];
  specialPrice: number;
  normalPrice: number;
  basicSpecialPrice: number;
  basicNormalPrice: number;
  discountLabel: string;
  contactPerson: string;
  permissionPerson: string;
  logoUrl: string;
  heroImageUrl: string;
  note: string;
  endorsements: TeamEndorsement[];
  offerVariant: OfferVariant;
};

// ---------- Basic info section (name / slug / category) ----------

const BasicInfoSection = ({
  form,
  setForm,
  isEdit,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isEdit: boolean;
}) => (
  <>
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
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              })
            }
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {isEdit ? "スラッグは変更できません" : "英小文字・数字・ハイフンのみ"}
      </p>
    </div>

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
  </>
);

// ---------- Misc text fields (discount label / contact / permission) ----------

const MiscTextSection = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        割引ラベル
      </label>
      <input
        type="text"
        value={form.discountLabel}
        onChange={(e) => setForm({ ...form, discountLabel: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        紹介者名（任意）
      </label>
      <input
        type="text"
        placeholder="山田監督"
        value={form.contactPerson}
        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        配信許可者名（任意）
      </label>
      <input
        type="text"
        placeholder="福田事務局長"
        value={form.permissionPerson}
        onChange={(e) => setForm({ ...form, permissionPerson: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <p className="text-xs text-gray-400 mt-1">
        「○○様に許可をいただいて配信しております」と表示されます
      </p>
    </div>
  </>
);

// ---------- Pricing section ----------

const PricingSection = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => (
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
              setForm({ ...form, basicNormalPrice: Number(e.target.value) })
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
              setForm({ ...form, basicSpecialPrice: Number(e.target.value) })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  </div>
);

// ---------- Offer variant section ----------

const OFFER_OPTIONS = [
  {
    value: "A" as const,
    title: "🎁 A: モニター型",
    desc: "全員 初月無料 + 翌学期末までチーム特別価格からさらに月3,000円割引",
  },
  {
    value: "A2" as const,
    title: "🎁 A': モニター型（初月無料なし）",
    desc: "翌学期末までチーム特別価格からさらに月3,000円割引（初月無料はなし）",
  },
  {
    value: "B" as const,
    title: "🛡️ B: オール3保証型",
    desc: "ベーシックプラン限定。オール3が取れなければ、対象学期の月額を全額返金",
  },
  {
    value: "C" as const,
    title: "オファーなし",
    desc: "チーム限定価格のみ適用。オファー帯は表示しません",
  },
];

const OfferSection = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-900 mb-2">
      オファータイプ
    </label>
    <div className="grid grid-cols-1 gap-2">
      {OFFER_OPTIONS.map((opt) => (
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
            onChange={() => setForm({ ...form, offerVariant: opt.value })}
            className="mt-1 accent-yellow-500"
          />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 mb-0.5">
              {opt.title}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">{opt.desc}</p>
          </div>
        </label>
      ))}
    </div>
  </div>
);

// ---------- Main form ----------

export const TeamForm = ({ team, onDone }: TeamFormProps) => {
  const isEdit = !!team;

  const [form, setForm] = useState<FormState>({
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
    offerVariant: (team?.offerVariant ?? "C") as OfferVariant,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<TeamCampaign[]>(team?.campaigns ?? []);

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
        <BasicInfoSection form={form} setForm={setForm} isEdit={isEdit} />
        <PricingSection form={form} setForm={setForm} />
        <MiscTextSection form={form} setForm={setForm} />
        <OfferSection form={form} setForm={setForm} />

        <TeamImageUpload
          variant="logo"
          value={form.logoUrl}
          onChange={(url) => setForm({ ...form, logoUrl: url })}
        />

        <TeamImageUpload
          variant="hero"
          value={form.heroImageUrl}
          onChange={(url) => setForm({ ...form, heroImageUrl: url })}
        />
        <DreaminaPromptHelper />

        <EndorsementsField
          value={form.endorsements}
          onChange={(next) => setForm({ ...form, endorsements: next })}
        />

        {isEdit && team && (
          <CampaignsField
            teamSlug={team.slug}
            teamName={team.teamName}
            campaigns={campaigns}
            onChange={setCampaigns}
          />
        )}

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
            ? isEdit
              ? "保存中..."
              : "作成中..."
            : isEdit
              ? "変更を保存"
              : "チームページを作成"}
        </button>
      </div>
    </div>
  );
};
