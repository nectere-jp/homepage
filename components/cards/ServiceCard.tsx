'use client';

import { BaseCard } from '../ui/BaseCard';
import { CTAButton } from '../ui/CTAButton';
import { ScrollReveal } from '../animations/ScrollReveal';

interface ServiceCardProps {
  title: string;
  description: string;
  cta: string;
  href?: string;
  delay?: number;
}

export function ServiceCard({ title, description, cta, href, delay = 0 }: ServiceCardProps) {
  return (
    <ScrollReveal delay={delay} direction="up">
      <BaseCard>
        <div className="space-y-4">
          <p className="text-pink text-sm font-semibold">Service</p>
          <h3 className="text-blue text-2xl md:text-3xl font-bold">{title}</h3>
          <p className="text-gray-700 leading-relaxed">{description}</p>
          {href && (
            <div className="pt-4">
              <CTAButton href={href}>{cta}</CTAButton>
            </div>
          )}
        </div>
      </BaseCard>
    </ScrollReveal>
  );
}
