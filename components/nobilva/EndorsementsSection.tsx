import Image from "next/image";
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
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 space-y-8 md:space-y-10">
        {endorsements.map((e, i) => (
          <div
            key={i}
            className="flex items-start gap-4 md:gap-6"
          >
            {/* 左: アバター画像 */}
            <div className="flex-shrink-0 w-24 md:w-32 lg:w-40">
              <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100 flex items-center justify-center">
                {e.imageUrl ? (
                  <Image
                    src={e.imageUrl}
                    alt={`${e.name}${e.title ? ` ${e.title}` : ""}`}
                    width={160}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* プレースホルダー: 人物シルエット */
                  <svg
                    className="w-1/2 h-1/2 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
            </div>

            {/* 右: 見出し + コメント */}
            <div className="flex-1">
              {/* 見出し（コメントのすぐ上） */}
              <p className="text-gray-900 mb-2 md:mb-3">
                <span className="text-base md:text-lg lg:text-xl font-bold">
                  {e.name}
                  {e.title && ` ${e.title}`}様
                </span>
                <span className="text-xs md:text-sm text-gray-600 ml-2">
                  にコメントをいただきました
                </span>
              </p>

              {/* コメント（吹き出しではなく通常のカード） */}
              <div className="bg-nobilva-light rounded-2xl px-5 md:px-7 py-4 md:py-6">
                <p className="text-sm md:text-base lg:text-lg text-gray-800 leading-relaxed whitespace-pre-line">
                  {e.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
