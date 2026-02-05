'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BaseCard } from '../ui/BaseCard';
import { ScrollReveal } from '../animations/ScrollReveal';
import { Badge } from '../ui/Badge';
import { formatDate, cn } from '@/lib/utils';

interface NewsCardProps {
  title: string;
  date: Date | string;
  excerpt?: string;
  thumbnailUrl?: string;
  category?: string;
  href: string;
  delay?: number;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export function NewsCard({
  title,
  date,
  excerpt,
  thumbnailUrl,
  category,
  href,
  delay = 0,
  className,
  layout = 'vertical',
}: NewsCardProps) {
  const formattedDate = formatDate(date);

  return (
    <ScrollReveal delay={delay} direction="up">
      <Link href={href} className="block">
        <BaseCard className={cn('h-full', className)}>
          <div
            className={cn(
              'space-y-4',
              layout === 'horizontal' && 'md:flex md:items-start md:gap-4'
            )}
          >
            {thumbnailUrl && (
              <div
                className={cn(
                  'relative w-full overflow-hidden rounded-2xl',
                  layout === 'horizontal'
                    ? 'md:w-48 md:flex-shrink-0'
                    : 'aspect-video'
                )}
              >
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes={
                    layout === 'horizontal'
                      ? '(max-width: 768px) 100vw, 192px'
                      : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  }
                />
              </div>
            )}

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {category && (
                    <Badge variant="secondary" className="mb-2">
                      {category}
                    </Badge>
                  )}
                  <h3 className="text-blue text-lg md:text-xl font-semibold line-clamp-2">
                    {title}
                  </h3>
                </div>
              </div>

              <p className="text-caption text-xs md:text-sm">{formattedDate}</p>

              {excerpt && (
                <p className="text-caption text-sm leading-relaxed line-clamp-3">
                  {excerpt}
                </p>
              )}
            </div>
          </div>
        </BaseCard>
      </Link>
    </ScrollReveal>
  );
}
