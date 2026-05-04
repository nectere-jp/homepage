'use client';

import { useEffect, useState, useMemo } from 'react';
import { LuImage, LuTag, LuSearch, LuPlus, LuX, LuCheck, LuMerge, LuRefreshCw, LuTrash2 } from 'react-icons/lu';
import { adminFetch } from '@/lib/admin-fetch';
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { Modal } from "@/components/admin/Modal";

interface ImageAsset {
  path: string;
  tags: string[];
  aspect: 'thumbnail' | 'body';
  addedAt: string;
  usedIn?: string[];
  fileSize?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminImagesPage() {
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editTags, setEditTags] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<ImageAsset | null>(null);
  const [mergeTarget, setMergeTarget] = useState<ImageAsset | null>(null);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await adminFetch('/api/admin/image-assets');
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    assets.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (filterTag && !a.tags.includes(filterTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.path.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q));
      }
      return true;
    });
  }, [assets, search, filterTag]);

  const untagged = assets.filter((a) => a.tags.length === 0);

  const handleSaveTags = async (imagePath: string) => {
    const tags = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    await adminFetch('/api/admin/image-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-tags', path: imagePath, tags }),
    });
    setEditingPath(null);
    fetchAssets();
  };

  const handleRegisterAll = async () => {
    const res = await adminFetch('/api/admin/image-assets/register-all', { method: 'POST' });
    if (res.ok) {
      fetchAssets();
    }
  };

  const handleDelete = async (imagePath: string) => {
    if (!confirm('このアセットを削除しますか？（画像ファイルは残ります）')) return;
    await adminFetch('/api/admin/image-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', path: imagePath }),
    });
    setSelectedAsset(null);
    fetchAssets();
  };

  const handleMerge = async (keepPath: string, removePath: string) => {
    setProcessing(true);
    try {
      const res = await adminFetch('/api/admin/image-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge', keepPath, removePath }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`統合完了。${data.affected?.length || 0}件の記事を更新しました。`);
        setShowMergeModal(false);
        setMergeTarget(null);
        setSelectedAsset(null);
        fetchAssets();
      } else {
        alert('統合に失敗しました');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReplace = async (oldPath: string, file: File) => {
    setProcessing(true);
    try {
      // まず新画像をアップロード
      const formData = new FormData();
      formData.append('file', file);
      formData.append('aspect', selectedAsset?.aspect || 'body');
      formData.append('alt', selectedAsset?.tags[0] || '');
      const uploadRes = await adminFetch('/api/admin/upload/image', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) {
        alert('画像のアップロードに失敗しました');
        return;
      }
      const { url: newPath } = await uploadRes.json();

      // 記事内の参照を更新
      const res = await adminFetch('/api/admin/image-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'replace', oldPath, newPath }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`置き換え完了。${data.affected?.length || 0}件の記事を更新しました。`);
        setShowReplaceModal(false);
        setSelectedAsset(null);
        fetchAssets();
      } else {
        alert('置き換えに失敗しました');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" label="" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LuImage className="w-6 h-6" />
          画像アセット
        </h1>
        <button
          onClick={handleRegisterAll}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <LuPlus className="w-4 h-4" />
          未登録画像を一括登録
        </button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">総アセット数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assets.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">合計容量</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatFileSize(assets.reduce((sum, a) => sum + (a.fileSize || 0), 0))}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">タグ数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{allTags.length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${untagged.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
          <p className="text-xs text-gray-500">未タグ付け</p>
          <p className={`text-2xl font-bold mt-1 ${untagged.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{untagged.length}</p>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="パスやタグで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterTag('')}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                !filterTag ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  filterTag === tag ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((asset) => (
          <div
            key={asset.path}
            className={`group relative bg-white border rounded-xl overflow-hidden cursor-pointer transition-all ${
              selectedAsset?.path === asset.path ? 'ring-2 ring-primary border-primary' : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => setSelectedAsset(selectedAsset?.path === asset.path ? null : asset)}
          >
            <div className="aspect-video bg-gray-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.path} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-2 space-y-1">
              <div className="flex flex-wrap gap-1">
                {asset.tags.length === 0 ? (
                  <span className="text-[10px] text-amber-500 italic">未タグ付け</span>
                ) : (
                  asset.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))
                )}
                {asset.tags.length > 3 && (
                  <span className="text-[10px] text-gray-400">+{asset.tags.length - 3}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                {asset.fileSize != null && <span>{formatFileSize(asset.fileSize)}</span>}
                {asset.fileSize != null && asset.usedIn && asset.usedIn.length > 0 && <span>·</span>}
                {asset.usedIn && asset.usedIn.length > 0 && <span>{asset.usedIn.length}記事</span>}
              </div>
            </div>
            <span className={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded font-medium ${
              asset.aspect === 'thumbnail' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {asset.aspect === 'thumbnail' ? 'OGP' : '16:9'}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12 text-sm">アセットがありません</p>
      )}

      {/* 詳細パネル */}
      {selectedAsset && (
        <div className="fixed bottom-0 right-0 w-96 bg-white border-l border-t border-gray-200 rounded-tl-xl shadow-xl p-5 space-y-4 max-h-[60vh] overflow-y-auto z-50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">アセット詳細</h3>
            <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-gray-600">
              <LuX className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedAsset.path} alt="" className="w-full h-auto" />
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs">パス:</span>
              <p className="font-mono text-xs text-gray-700 break-all">{selectedAsset.path}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-gray-500 text-xs">タイプ:</span>
                <span className="ml-2 text-xs">{selectedAsset.aspect === 'thumbnail' ? 'サムネイル (OGP)' : '本文画像 (16:9)'}</span>
              </div>
              {selectedAsset.fileSize != null && (
                <div>
                  <span className="text-gray-500 text-xs">容量:</span>
                  <span className="ml-2 text-xs">{formatFileSize(selectedAsset.fileSize)}</span>
                </div>
              )}
            </div>
            <div>
              <span className="text-gray-500 text-xs">使用記事:</span>
              {selectedAsset.usedIn && selectedAsset.usedIn.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {selectedAsset.usedIn.map((slug) => (
                    <li key={slug} className="text-xs text-primary hover:underline">
                      <a href={`/admin/posts/${slug}`}>{slug}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 mt-1">未使用</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <LuTag className="w-3 h-3" />タグ:
                </span>
                {editingPath !== selectedAsset.path && (
                  <button
                    onClick={() => {
                      setEditingPath(selectedAsset.path);
                      setEditTags(selectedAsset.tags.join(', '));
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    編集
                  </button>
                )}
              </div>
              {editingPath === selectedAsset.path ? (
                <div className="mt-1 flex gap-1.5">
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="野球, 勉強机, 明るい"
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTags(selectedAsset.path); }}
                  />
                  <button
                    onClick={() => handleSaveTags(selectedAsset.path)}
                    className="px-2 py-1.5 bg-primary text-white rounded-lg text-xs"
                  >
                    <LuCheck className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedAsset.tags.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">なし</span>
                  ) : (
                    selectedAsset.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="border-t pt-3 space-y-2">
            <button
              type="button"
              onClick={() => setShowReplaceModal(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <LuRefreshCw className="w-3.5 h-3.5" />
              画像を置き換え（全記事反映）
            </button>
            <button
              type="button"
              onClick={() => {
                setMergeTarget(null);
                setShowMergeModal(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              <LuMerge className="w-3.5 h-3.5" />
              他のアセットと統合
            </button>
            <button
              type="button"
              onClick={() => handleDelete(selectedAsset.path)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              <LuTrash2 className="w-3.5 h-3.5" />
              アセット削除
            </button>
          </div>
        </div>
      )}

      {/* 置き換えモーダル */}
      {showReplaceModal && selectedAsset && (
        <ReplaceModal
          asset={selectedAsset}
          onReplace={(file) => handleReplace(selectedAsset.path, file)}
          onClose={() => setShowReplaceModal(false)}
          processing={processing}
        />
      )}

      {/* 統合モーダル */}
      {showMergeModal && selectedAsset && (
        <MergeModal
          keepAsset={selectedAsset}
          allAssets={assets.filter((a) => a.path !== selectedAsset.path)}
          onMerge={(removePath) => handleMerge(selectedAsset.path, removePath)}
          onClose={() => setShowMergeModal(false)}
          processing={processing}
        />
      )}
    </div>
  );
}

function ReplaceModal({
  asset,
  onReplace,
  onClose,
  processing,
}: {
  asset: ImageAsset;
  onReplace: (file: File) => Promise<void>;
  onClose: () => void;
  processing: boolean;
}) {
  return (
    <Modal isOpen onClose={onClose} title="画像を置き換え" maxWidth="max-w-md">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-20 h-14 rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.path} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-600 truncate">{asset.path}</p>
            {asset.usedIn && asset.usedIn.length > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">
                {asset.usedIn.length}件の記事で使用中 — すべて新画像に切り替わります
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">新しい画像をアップロード</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            disabled={processing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onReplace(file);
            }}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
          />
        </div>
        {processing && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <LoadingSpinner size="sm" label="" className="" />
            処理中...全記事の参照を更新しています
          </div>
        )}
      </div>
    </Modal>
  );
}

function MergeModal({
  keepAsset,
  allAssets,
  onMerge,
  onClose,
  processing,
}: {
  keepAsset: ImageAsset;
  allAssets: ImageAsset[];
  onMerge: (removePath: string) => Promise<void>;
  onClose: () => void;
  processing: boolean;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return allAssets;
    const q = search.toLowerCase();
    return allAssets.filter(
      (a) => a.path.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [allAssets, search]);

  return (
    <Modal isOpen onClose={onClose} title="アセットを統合" maxWidth="max-w-2xl">
      <div className="p-5 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>残すアセット</strong>（下の画像）を選択すると、そのアセットの記事参照をこちらに統合し、タグもマージします。
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-16 h-10 rounded border border-blue-200 overflow-hidden flex-shrink-0 bg-blue-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={keepAsset.path} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-mono text-blue-700 truncate">{keepAsset.path}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">統合する（削除される）アセットを選択</label>
          <input
            type="text"
            placeholder="パスやタグで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
          />
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {filtered.map((asset) => (
              <button
                key={asset.path}
                type="button"
                onClick={() => setSelected(asset.path)}
                className={`rounded-lg overflow-hidden border text-left transition-all ${
                  selected === asset.path
                    ? 'ring-2 ring-red-400 border-red-300'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.path} alt="" className="w-full h-full object-cover" />
                </div>
                {asset.tags.length > 0 && (
                  <div className="p-1 flex flex-wrap gap-0.5">
                    {asset.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[9px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-xs">該当するアセットがありません</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => selected && onMerge(selected)}
            disabled={!selected || processing}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50"
          >
            {processing ? '処理中...' : '統合を実行'}
          </button>
        </div>
        {processing && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <LoadingSpinner size="sm" label="" className="" />
            処理中...記事の参照を更新しています
          </div>
        )}
      </div>
    </Modal>
  );
}
