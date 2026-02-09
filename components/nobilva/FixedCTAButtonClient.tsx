/**
 * FixedCTAButtonClient - 固定CTAボタンのクライアントコンポーネント
 * 
 * FixedCTAButtonを動的インポートで読み込むラッパー
 * SSRを無効化してクライアントサイドでのみレンダリング
 */

"use client";

import dynamic from "next/dynamic";

const FixedCTAButton = dynamic(
  () =>
    import("@/components/nobilva/FixedCTAButton").then((mod) => ({
      default: mod.FixedCTAButton,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

interface FixedCTAButtonClientProps {
  label: string;
  isJapanese: boolean;
}

export function FixedCTAButtonClient({
  label,
  isJapanese,
}: FixedCTAButtonClientProps) {
  return <FixedCTAButton label={label} isJapanese={isJapanese} />;
}
