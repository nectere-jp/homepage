/**
 * Hero画像の優先読み込み用カスタムフック
 * 
 * Hero画像を優先的に読み込むために、preload linkをheadに追加する
 */

import { useEffect } from "react";

/**
 * Hero画像を優先読み込みする
 * 
 * @param imagePath - 画像のパス（デフォルト: "/images/nobilva/hero.jpg"）
 */
export function useHeroImagePreload(imagePath: string = "/images/nobilva/hero.jpg") {
  useEffect(() => {
    // preload link要素を作成
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = imagePath;
    link.as = "image";
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);

    // クリーンアップ: コンポーネントのアンマウント時にlink要素を削除
    return () => {
      document.head.removeChild(link);
    };
  }, [imagePath]);
}
