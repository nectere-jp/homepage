interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p className={className ?? "text-center text-gray-500 py-12"}>
      {message}
    </p>
  );
}
