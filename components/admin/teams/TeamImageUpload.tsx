"use client";

import { useRef } from "react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";

/**
 * Variant preset for the preview box and button labels.
 * - `logo`: Square preview, "ロゴをアップロード" (used for team logo).
 * - `hero`: Tall preview with default fallback image, "Hero 画像をアップロード" (used for hero cutout).
 * - `endorsement`: Compact 4:3 inline preview, no outer field label (used inside endorsement cards).
 */
export type TeamImageVariant = "logo" | "hero" | "endorsement";

interface TeamImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  variant: TeamImageVariant;
  /**
   * Unique suffix for the input id. Required for `endorsement` variant
   * (since multiple instances render in the same form). Optional otherwise.
   */
  idSuffix?: string | number;
}

export const TeamImageUpload = ({
  value,
  onChange,
  variant,
  idSuffix,
}: TeamImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error, upload } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, { dir: "teams" });
    if (url) onChange(url);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ---------- Endorsement variant (compact inline, no outer label) ----------
  if (variant === "endorsement") {
    const inputId = `team-image-endorsement-${idSuffix ?? "0"}`;
    return (
      <div className="flex items-center gap-3">
        {/* 4:3 preview matching display */}
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
          {error && <p className="text-xs text-red-600 w-full">{error}</p>}
        </div>
      </div>
    );
  }

  // ---------- Logo / Hero variants ----------
  const isHero = variant === "hero";
  const inputId = isHero ? "team-hero-upload" : "team-logo-upload";
  const fieldLabel = isHero ? "Hero 切り抜き画像（任意）" : "チームロゴ（任意）";
  const buttonLabel = isHero ? "Hero 画像をアップロード" : "ロゴをアップロード";
  const clearLabel = isHero ? "デフォルトに戻す" : "クリア";
  const description = isHero
    ? "ページ上部の右側に表示される選手画像。未設定時はデフォルト画像を使用します。透過 PNG 推奨。"
    : null;

  const heroDefault = "/images/nobilva/hero_transparent.png";
  const displayUrl = isHero ? value || heroDefault : value;
  const isHeroDefault = isHero && !value;

  const previewBoxClass = isHero
    ? "flex-shrink-0 w-24 h-32 rounded-lg border border-gray-300 bg-nobilva-main overflow-hidden flex items-center justify-center relative"
    : "flex-shrink-0 w-20 h-20 rounded-lg border border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center";

  const imgClass = isHero
    ? "w-full h-full object-contain object-right-bottom"
    : "w-full h-full object-contain";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        {fieldLabel}
      </label>
      {description && (
        <p className="text-xs text-gray-400 mb-2">{description}</p>
      )}
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className={previewBoxClass}>
          {displayUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt={isHero ? "Hero 画像プレビュー" : "ロゴ"}
                className={imgClass}
              />
              {isHeroDefault && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                  デフォルト
                </span>
              )}
            </>
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
              id={inputId}
            />
            <label
              htmlFor={inputId}
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer"
            >
              {uploading ? "アップロード中..." : buttonLabel}
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {clearLabel}
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};
