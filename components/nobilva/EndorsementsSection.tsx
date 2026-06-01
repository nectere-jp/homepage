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
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 space-y-6">
        {endorsements.map((e, i) => (
          <div key={i}>
            {/* Heading */}
            <p className="text-center text-gray-900 mb-4">
              <span className="text-xl md:text-2xl lg:text-3xl font-bold">
                {e.name}{e.title && ` ${e.title}`}様
              </span>
              <span className="text-base md:text-lg block mt-1">
                にコメントをいただきました
              </span>
            </p>

            {/* Quote card */}
            <div className="bg-nobilva-light rounded-2xl px-8 md:px-10 py-8 md:py-10">
              <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed whitespace-pre-line text-center">
                {e.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
