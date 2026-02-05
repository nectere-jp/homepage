import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  backgroundColor?: 'white' | 'pink-light' | 'beige' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Section({
  children,
  id,
  className,
  backgroundColor = 'white',
  padding = 'md',
}: SectionProps) {
  const backgroundColorClasses = {
    white: 'bg-white',
    'pink-light': 'bg-pink-light',
    beige: 'bg-beige',
    transparent: 'bg-transparent',
  };

  const paddingClasses = {
    none: '',
    sm: 'py-8 md:py-12',
    md: 'py-16 md:py-24',
    lg: 'py-20 md:py-32',
  };

  return (
    <section
      id={id}
      className={cn(
        backgroundColorClasses[backgroundColor],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </section>
  );
}
