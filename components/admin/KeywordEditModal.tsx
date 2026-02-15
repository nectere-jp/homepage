'use client';

import { useState, useEffect } from 'react';
import { LuX, LuStar } from 'react-icons/lu';
import type { BusinessType } from '@/lib/blog';
import type { KeywordTier, WorkflowFlag } from '@/lib/keyword-manager';

interface TargetKeyword {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  currentRank: number | null;
  status: 'active' | 'paused' | 'achieved';
  assignedArticles?: string[];
  keywordTier?: KeywordTier;
  expectedRank?: number | null;
  cvr?: number | null;
  intentGroupId?: string | null;
  workflowFlag?: WorkflowFlag;
  pillarSlug?: string | null;
}

interface KeywordEditModalProps {
  keyword: TargetKeyword | null;
  onClose: () => void;
  onSave: () => void;
}

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: '翻訳',
  'web-design': 'Web制作',
  print: '印刷',
  nobilva: 'Nobilva',
  teachit: 'Teachit',
};

const KEYWORD_TIER_LABELS: Record<KeywordTier, string> = {
  big: 'ビッグ',
  middle: 'ミドル',
  longtail: 'ロングテール',
};

const WORKFLOW_FLAG_LABELS: Record<WorkflowFlag, string> = {
  pending: '待ち',
  to_create: '要作成',
  created: '作成済み',
  needs_update: '要更新',
  skip: '対応しない',
};

export function KeywordEditModal({ keyword, onClose, onSave }: KeywordEditModalProps) {
  const isNew = !keyword;
  const [formData, setFormData] = useState({
    keyword: keyword?.keyword || '',
    priority: keyword?.priority || 3,
    estimatedPv: keyword?.estimatedPv || 0,
    relatedBusiness: keyword?.relatedBusiness || [],
    relatedTags: keyword?.relatedTags?.join(', ') || '',
    currentRank: keyword?.currentRank?.toString() || '',
    status: keyword?.status || 'active',
    keywordTier: (keyword?.keywordTier || 'middle') as KeywordTier,
    expectedRank: keyword?.expectedRank ?? keyword?.currentRank ?? '',
    cvr: keyword?.cvr != null ? String(keyword.cvr * 100) : '',
    intentGroupId: keyword?.intentGroupId || '',
    workflowFlag: (keyword?.workflowFlag || (keyword?.assignedArticles?.length ? 'created' : 'pending')) as WorkflowFlag,
    pillarSlug: keyword?.pillarSlug || '',
  });
  const [saving, setSaving] = useState(false);
  const [intentGroups, setIntentGroups] = useState<{ id: string; keywords: string[] }[]>([]);
  const [pillarSlugs, setPillarSlugs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/keywords/intent-groups')
      .then((r) => r.json())
      .then((d) => d.groups && setIntentGroups(d.groups))
      .catch(() => {});
    fetch('/api/admin/keywords/pillar-cluster')
      .then((r) => r.json())
      .then((d) => d.pillars && setPillarSlugs(d.pillars.map((p: { slug: string }) => p.slug)))
      .catch(() => {});
  }, []);

  const handleBusinessToggle = (business: BusinessType) => {
    setFormData((prev) => ({
      ...prev,
      relatedBusiness: prev.relatedBusiness.includes(business)
        ? prev.relatedBusiness.filter((b) => b !== business)
        : [...prev.relatedBusiness, business],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cvrNum = formData.cvr ? parseFloat(formData.cvr) / 100 : null;
      const er = parseInt(String(formData.expectedRank), 10);
      const data = {
        ...formData,
        relatedTags: formData.relatedTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        currentRank: formData.currentRank ? parseInt(formData.currentRank) : null,
        estimatedPv: parseInt(formData.estimatedPv.toString()),
        keywordTier: formData.keywordTier,
        expectedRank: !isNaN(er) ? er : null,
        cvr: cvrNum != null && !isNaN(cvrNum) ? cvrNum : null,
        intentGroupId: formData.intentGroupId || null,
        workflowFlag: formData.workflowFlag,
        pillarSlug: formData.pillarSlug || null,
      };

      const url = isNew
        ? '/api/admin/keywords/master'
        : `/api/admin/keywords/master/${encodeURIComponent(formData.keyword)}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert(isNew ? 'キーワードを登録しました' : 'キーワードを更新しました');
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save keyword:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const renderPrioritySelector = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, priority: p as any }))}
            className={`p-3 rounded-lg border-2 transition-all ${
              formData.priority === p
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex gap-0.5">
              {[...Array(p)].map((_, i) => (
                <LuStar
                  key={i}
                  className={`w-5 h-5 ${
                    formData.priority >= p
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {isNew ? '新規キーワード登録' : 'キーワード編集'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LuX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* キーワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              キーワード <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isNew}
              value={formData.keyword}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, keyword: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              placeholder="例: 野球 勉強 両立"
            />
            {!isNew && (
              <p className="mt-1 text-sm text-gray-500">
                キーワードは編集できません
              </p>
            )}
          </div>

          {/* 重要度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              重要度 <span className="text-red-500">*</span>
            </label>
            {renderPrioritySelector()}
          </div>

          {/* 想定PV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              想定月間PV数
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimatedPv}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedPv: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例: 5000"
            />
          </div>

          {/* 関連事業 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              関連事業 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleBusinessToggle(key as BusinessType)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    formData.relatedBusiness.includes(key as BusinessType)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 関連タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              関連タグ（カンマ区切り）
            </label>
            <input
              type="text"
              value={formData.relatedTags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, relatedTags: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例: 野球, 勉強両立, 時間管理"
            />
            <p className="mt-1 text-sm text-gray-500">
              複数のタグをカンマで区切って入力してください
            </p>
          </div>

          {/* キーワード階層 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              キーワード階層
            </label>
            <div className="flex gap-2">
              {(['big', 'middle', 'longtail'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, keywordTier: tier }))
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.keywordTier === tier
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {KEYWORD_TIER_LABELS[tier]}
                </button>
              ))}
            </div>
          </div>

          {/* 予想検索順位・CVR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                予想検索順位
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.expectedRank}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expectedRank: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例: 5"
              />
              <p className="mt-1 text-xs text-gray-500">
                CTRは自動算出されます
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVR（%）
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.cvr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cvr: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例: 2"
              />
            </div>
          </div>

          {/* 現在の順位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              現在の検索順位（実測）
            </label>
            <input
              type="number"
              min="1"
              value={formData.currentRank}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currentRank: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例: 15"
            />
          </div>

          {/* 意図グループ・ピラー */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                意図グループID
              </label>
              <input
                type="text"
                value={formData.intentGroupId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    intentGroupId: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例: sports-recommendation-grade"
                list="intent-group-list"
              />
              <datalist id="intent-group-list">
                {intentGroups.map((g) => (
                  <option key={g.id} value={g.id} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-gray-500">
                同じ趣旨のワードをまとめます
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                所属ピラー（クラスター時）
              </label>
              <select
                value={formData.pillarSlug || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pillarSlug: e.target.value || null,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">未設定</option>
                {pillarSlugs.map((slug) => (
                  <option key={slug} value={slug}>
                    {slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ワークフローフラグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ワークフローフラグ
            </label>
            <select
              value={formData.workflowFlag}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  workflowFlag: e.target.value as WorkflowFlag,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {(Object.entries(WORKFLOW_FLAG_LABELS) as [WorkflowFlag, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as any }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="active">稼働中</option>
              <option value="paused">一時停止</option>
              <option value="achieved">達成</option>
            </select>
          </div>

          {/* ボタン */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving || !formData.keyword || formData.relatedBusiness.length === 0}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : isNew ? '登録' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
