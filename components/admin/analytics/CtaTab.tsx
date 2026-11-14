"use client";

import Link from "next/link";
import type { PageCtaStats } from "@/lib/analytics/cta-stats";
import { CtaStatsTable } from "./CtaStatsTable";
import { getPageLabel } from "./utils";

interface CtaTabProps {
  pages: PageCtaStats[];
  /** 集計を始めた日 (YYYY-MM-DD) */
  since: string;
}

export const CtaTab = ({ pages, since }: CtaTabProps) => (
  <div className="space-y-8">
    <div className="text-sm leading-relaxed text-[#666666] space-y-1">
      <p>
        CTA が画面に半分以上入ると「見た」と数えます。数はすべてセッション数で、{since}{" "}
        以降のぶんです。
      </p>
      <p>
        ブログ記事の CTA は
        <Link href="/admin/posts" className="text-[#1A1A1A] underline underline-offset-2 mx-1">
          記事の画面
        </Link>
        で記事ごとに見られます。
      </p>
    </div>

    {pages.length === 0 ? (
      <p className="text-sm text-[#666666] py-8">
        この期間に、CTA の表示もクリックも記録されていません。期間を広げるか、絞り込みを「全て」に変えてください。
      </p>
    ) : (
      pages.map((page) => {
        const label = getPageLabel(page.path);
        return (
          <section key={page.path}>
            <div className="mb-2">
              <h3 className="text-base font-bold text-[#1A1A1A] [overflow-wrap:anywhere]">
                {label}
              </h3>
              <p className="text-xs text-[#666666] [overflow-wrap:anywhere]">
                {label !== page.path && <span className="font-mono">{page.path} · </span>}
                開いたセッション {page.sessions}
              </p>
            </div>
            <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
              <CtaStatsTable pageSessions={page.sessions} ctas={page.ctas} />
            </div>
          </section>
        );
      })
    )}
  </div>
);
