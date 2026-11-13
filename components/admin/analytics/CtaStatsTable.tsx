import type { CtaStat } from "@/lib/analytics/cta-stats";
import { CTA_TYPE_LABELS } from "./labels";
import { getCtaPositionLabel } from "./utils";

interface CtaStatsTableProps {
  /** そのページを開いたセッション数（到達率の分母） */
  pageSessions: number;
  ctas: CtaStat[];
}

const formatRate = (numerator: number, denominator: number): string =>
  denominator > 0 ? `${Number(((numerator / denominator) * 100).toFixed(1))}%` : "—";

/**
 * 1 ページぶんの CTA 別の到達率・クリック率。
 * 率を主、その分子と分母を従として 1 つのセルに並べる。
 */
export const CtaStatsTable = ({ pageSessions, ctas }: CtaStatsTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#F5F5F5] text-xs text-[#666666]">
          <th className="text-left font-medium px-4 py-2">CTA</th>
          <th className="text-right font-medium px-4 py-2 whitespace-nowrap">到達率</th>
          <th className="text-right font-medium px-4 py-2 whitespace-nowrap">クリック率</th>
        </tr>
      </thead>
      <tbody>
        {ctas.map((cta) => {
          const position = getCtaPositionLabel(cta.ctaId);
          return (
            <tr key={cta.ctaId} className="border-t border-[#E0E0E0] align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-[#1A1A1A] [overflow-wrap:anywhere]">
                  {position ?? cta.ctaId}
                </p>
                <p className="text-xs text-[#666666] [overflow-wrap:anywhere]">
                  {CTA_TYPE_LABELS[cta.type]}
                  {position && <span className="font-mono"> · {cta.ctaId}</span>}
                </p>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <p className="text-base font-bold tabular-nums text-[#1A1A1A]">
                  {formatRate(cta.viewSessions, pageSessions)}
                </p>
                <p className="text-xs tabular-nums text-[#666666]">
                  見た {cta.viewSessions} ÷ 開いた {pageSessions}
                </p>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <p className="text-base font-bold tabular-nums text-[#1A1A1A]">
                  {formatRate(cta.clickSessions, cta.viewSessions)}
                </p>
                <p className="text-xs tabular-nums text-[#666666]">
                  押した {cta.clickSessions} ÷ 見た {cta.viewSessions}
                </p>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
