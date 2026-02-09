import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { HiOutlineUser } from "react-icons/hi";
import { ServiceIconCard } from "@/components/ui/ServiceIconCard";
import { NumberHighlight } from "@/components/ui/NumberHighlight";
import { addSoftBreaks } from "@/utils/softBreak";

interface CaseStudyCardProps {
  caseItem: {
    name: string;
    grade: string;
    club?: string;
    period: string;
    services: string[];
    results: string[];
    comment: string;
  };
  index: number;
}

export function CaseStudyCard({ caseItem, index }: CaseStudyCardProps) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="bg-white shadow-sm p-6 md:p-8 h-full flex flex-col">
        {/* 生徒情報と指導期間 */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* 左側: 生徒情報 */}
            <div className="flex-1">
              <h3 
                className="text-2xl md:text-3xl font-bold text-blue mb-2"
                style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
              >
                {addSoftBreaks(caseItem.name)}
              </h3>
              <div className="text-text/70 text-sm">
                {caseItem.grade}
                {caseItem.club && ` / ${caseItem.club}`}
              </div>
            </div>
            {/* 右側: 指導期間 */}
            <div className="flex-shrink-0 md:text-right">
              <div className="text-text/60 mb-1 text-sm font-medium">
                指導期間
              </div>
              <div className="text-base text-text/70">
                {(caseItem.period.split(/(\d+ヶ月)/) as string[]).map(
                  (part: string, index: number) => {
                    if (/\d+ヶ月/.test(part)) {
                      return (
                        <span
                          key={index}
                          className="text-lg font-semibold text-black"
                        >
                          {part}
                        </span>
                      );
                    }
                    return <span key={index}>{part}</span>;
                  },
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 指導内容 */}
        <div className="mb-6">
          <div className="flex flex-nowrap gap-1.5 justify-center">
            {caseItem.services.map((service: string, i: number) => (
              <ServiceIconCard
                key={i}
                service={service}
                variant="case-study"
                className="flex-shrink-0"
                style={{ width: "calc((100% - 0.75rem) / 3)" }}
                iconColor="text-nobilva-accent"
                backgroundColor="bg-nobilva-light/50"
              />
            ))}
          </div>
        </div>

        {/* 指導結果 */}
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            {/* 下向きの矢印 */}
            <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[30px] border-t-nobilva-accent"></div>
          </div>
          <ul className="space-y-2">
            {caseItem.results.map((result: string, i: number) => (
              <li
                key={i}
                className="flex items-center justify-center text-text/80 text-center"
              >
                <span
                  className="font-medium"
                  style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                >
                  <NumberHighlight
                    text={result}
                    highlightClassName="text-2xl md:text-3xl font-bold text-nobilva-accent inline"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* コメント */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex gap-3 items-center">
            {/* 人のアイコン */}
            <div className="flex-shrink-0 md:hidden">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                <HiOutlineUser className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* 吹き出し */}
            <div className="flex-1 p-4 rounded-none relative">
              {/* 吹き出しのしっぽ */}
              <div className="absolute left-0 top-6 -ml-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-transparent md:hidden"></div>
              <p className="text-text/80 leading-relaxed">
                {caseItem.comment}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
