import { wb } from "@/lib/wb";
import { OutlineLink } from "./OutlineLink";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { ResultCardGrid } from "./ResultCard";

export function ResultsSnippetSection() {
  return (
    <Section>
      {/* リード文 */}
      <SectionHeading center className="mb-6" description={
        <div className="space-y-2">
          <p>Nobilva は始まったばかりのサービスです。</p>
          <p>
            {wb("以下は、/ヘッドコーチ・代表メンターが/個別に指導してきた/選手たちの実績です。")}
          </p>
          <p>{wb("同じ仕組みで、/Nobilva の選手にも/伴走しています。")}</p>
        </div>
      }>指導実績</SectionHeading>

      {/* 実績カード */}
      <div className="mb-12">
        <ResultCardGrid />
      </div>

      {/* 全実績リンク */}
      <div className="text-center">
        <OutlineLink href="/ja/services/nobilva/results">
          全ての実績を見る
        </OutlineLink>
      </div>
    </Section>
  );
}
