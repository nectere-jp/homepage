'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  gradientColors?: {
    start: string;
    end: string;
  };
}

/**
 * 価格表示コンポーネント
 * カンマを小さくしてカーニングを詰める処理を含む
 */
export function PriceDisplay({ 
  price, 
  size = 'medium', 
  className,
  gradientColors = {
    start: '#bb4510',
    end: '#ea5614'
  }
}: PriceDisplayProps) {
  // カンマを小さくしてカーニングを詰める処理
  const formatPriceAmount = (amount: string) => {
    return amount.split(',').map((part, index, array) => {
      if (index === array.length - 1) {
        return <span key={index}>{part}</span>;
      }
      return (
        <span key={index}>
          {part}
          <span className="text-[0.6em] -mx-0.5" style={{ letterSpacing: '-0.1em' }}>,</span>
        </span>
      );
    });
  };

  const sizeClasses = {
    small: 'text-3xl',
    medium: 'text-4xl md:text-6xl lg:text-7xl',
    large: 'text-5xl md:text-7xl lg:text-8xl'
  };

  const gradientStyle = {
    lineHeight: '1.1' as const,
    backgroundImage: `linear-gradient(-15deg, ${gradientColors.start} 0%, ${gradientColors.start} 50%, ${gradientColors.end} 50%, ${gradientColors.end} 100%)`
  };

  return (
    <span 
      className={cn(
        'inline-block font-black leading-tight bg-clip-text text-transparent overflow-visible pb-2 md:pb-3',
        sizeClasses[size],
        className
      )} 
      style={gradientStyle}
    >
      {formatPriceAmount(price)}
    </span>
  );
}
