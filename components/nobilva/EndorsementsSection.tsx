import type { TeamEndorsement } from "@/lib/teams";

interface EndorsementsSectionProps {
  endorsements: TeamEndorsement[];
}

export function EndorsementsSection({
  endorsements,
}: EndorsementsSectionProps) {
  if (endorsements.length === 0) return null;

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 space-y-4">
        {endorsements.map((e, i) => (
          <div key={i} className="bg-nobilva-light rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-nobilva-main/40 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{e.name}</p>
                {e.title && (
                  <p className="text-xs text-gray-500">{e.title}</p>
                )}
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {e.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
