"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { TeamCtaStatsResponse } from "@/app/api/admin/teams/cta-stats/route";
import { CtaStatsTable } from "@/components/admin/analytics/CtaStatsTable";

interface TeamCtaReachProps {
  slug: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "loaded"; data: TeamCtaStatsResponse };

/**
 * チームページの CTA ごとの到達率とクリック率。
 * サイト全体の計測から数えるので、チーム計測の「閲覧」とは数が一致しない。
 */
export const TeamCtaReach = ({ slug }: TeamCtaReachProps) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    adminFetch(`/api/admin/teams/cta-stats?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (cancelled) return;
        setState(res.ok ? { status: "loaded", data: await res.json() } : { status: "failed" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <section className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-bold text-[#1A1A1A]">CTA の到達とクリック</h3>
        <p className="text-xs leading-relaxed text-[#666666] mt-1">
          チームページを開いたセッションのうち、各 CTA を見た割合と押した割合です。
          {state.status === "loaded" && `過去${state.data.days}日（${state.data.since} 以降）のぶんです。`}
          「閲覧」とは別の計測で数えるため、数は一致しません。
        </p>
      </div>
      {state.status === "loading" ? (
        <p className="text-sm text-[#666666] px-4 pb-4">読み込み中…</p>
      ) : state.status === "failed" ? (
        <p className="text-sm text-[#1A1A1A] px-4 pb-4">
          CTA のデータを読み込めませんでした。ページを再読み込みしてください。
        </p>
      ) : state.data.page ? (
        <CtaStatsTable pageSessions={state.data.page.sessions} ctas={state.data.page.ctas} />
      ) : (
        <p className="text-sm text-[#666666] px-4 pb-4">
          この期間に、このチームページで CTA の表示もクリックも記録されていません。
        </p>
      )}
    </section>
  );
};
