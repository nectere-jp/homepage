'use client';

import { ReactNode } from 'react';
import { BaseCard } from '../ui/BaseCard';
import { ScrollReveal } from '../animations/ScrollReveal';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  description?: string;
  delay?: number;
  className?: string;
  variant?: 'default' | 'highlight';
}

export function StatCard({
  value,
  label,
  icon,
  description,
  delay = 0,
  className,
  variant = 'default',
}: StatCardProps) {
  return (
    <ScrollReveal delay={delay} direction="up">
      <BaseCard
        className={cn(
          'text-center',
          variant === 'highlight' && 'bg-pink-light border-2 border-pink',
          className
        )}
      >
        <div className="space-y-3">
          {icon && (
            <div className="flex justify-center text-pink text-3xl md:text-4xl">
              {icon}
            </div>
          )}

          <div className="space-y-1">
            <p
              className={cn(
                'text-4xl md:text-5xl lg:text-6xl font-bold',
                variant === 'highlight' ? 'text-pink' : 'text-blue'
              )}
            >
              {value}
            </p>
            <p className="text-pink text-lg md:text-xl font-semibold">{label}</p>
          </div>

          {description && (
            <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
          )}
        </div>
      </BaseCard>
    </ScrollReveal>
  );
}
