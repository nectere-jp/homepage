import { cn } from '@/lib/utils';
import type { IconType } from 'react-icons';

type StatCardVariant = 'default' | 'compact';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: IconType;
  variant?: StatCardVariant;
  alert?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  alert = false,
  className,
}: StatCardProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-xl border p-4',
          alert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white',
          className,
        )}
      >
        <p className="text-xs text-gray-500">{label}</p>
        <p
          className={cn(
            'text-2xl font-bold mt-1',
            alert ? 'text-red-600' : 'text-gray-900',
          )}
        >
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl shadow-soft p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p
            className={cn(
              'text-3xl font-bold',
              alert ? 'text-red-600' : 'text-gray-900',
            )}
          >
            {value}
          </p>
        </div>
        {Icon && <Icon className="w-10 h-10 text-gray-400" />}
      </div>
    </div>
  );
}
