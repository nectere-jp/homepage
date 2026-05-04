import { cn } from "@/lib/utils";

interface FilterTab<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "px-4 py-2 rounded-xl font-medium transition-all duration-200",
            value === tab.key
              ? "bg-primary text-white shadow-soft"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}
