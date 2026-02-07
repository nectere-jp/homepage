'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BaseCard } from '../ui/BaseCard';
import { ScrollReveal } from '../animations/ScrollReveal';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  name: string;
  position: string;
  photoUrl: string;
  bio?: string;
  href?: string;
  delay?: number;
  className?: string;
}

export function MemberCard({
  name,
  position,
  photoUrl,
  bio,
  href,
  delay = 0,
  className,
}: MemberCardProps) {
  const content = (
    <BaseCard className={cn('text-center', className)}>
      <div className="space-y-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="rounded-full object-cover"
            sizes="(max-width: 768px) 96px, 128px"
          />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-blue text-xl md:text-2xl font-semibold">{name}</h3>
          <p className="text-pink text-sm md:text-base">{position}</p>
        </div>
        
        {bio && (
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
            {bio}
          </p>
        )}
      </div>
    </BaseCard>
  );

  const cardContent = href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );

  return (
    <ScrollReveal delay={delay} direction="up">
      {cardContent}
    </ScrollReveal>
  );
}
