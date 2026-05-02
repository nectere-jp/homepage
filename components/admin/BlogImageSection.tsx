'use client';

import { useState, useRef, useMemo } from 'react';
import { LuImage, LuCopy, LuCheck, LuSparkles, LuUpload } from 'react-icons/lu';
import { adminFetch } from '@/lib/admin-fetch';

interface ImagePromptData {
  label: string;
  sceneDescription: string;
  fullPrompt: string;
}

interface ParsedPlaceholder {
  alt: string;
  keywords: string;
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
  /** IMAGE_PLACEHOLDER置換コールバック（edit mode） */
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
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [bodyImageUrls, setBodyImageUrls] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const placeholders = useMemo(() => parsePlaceholders(content), [content]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await adminFetch('/api/admin/claude/generate-image-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          clusterAxis: clusterAxis || undefined,
          bodyPlaceholders: placeholders.map((p) => ({ alt: p.alt, keywords: p.keywords })),
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

  const handleUploadBody = async (file: File, placeholder: ParsedPlaceholder, index: number) => {
    const formData = new FormData();
    formData.set('file', file);
    const res = await adminFetch('/api/admin/upload/image', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'アップロードに失敗しました');
      return;
    }
    setBodyImageUrls((prev) => ({ ...prev, [index]: data.url }));
    const newMarkdown = `![${placeholder.alt}](${data.url})`;
    onReplacePlaceholder?.(placeholder.fullMatch, newMarkdown);
  };

  const handleUploadThumbnail = async (file: File) => {
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const res = await adminFetch('/api/admin/upload/image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'アップロードに失敗しました');
        return;
      }
      onThumbnailChange?.(data.url);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <LuImage className="w-4 h-4" />
          Nanobanana 画像
        </h4>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuSparkles className="w-4 h-4" />
          {loading ? '生成中...' : thumbnailPrompt ? '再生成' : 'プロンプト生成'}
        </button>
      </div>

      {!thumbnailPrompt && !loading && (
        <p className="text-xs text-gray-500">
          記事タイトルと本文のIMAGE_PLACEHOLDERをもとにNanobanana用プロンプトを生成します。
          {placeholders.length > 0 && (
            <span className="ml-1 text-gray-700 font-medium">
              （本文画像: {placeholders.length}箇所検出）
            </span>
          )}
        </p>
      )}

      {/* サムネ */}
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
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploadingThumbnail}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <LuUpload className="w-3 h-3" />
                {uploadingThumbnail ? 'アップロード中...' : thumbnailValue ? 'サムネ変更' : 'サムネをアップロード'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* サムネ（preview mode: プロンプト生成後のみ表示） */}
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

      {/* 本文画像 */}
      {bodyPrompts.length > 0 && (
        <div className="space-y-2">
          {bodyPrompts.map((bp, i) => {
            const placeholder = placeholders[i];
            const isReplaced = !placeholder || !content.includes(placeholder.fullMatch);
            const uploadedUrl = bodyImageUrls[i];
            return (
              <div key={i} className={`bg-white border rounded-lg p-3 space-y-2 ${isReplaced ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {bp.label}
                    {isReplaced && <span className="ml-2 text-green-600">置換済み</span>}
                  </span>
                  <CopyButton
                    text={bp.fullPrompt}
                    index={i}
                    copiedIndex={copiedIndex}
                    onCopy={handleCopy}
                  />
                </div>
                {uploadedUrl && (
                  <div className="rounded border border-gray-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadedUrl} alt={bp.label} className="w-full h-auto max-h-40 object-cover" />
                  </div>
                )}
                <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
                  {bp.fullPrompt}
                </p>
                {mode === 'edit' && placeholder && !isReplaced && (
                  <div className="pt-1">
                    <input
                      ref={(el) => { fileInputRefs.current[i] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingIndex(i);
                        try {
                          await handleUploadBody(file, placeholder, i);
                        } finally {
                          setUploadingIndex(null);
                          if (fileInputRefs.current[i]) fileInputRefs.current[i]!.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[i]?.click()}
                      disabled={uploadingIndex === i}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      <LuUpload className="w-3 h-3" />
                      {uploadingIndex === i ? 'アップロード中...' : '画像をアップロードして置換'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* プロンプト未生成だが placeholder が存在する場合のプレビュー */}
      {!thumbnailPrompt && placeholders.length > 0 && (
        <div className="space-y-1">
          {placeholders.map((p, i) => (
            <div key={i} className="text-xs text-gray-500 font-mono truncate">
              {i + 1}. {p.alt} ({p.keywords})
            </div>
          ))}
        </div>
      )}
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
