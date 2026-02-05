import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  rounded?: 'none' | 'md' | 'xl' | '3xl';
}

export function BaseCard({ children, className, hover = true, rounded = '3xl' }: BaseCardProps) {
  const roundedClasses = {
    none: 'rounded-none',
    md: 'rounded-md',
    xl: 'rounded-xl',
    '3xl': 'rounded-3xl',
  };

  return (
    <div
      className={cn(
        'bg-white shadow-soft py-8 md:py-10 px-6 md:px-8 transition-all duration-300',
        roundedClasses[rounded],
        hover && 'hover:-translate-y-1 hover:shadow-soft-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
