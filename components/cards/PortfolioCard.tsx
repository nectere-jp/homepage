'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BaseCard } from '../ui/BaseCard';
import { ScrollReveal } from '../animations/ScrollReveal';
import { CTAButton } from '../ui/CTAButton';
import { cn } from '@/lib/utils';

interface PortfolioCardProps {
  title: string;
  description: string;
  thumbnailUrl?: string;
  companyName?: string;
  challenge?: string;
  solution?: string;
  testimonial?: string;
  href?: string;
  delay?: number;
  className?: string;
}

export function PortfolioCard({
  title,
  description,
  thumbnailUrl,
  companyName,
  challenge,
  solution,
  testimonial,
  href,
  delay = 0,
  className,
}: PortfolioCardProps) {
  return (
    <ScrollReveal delay={delay} direction="up">
      <BaseCard className={cn('h-full flex flex-col', className)}>
        <div className="space-y-4 flex-1">
          {thumbnailUrl && (
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl">
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          <div className="space-y-3">
            {companyName && (
              <p className="text-pink text-sm font-medium">{companyName}</p>
            )}

            <h3 className="text-blue text-xl md:text-2xl font-semibold">
              {title}
            </h3>

            <p className="text-gray-600 text-xs leading-relaxed">{description}</p>

            {challenge && (
              <div>
                <p className="text-text text-sm font-medium mb-1">課題</p>
                <p className="text-gray-600 text-xs">{challenge}</p>
              </div>
            )}

            {solution && (
              <div>
                <p className="text-text text-sm font-medium mb-1">解決策</p>
                <p className="text-gray-600 text-xs">{solution}</p>
              </div>
            )}

            {testimonial && (
              <div className="bg-pink-light p-4 rounded-2xl">
                <p className="text-text text-sm italic">&quot;{testimonial}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {href && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <CTAButton href={href}>詳しく見る</CTAButton>
          </div>
        )}
      </BaseCard>
    </ScrollReveal>
  );
}
