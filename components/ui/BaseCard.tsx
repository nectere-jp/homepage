import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BaseCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function BaseCard({ children, className, hover = true }: BaseCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm p-6 md:p-8 transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
