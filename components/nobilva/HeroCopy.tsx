"use client";

import { useSearchParams } from "next/navigation";

type Variant = "baseball" | "bukatsu";

const COPY: Record<Variant, { kicker: string; sport: string; note: string }> = {
  baseball: {
    kicker: "本気で野球に取り組む中高生の",
    sport: "野球",
    note: "サッカー・バスケなど、ほかの部活の生徒も受け付けています",
  },
  bukatsu: {
    kicker: "部活に本気で取り組む中高生の",
    sport: "部活",
    note: "野球部の生徒を中心に、部活をがんばる中高生を受け付けています",
  },
};

/**
 * ヒーローのメインコピー（3行構造: kicker → ○○と勉強の両立を → サポートします）。
 * 通常は野球の文面。野球以外の記事からのリンク（?for=bukatsu）で来た人には部活全般の文面を出す。
 * h1（正式サービス名）は変えない
 */
export function HeroCopy({ variant }: { variant: Variant }) {
  const c = COPY[variant];
  return (
    <div className="font-black text-gray-900 tracking-tight">
      <p className="text-base md:text-2xl lg:text-3xl xl:text-4xl leading-none">{c.kicker}</p>
      <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-none mt-2 md:mt-3">
        <span className="inline-block bg-white text-nobilva-accent px-2 md:px-3 pt-0.5 pb-1.5 md:pt-1 md:pb-2.5 mr-1">
          {c.sport}
        </span>
        と
        <span className="inline-block bg-white text-nobilva-accent px-2 md:px-3 pt-0.5 pb-1.5 md:pt-1 md:pb-2.5 mx-1">
          勉強
        </span>
        の両立を
      </p>
      <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-none mt-2 md:mt-3">サポートします</p>
      <p className="mt-5 md:mt-7 text-xs md:text-sm font-bold text-gray-800">
        <span className="inline-block bg-white/80 px-3 py-1.5">{c.note}</span>
      </p>
    </div>
  );
}

export function HeroCopyFromQuery() {
  const params = useSearchParams();
  const variant: Variant = params.get("for") === "bukatsu" ? "bukatsu" : "baseball";
  return <HeroCopy variant={variant} />;
}
