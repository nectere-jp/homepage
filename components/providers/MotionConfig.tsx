'use client';

import { MotionConfig as FramerMotionConfig } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionConfigProps {
  children: ReactNode;
}

/**
 * Framer Motionのグローバル設定
 * リフローとレイアウトシフトを最小限に抑える
 */
export function MotionConfig({ children }: MotionConfigProps) {
  return (
    <FramerMotionConfig
      // レイアウト計算を最適化
      reducedMotion="user"
      // トランジションのデフォルト設定
      transition={{
        // will-changeを自動管理
        layout: { duration: 0.3 },
      }}
    >
      {children}
    </FramerMotionConfig>
  );
}
