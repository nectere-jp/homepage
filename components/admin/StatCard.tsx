import { cn } from '@/lib/utils';
import type { IconType } from 'react-icons';

type StatCardVariant = 'default' | 'compact' | 'icon-top';
type StatCardTone = 'default' | 'danger' | 'warning';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: IconType;
  variant?: StatCardVariant;
  /** value / 枠の強調トーン */
  tone?: StatCardTone;
  /** @deprecated tone="danger" のエイリアス */
  alert?: boolean;
  /** value の下に表示される補足テキスト ('default' と 'icon-top' のみ) */
  description?: React.ReactNode;
  className?: string;
}

const COMPACT_FRAME: Record<StatCardTone, string> = {
  default: 'border-gray-200 bg-white',
  danger: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
};

const VALUE_COLOR: Record<StatCardTone, string> = {
  default: 'text-gray-900',
  danger: 'text-red-600',
  warning: 'text-amber-600',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  tone: toneProp,
  alert = false,
  description,
  className,
}: StatCardProps) {
  const tone: StatCardTone = toneProp ?? (alert ? 'danger' : 'default');

  if (variant === 'compact') {
    return (
      <div className={cn('rounded-xl border p-4', COMPACT_FRAME[tone], className)}>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={cn('text-2xl font-bold mt-1', VALUE_COLOR[tone])}>
          {value}
        </p>
      </div>
    );
  }

  if (variant === 'icon-top') {
    return (
      <div className={cn('bg-white rounded-2xl shadow-soft p-6', className)}>
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          {Icon && <Icon className="w-5 h-5" />}
          <p className="text-sm">{label}</p>
        </div>
        <p className={cn('text-3xl font-bold', VALUE_COLOR[tone])}>{value}</p>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl shadow-soft p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={cn('text-3xl font-bold', VALUE_COLOR[tone])}>{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {Icon && <Icon className="w-10 h-10 text-gray-400" />}
      </div>
    </div>
  );
}
