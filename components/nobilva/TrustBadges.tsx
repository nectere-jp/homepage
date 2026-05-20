import { wb } from "@/lib/wb";

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <span className="inline-flex items-center gap-1.5 bg-nobilva-main text-gray-900 font-bold text-sm px-4 py-2 rounded-full">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        {wb("月20名限定")}
      </span>
      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm px-4 py-2 rounded-full">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        30日全額返金保証
      </span>
    </div>
  );
}
