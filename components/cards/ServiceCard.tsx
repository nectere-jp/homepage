'use client';

import { BaseCard } from '../ui/BaseCard';
import { CTAButton } from '../ui/CTAButton';
import { ScrollReveal } from '../animations/ScrollReveal';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  title: string;
  catchphrase?: string;
  description: string;
  cta: string;
  href?: string;
  delay?: number;
  className?: string;
  theme?: 'default' | 'nobilva';
}

export function ServiceCard({
  title,
  catchphrase,
  description,
  cta,
  href,
  delay = 0,
  className,
  theme = 'default',
}: ServiceCardProps) {
  const catchphraseColor = theme === 'nobilva' ? 'text-nobilva-accent' : 'text-pink';
  const cardRounding = theme === 'nobilva' ? 'rounded-xl' : '';

  return (
    <ScrollReveal delay={delay} direction="up">
      <BaseCard className={cn(cardRounding, className)}>
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-text text-xl md:text-2xl font-semibold">{title}</h3>
            {catchphrase && (
              <p className={cn(catchphraseColor, "text-xs md:text-sm")}>{catchphrase}</p>
            )}
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
          {href && (
            <div className="pt-4">
              <CTAButton href={href} theme={theme === 'nobilva' ? 'nobilva' : 'default'}>{cta}</CTAButton>
            </div>
          )}
        </div>
      </BaseCard>
    </ScrollReveal>
  );
}
