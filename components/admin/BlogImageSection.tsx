'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { LuImage, LuCopy, LuCheck, LuSparkles, LuUpload, LuLibrary, LuRefreshCw } from 'react-icons/lu';
import { adminFetch } from '@/lib/admin-fetch';
import { uploadImage } from '@/lib/hooks/useImageUpload';
import { Modal } from '@/components/admin/Modal';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';

interface ImagePromptData {
  label: string;
  sceneDescription: string;
  fullPrompt: string;
  /** 生成時のplaceholderキーワード（マッチング用） */
  keywords?: string;
}

interface ParsedPlaceholder {
  alt: string;
  keywords: string;
  fullMatch: string;
}

interface PlacedImage {
  alt: string;
  url: string;
  fullMatch: string;
}

function parsePlaceholders(content: string): ParsedPlaceholder[] {
  const regex = /!\[([^\]]*)\]\(IMAGE_PLACEHOLDER:([^)]*)\)/g;
  const results: ParsedPlaceholder[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    results.push({ alt: match[1], keywords: match[2], fullMatch: match[0] });
  }
  return results;
}

function parsePlacedImages(content: string): PlacedImage[] {
  const regex = /!\[([^\]]*)\]\((\/images\/blog\/[^)]+)\)/g;
  const results: PlacedImage[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    results.push({ alt: match[1], url: match[2], fullMatch: match[0] });
  }
  return results;
}

interface BlogImageSectionProps {
  content: string;
  topic: string;
  clusterAxis?: string;
  /** edit: アップロードボタンあり、preview: コピーのみ */
  mode: 'edit' | 'preview';
  /** サムネイル画像パス（edit mode） */
  thumbnailValue?: string;
  /** サムネイル変更コールバック（edit mode） */
  onThumbnailChange?: (url: string) => void;
  /** 本文テキスト置換コールバック（edit mode） */
  onReplacePlaceholder?: (oldText: string, newMarkdown: string) => void;
}

export function BlogImageSection({
  content,
  topic,
  clusterAxis,
  mode,
  thumbnailValue,
  onThumbnailChange,
  onReplacePlaceholder,
}: BlogImageSectionProps) {
  const [loading, setLoading] = useState(false);
  const [thumbnailPrompt, setThumbnailPrompt] = useState<ImagePromptData | null>(null);
  const [bodyPrompts, setBodyPrompts] = useState<ImagePromptData[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [showLibrary, setShowLibrary] = useState<{
    type: 'thumbnail' | 'placeholder' | 'placed';
    key?: string;
    placeholder?: ParsedPlaceholder;
    placedImage?: PlacedImage;
  } | null>(null);

  const placeholders = useMemo(() => parsePlaceholders(content), [content]);
  const placedImages = useMemo(() => parsePlacedImages(content), [content]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      // placeholders + placedImages のキーワードをまとめて送る
      const allBodyPlaceholders = [
        ...placeholders.map((p) => ({ alt: p.alt, keywords: p.keywords })),
        ...placedImages.map((p) => ({ alt: p.alt, keywords: p.alt })),
      ];
      const response = await adminFetch('/api/admin/claude/generate-image-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          clusterAxis: clusterAxis || undefined,
          bodyPlaceholders: allBodyPlaceholders,
          content,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setThumbnailPrompt(data.thumbnail ?? null);
        setBodyPrompts(data.bodyImages ?? []);
      } else {
        alert('画像プロンプトの生成に失敗しました');
      }
    } catch {
      alert('画像プロンプトの生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleUploadForPlaceholder = async (file: File, placeholder: ParsedPlaceholder) => {
    const key = `ph-${placeholder.keywords}`;
    setUploadingIndex(key);
    try {
      const url = await uploadImage(file, { aspect: 'body', alt: placeholder.alt });
      const newMarkdown = `![${placeholder.alt}](${url})`;
      onReplacePlaceholder?.(placeholder.fullMatch, newMarkdown);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'アップロードに失敗しました');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleUploadForPlaced = async (file: File, placed: PlacedImage) => {
    const key = `pl-${placed.url}`;
    setUploadingIndex(key);
    try {
      const url = await uploadImage(file, { aspect: 'body', alt: placed.alt });
      const newMarkdown = `![${placed.alt}](${url})`;
      onReplacePlaceholder?.(placed.fullMatch, newMarkdown);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'アップロードに失敗しました');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleUploadThumbnail = async (file: File) => {
    setUploadingThumbnail(true);
    try {
      const url = await uploadImage(file, { aspect: 'thumbnail', alt: topic });
      onThumbnailChange?.(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'アップロードに失敗しました');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSelectFromLibrary = (url: string) => {
    if (!showLibrary) return;
    if (showLibrary.type === 'thumbnail') {
      onThumbnailChange?.(url);
    } else if (showLibrary.type === 'placeholder' && showLibrary.placeholder) {
      const newMarkdown = `![${showLibrary.placeholder.alt}](${url})`;
      onReplacePlaceholder?.(showLibrary.placeholder.fullMatch, newMarkdown);
    } else if (showLibrary.type === 'placed' && showLibrary.placedImage) {
      const newMarkdown = `![${showLibrary.placedImage.alt}](${url})`;
      onReplacePlaceholder?.(showLibrary.placedImage.fullMatch, newMarkdown);
    }
    setShowLibrary(null);
  };

  const findPromptForKeywords = (keywords: string): ImagePromptData | undefined => {
    return bodyPrompts.find((bp) => bp.keywords === keywords);
  };

  return (
    <>
    {showLibrary && (
      <ImageLibraryModal
        onSelect={handleSelectFromLibrary}
        onClose={() => setShowLibrary(null)}
        filterAspect={showLibrary.type === 'thumbnail' ? 'thumbnail' : 'body'}
      />
    )}
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <LuImage className="w-4 h-4" />
          記事画像
        </h4>
      </div>

      {/* ── サムネイル（edit mode） ── */}
      {mode === 'edit' && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              サムネイル（OGP）
            </span>
            {thumbnailPrompt && (
              <CopyButton
                text={thumbnailPrompt.fullPrompt}
                index={-1}
                copiedIndex={copiedIndex}
                onCopy={handleCopy}
              />
            )}
          </div>
          {thumbnailPrompt && (
            <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
              {thumbnailPrompt.fullPrompt}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1">
            {thumbnailValue && (
              <div className="w-16 h-16 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnailValue} alt="サムネ" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await handleUploadThumbnail(file);
                  if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  <LuUpload className="w-3 h-3" />
                  {uploadingThumbnail ? 'アップロード中...' : thumbnailValue ? 'サムネ変更' : 'アップロード'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLibrary({ type: 'thumbnail' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <LuLibrary className="w-3 h-3" />
                  ライブラリ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── サムネイル（preview mode: プロンプト生成後のみ） ── */}
      {mode === 'preview' && thumbnailPrompt && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {thumbnailPrompt.label}
            </span>
            <CopyButton
              text={thumbnailPrompt.fullPrompt}
              index={-1}
              copiedIndex={copiedIndex}
              onCopy={handleCopy}
            />
          </div>
          <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
            {thumbnailPrompt.fullPrompt}
          </p>
        </div>
      )}

      {/* ── 未配置の本文画像（プレースホルダー） ── */}
      {placeholders.length > 0 && (
        <div className="space-y-2">
          {placeholders.map((placeholder, i) => {
            const prompt = findPromptForKeywords(placeholder.keywords);
            const key = `ph-${placeholder.keywords}`;
            return (
              <div key={key} className="bg-white border border-amber-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700">
                    <span className="bg-amber-50 px-1.5 py-0.5 rounded mr-1.5">未配置</span>
                    {placeholder.alt}
                    <span className="ml-1.5 text-gray-400 font-mono text-[11px]">
                      ({placeholder.keywords})
                    </span>
                  </span>
                  {prompt && (
                    <CopyButton
                      text={prompt.fullPrompt}
                      index={i}
                      copiedIndex={copiedIndex}
                      onCopy={handleCopy}
                    />
                  )}
                </div>
                {prompt && (
                  <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
                    {prompt.fullPrompt}
                  </p>
                )}
                {mode === 'edit' && (
                  <ImageActions
                    uploadKey={key}
                    uploadingIndex={uploadingIndex}
                    fileInputRefs={fileInputRefs}
                    onUpload={(file) => handleUploadForPlaceholder(file, placeholder)}
                    onLibrary={() => setShowLibrary({ type: 'placeholder', key, placeholder })}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 配置済み本文画像 ── */}
      {placedImages.length > 0 && (
        <div className="space-y-2">
          {placedImages.map((placed, i) => {
            const prompt = findPromptForKeywords(placed.alt);
            const key = `pl-${placed.url}`;
            const promptIndex = placeholders.length + i;
            return (
              <div key={key} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">
                    <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded mr-1.5">配置済み</span>
                    {placed.alt || '(alt未設定)'}
                  </span>
                  {prompt && (
                    <CopyButton
                      text={prompt.fullPrompt}
                      index={promptIndex}
                      copiedIndex={copiedIndex}
                      onCopy={handleCopy}
                    />
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-24 h-14 rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={placed.url} alt={placed.alt} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-mono truncate">{placed.url}</p>
                    {prompt && (
                      <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap mt-1">
                        {prompt.fullPrompt}
                      </p>
                    )}
                  </div>
                </div>
                {mode === 'edit' && (
                  <ImageActions
                    uploadKey={key}
                    uploadingIndex={uploadingIndex}
                    fileInputRefs={fileInputRefs}
                    onUpload={(file) => handleUploadForPlaced(file, placed)}
                    onLibrary={() => setShowLibrary({ type: 'placed', key, placedImage: placed })}
                    replaceLabel
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Nanobanana プロンプト生成（任意） ── */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <LuSparkles className="w-3.5 h-3.5" />
          Nanobanana用プロンプト生成（任意）
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuSparkles className="w-3.5 h-3.5" />
          {loading ? '生成中...' : thumbnailPrompt || bodyPrompts.length > 0 ? '再生成' : 'プロンプト生成'}
        </button>
      </div>
    </div>
    </>
  );
}

/** アップロード/ライブラリボタン共通コンポーネント */
function ImageActions({
  uploadKey,
  uploadingIndex,
  fileInputRefs,
  onUpload,
  onLibrary,
  replaceLabel,
}: {
  uploadKey: string;
  uploadingIndex: string | null;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onUpload: (file: File) => Promise<void>;
  onLibrary: () => void;
  replaceLabel?: boolean;
}) {
  const isUploading = uploadingIndex === uploadKey;
  return (
    <div className="pt-1">
      <input
        ref={(el) => { fileInputRefs.current[uploadKey] = el; }}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await onUpload(file);
          if (fileInputRefs.current[uploadKey]) fileInputRefs.current[uploadKey]!.value = '';
        }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRefs.current[uploadKey]?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {replaceLabel ? <LuRefreshCw className="w-3 h-3" /> : <LuUpload className="w-3 h-3" />}
          {isUploading ? 'アップロード中...' : replaceLabel ? '画像を置き換え' : 'アップロード'}
        </button>
        <button
          type="button"
          onClick={onLibrary}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <LuLibrary className="w-3 h-3" />
          ライブラリ
        </button>
      </div>
    </div>
  );
}

function CopyButton({ text, index, copiedIndex, onCopy }: {
  text: string;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}) {
  const isCopied = copiedIndex === index;
  return (
    <button
      type="button"
      onClick={() => onCopy(text, index)}
      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
    >
      {isCopied ? (
        <><LuCheck className="w-3 h-3 text-green-600" /><span className="text-green-600">コピー済み</span></>
      ) : (
        <><LuCopy className="w-3 h-3" />コピー</>
      )}
    </button>
  );
}

interface ImageLibraryModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  filterAspect?: 'thumbnail' | 'body';
}

function ImageLibraryModal({ onSelect, onClose, filterAspect }: ImageLibraryModalProps) {
  const [assets, setAssets] = useState<Array<{ path: string; tags: string[]; aspect: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminFetch('/api/admin/image-assets')
      .then((res) => res.json())
      .then((data) => setAssets(data.assets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = assets;
    if (filterAspect) {
      list = list.filter((a) => a.aspect === filterAspect);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.tags.some((t) => t.toLowerCase().includes(q)) || a.path.toLowerCase().includes(q));
    }
    return list;
  }, [assets, search, filterAspect]);

  return (
    <Modal isOpen onClose={onClose} title="画像ライブラリ" maxWidth="max-w-3xl">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="タグで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
      </div>
      <div className="p-4">
        {loading ? (
          <LoadingSpinner size="sm" label="" className="flex justify-center py-8" />
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            {assets.length === 0 ? 'アセットが登録されていません。画像アセットページで一括登録してください。' : '該当する画像がありません'}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((asset) => (
              <button
                key={asset.path}
                type="button"
                onClick={() => onSelect(asset.path)}
                className="group rounded-lg overflow-hidden border border-gray-200 hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all text-left"
              >
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.path} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                {asset.tags.length > 0 && (
                  <div className="p-1.5 flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
