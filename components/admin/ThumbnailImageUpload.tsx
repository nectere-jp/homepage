"use client";

import { useState, useRef } from "react";

interface ThumbnailImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ThumbnailImageUpload({
  value,
  onChange,
}: ThumbnailImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "アップロードに失敗しました");
        return;
      }

      onChange(data.url);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      {/* プレビュー */}
      <div className="flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          サムネイル画像
        </label>
        <div className="w-32 h-32 rounded-lg border border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="サムネイル"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">未設定</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-[200px] space-y-3">
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/blog/xxx.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono"
          />
          <p className="mt-1 text-xs text-gray-500">
            パスを直接入力するか、下のボタンでアップロード（public/images/blog/
            に保存）
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="thumbnail-image-upload"
          />
          <label
            htmlFor="thumbnail-image-upload"
            className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "アップロード中..." : "画像を選択してアップロード"}
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
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
