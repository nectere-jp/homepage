/**
 * FlowList - フローリストコンポーネント
 * 
 * フローアイテムのリストを表示
 * STEP 1は特別な表示（QRコード付き）で、それ以外は通常のフローアイテム
 */

import { LineQRStep } from "./LineQRStep";
import { FlowItem } from "./FlowItem";

interface FlowItemType {
  step: number;
  title: string;
  description: string;
  optional?: boolean;
}

interface FlowListProps {
  items: FlowItemType[];
  lineButtonLabel: string;
  optionalText: string;
  lineQRCodeAlt: string;
  isTeam?: boolean;
}

export function FlowList({
  items,
  lineButtonLabel,
  optionalText,
  lineQRCodeAlt,
  isTeam = false,
}: FlowListProps) {
  return (
    <div className="relative">
      {items.map((item, i, arr) => {
        const isLast = i === arr.length - 1;

        // STEP 1の特別な表示（QRコードとLINEボタン）
        if (item.step === 1) {
          return (
            <LineQRStep
              key={i}
              step={item.step}
              title={item.title}
              description={item.description}
              lineButtonLabel={lineButtonLabel}
              lineQRCodeAlt={lineQRCodeAlt}
              index={i}
              isLast={isLast}
            />
          );
        }

        return (
          <FlowItem
            key={i}
            step={item.step}
            title={item.title}
            description={item.description}
            optional={item.optional}
            optionalText={optionalText}
            index={i}
            isLast={isLast}
            isTeam={isTeam}
          />
        );
      })}
    </div>
  );
}
