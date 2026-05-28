import { wb } from "@/lib/wb";
import { TagIcon, ShieldCheckIcon } from "./Icons";

interface TrustBadgesProps {
  className?: string;
  extras?: string[];
}

export function TrustBadges({ className = "", extras }: TrustBadgesProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`.trim()}>
      <span className="inline-flex items-center gap-1.5 bg-nobilva-main text-gray-900 font-bold text-sm px-4 py-2 rounded-full">
        <TagIcon />
        {wb("月20名限定")}
      </span>
      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm px-4 py-2 rounded-full">
        <ShieldCheckIcon />
        30日全額返金保証
      </span>
      {extras?.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm px-4 py-2 rounded-full"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
