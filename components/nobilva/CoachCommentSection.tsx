/**
 * CoachCommentSection - 学習コーチからのコメントセクション
 *
 * 学習ヘッドコーチの自己紹介と指導方針を表示するブロック。
 * 左側にコーチ画像（ryuto.svg）、右側に名前・コメント本文。
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { addSoftBreaks } from "@/utils/softBreak";

const COACH_IMAGE_PATH = "/images/nobilva/ryuto.svg";

interface CoachCommentSectionProps {
  mainTitle: string;
  coachName: string;
  role: string;
  comment: string;
}

export function CoachCommentSection({
  mainTitle,
  coachName,
  role,
  comment,
}: CoachCommentSectionProps) {
  return (
    <Section
      id="coach-comment"
      backgroundColor="transparent"
      className="bg-nobilva-light"
      padding="md"
    >
      <Container>
        <SectionHeader mainTitle={mainTitle} theme="nobilva" />
        <div className="flex flex-col md:flex-row min-h-[200px] gap-6 md:gap-8 items-center md:items-stretch">
          {/* 左: 白丸背景のコーチ画像（lg以上で表示） */}
          <div className="hidden lg:flex flex-shrink-0 items-center justify-center p-6 md:py-8 md:pl-0">
            <div className="rounded-full bg-white p-4 shadow-sm flex items-center justify-center w-40 h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
              <div className="relative w-full h-full aspect-[800/434] max-w-[140px] md:max-w-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={COACH_IMAGE_PATH}
                  alt=""
                  width={800}
                  height={434}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          {/* 右: 名前・コメント（背景なし） */}
          <div className="flex-1 p-0 md:py-8 flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">
              {coachName}
              {role ? ` ${role}` : ""}
            </h3>
            <p
              className="text-base text-black leading-relaxed"
              style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
            >
              {addSoftBreaks(comment)}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
