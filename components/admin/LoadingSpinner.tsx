interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'lg', label = '読み込み中...', className }: LoadingSpinnerProps) {
  return (
    <div className={className ?? 'flex items-center justify-center h-64'}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-primary mx-auto ${sizes[size]}`} />
        {label && <p className="mt-4 text-gray-600">{label}</p>}
      </div>
    </div>
  );
}
