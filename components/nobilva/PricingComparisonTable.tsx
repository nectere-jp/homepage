/**
 * PricingComparisonTable - 料金比較表
 *
 * 学習塾・オンライン個別・Nobilva の3者比較を表示する。
 * 各セルは ○・△・× の記号とキャプションで表示する。
 */

import Image from "next/image";
import { addSoftBreaks } from "@/utils/softBreak";

const NOBILVA_LOGO_PATH = "/images/logo_nobilva.png";

export type ComparisonSymbol = "o" | "triangle" | "x";

export interface ComparisonCell {
  symbol: ComparisonSymbol;
  caption: string;
}

export interface ComparisonRow {
  criterion: string;
  cramSchoolA: ComparisonCell;
  onlineB: ComparisonCell;
  nobilva: ComparisonCell;
}

export interface PricingComparisonTableProps {
  /** 表の上に表示する見出し（省略時は非表示） */
  title?: string;
  note?: string;
  columnLabels: {
    cramSchoolA: string;
    onlineB: string;
    nobilva: string;
  };
  rows: ComparisonRow[];
}

const COLUMN_KEYS = ["cramSchoolA", "onlineB", "nobilva"] as const;

const SYMBOL_SIZE = "w-14 h-14 md:w-16 md:h-16";
const STROKE_WIDTH = 4;

function SymbolIcon({ symbol }: { symbol: ComparisonSymbol }) {
  const wrapperClass = `${SYMBOL_SIZE} flex items-center justify-center mx-auto`;

  if (symbol === "o") {
    return (
      <span className={`${wrapperClass} text-nobilva-accent`} aria-hidden>
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH}>
          <circle cx="24" cy="24" r="18" />
        </svg>
      </span>
    );
  }
  if (symbol === "triangle") {
    return (
      <span className={`${wrapperClass} text-gray-400`} aria-hidden>
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH}>
          <path d="M24 11 L38 37 L10 37 Z" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${wrapperClass} text-gray-400`} aria-hidden>
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH}>
        <path d="M14 14 L34 34 M34 14 L14 34" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function PricingComparisonTable({
  title,
  note,
  columnLabels,
  rows,
}: PricingComparisonTableProps) {
  return (
    <div className={title ? "mt-12 md:mt-16 max-w-5xl mx-auto" : "max-w-5xl mx-auto"}>
      {title && (
        <h3 className="text-xl md:text-2xl font-bold text-blue mb-4 md:mb-6 text-center">
          {addSoftBreaks(title)}
        </h3>
      )}
      {note && (
        <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 text-center max-w-2xl mx-auto whitespace-pre-line">
          {addSoftBreaks(note)}
        </p>
      )}
      <div className="overflow-x-auto rounded-none">
        <table className="w-full min-w-[480px] border-collapse text-sm md:text-base">
          <thead>
            <tr className="border-b border-gray-200 bg-white">
              <th className="p-3 md:p-4 text-right font-bold text-gray-700 align-middle w-[20%] md:w-[18%]" />
              {COLUMN_KEYS.map((key) => (
                <th
                  key={key}
                  className={`p-3 md:p-4 text-center font-bold align-middle ${
                    key === "nobilva"
                      ? "text-nobilva-accent border-l-4 border-r-4 border-t-4 border-nobilva-accent"
                      : "text-gray-700"
                  }`}
                >
                  {key === "nobilva" ? (
                    <span className="inline-flex items-center justify-center">
                      <Image
                        src={NOBILVA_LOGO_PATH}
                        alt={columnLabels.nobilva}
                        width={140}
                        height={44}
                        className="h-8 md:h-10 w-auto object-contain"
                      />
                    </span>
                  ) : (
                    <span className="whitespace-pre-line block">
                      {addSoftBreaks(columnLabels[key])}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 bg-white"
              >
                <td className="p-3 md:p-4 text-gray-700 font-bold align-middle whitespace-pre-line break-keep text-right">
                  {addSoftBreaks(row.criterion)}
                </td>
                {COLUMN_KEYS.map((key) => {
                  const cell = row[key];
                  if (!cell || typeof cell !== "object" || !("symbol" in cell)) {
                    const isLastRow = i === rows.length - 1;
                    return (
                      <td
                        key={key}
                        className={`p-3 md:p-4 text-center align-top ${
                          key === "nobilva"
                            ? `border-l-4 border-r-4 border-nobilva-accent font-bold text-gray-900 ${isLastRow ? "border-b-4 border-nobilva-accent" : ""}`
                            : "text-gray-700"
                        }`}
                      >
                        <span className="whitespace-pre-line block text-sm">
                          {typeof cell === "string"
                            ? addSoftBreaks(cell)
                            : null}
                        </span>
                      </td>
                    );
                  }
                  const isNobilva = key === "nobilva";
                  const isLastRow = i === rows.length - 1;
                  return (
                    <td
                      key={key}
                      className={`p-3 md:p-4 text-center align-top ${
                        isNobilva
                          ? `border-l-4 border-r-4 border-nobilva-accent font-medium text-gray-900 ${isLastRow ? "border-b-4 border-nobilva-accent" : ""}`
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <SymbolIcon symbol={cell.symbol} />
                        <span
                          className={`text-xs md:text-sm whitespace-pre-line ${
                            isNobilva
                              ? "font-bold text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {addSoftBreaks(cell.caption)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
