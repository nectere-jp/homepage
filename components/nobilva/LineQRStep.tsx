/**
 * LineQRStep - フローセクションのSTEP 1（LINE QRコード付き）
 * 
 * フローの最初のステップとして、LINE QRコードとLINEボタンを表示
 * レスポンシブ対応で、モバイル/タブレット/デスクトップで異なるレイアウト
 */

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { addSoftBreaks } from "@/utils/softBreak";
import { LineQRCode } from "./LineQRCode";
import { LineButton } from "./LineButton";

interface LineQRStepProps {
  step: number;
  title: string;
  description: string;
  lineButtonLabel: string;
  lineQRCodeAlt: string;
  index: number;
  isLast: boolean;
}

export function LineQRStep({
  step,
  title,
  description,
  lineButtonLabel,
  lineQRCodeAlt,
  index,
  isLast,
}: LineQRStepProps) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="mb-6 md:mb-8 relative">
        {!isLast && (
          <div className="absolute left-[19px] top-10 w-0.5 h-full bg-nobilva-main/20" />
        )}
        <div className="flex gap-4 md:gap-6 relative">
          <div className="flex-shrink-0 w-10 h-10 bg-nobilva-main flex items-center justify-center text-white font-bold z-10 rounded-full">
            {step}
          </div>
          <div className="pt-1 flex-1">
            <p 
              className="text-base md:text-lg text-blue font-semibold mb-4"
              style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
            >
              {addSoftBreaks(title)}
            </p>
            {/* QRコードとコンテンツ */}
            <div className="flex flex-col">
              {/* QRコードとボタンを横並び（md以上）、左寄せ */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                {/* QRコード */}
                <LineQRCode size="medium" altText={lineQRCodeAlt} />

                {/* モバイル/タブレット: テキストとLINEボタン（QRの右に縦並び） */}
                <div className="flex-1 flex flex-col gap-4 md:gap-4 items-start w-full md:w-auto lg:hidden">
                  {/* テキスト */}
                  <p className="text-sm md:text-base text-text/70 leading-relaxed text-left">
                    {description}
                  </p>
                  {/* LINEボタン */}
                  <div className="flex items-center justify-start w-full md:w-auto">
                    <LineButton label={lineButtonLabel} size="medium" />
                  </div>
                </div>

                {/* デスクトップ: LINEボタン（QRの右に横並び） */}
                <div className="hidden lg:flex flex-1 items-center justify-start">
                  <LineButton label={lineButtonLabel} size="large" />
                </div>
              </div>

              {/* デスクトップ: テキスト（QRとボタンの下） */}
              <p className="hidden lg:block text-sm md:text-base text-text/70 leading-relaxed mt-4 text-left">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
