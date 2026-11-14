"use client";

import { useCallback, useEffect, useState } from "react";
import { LINE_ADD_URL } from "@/lib/constants";
import { getVisitTeamSlug, trackTeamCtaClick } from "@/lib/analytics/teamTracker";
import { CTABanner } from "./CTABanner";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";

interface TeamAwareCTABannerProps {
  variant?: "inline" | "final";
  /** チーム計測の ctaId の前半。`<prefix>_diagnosis` / `<prefix>_line` で記録する */
  ctaIdPrefix: string;
}

/**
 * チームページから来た訪問者に対して、チームを引き継ぐ CTA バナー。
 *  - 面談リンクに `?team=<slug>` を付け、申込をそのチームに紐づける
 *  - 面談・LINE のクリックをチーム計測に記録する
 * チーム経由でない訪問では、素の CTABanner と同じ動きをする。
 */
export function TeamAwareCTABanner({ variant, ctaIdPrefix }: TeamAwareCTABannerProps) {
  // 静的に生成するページで使うため、URL はマウント後に読む
  const [teamSlug, setTeamSlug] = useState<string | null>(null);
  useEffect(() => {
    setTeamSlug(getVisitTeamSlug());
  }, []);

  const diagnosisHref = teamSlug
    ? `${DIAGNOSIS_PATH}?team=${encodeURIComponent(teamSlug)}`
    : undefined;

  const onCTAClick = useCallback(() => {
    if (!teamSlug || !diagnosisHref) return;
    trackTeamCtaClick(teamSlug, `${ctaIdPrefix}_diagnosis`, "consult", diagnosisHref);
  }, [teamSlug, diagnosisHref, ctaIdPrefix]);

  const onLineClick = useCallback(() => {
    if (!teamSlug) return;
    trackTeamCtaClick(teamSlug, `${ctaIdPrefix}_line`, "line", LINE_ADD_URL);
  }, [teamSlug, ctaIdPrefix]);

  return (
    <CTABanner
      variant={variant}
      diagnosisHref={diagnosisHref}
      onCTAClick={onCTAClick}
      onLineClick={onLineClick}
    />
  );
}
