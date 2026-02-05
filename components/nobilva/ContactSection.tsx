"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { addSoftBreaks } from "@/utils/softBreak";

export function ContactSection() {
  const t = useTranslations("nobilva");

  return (
    <Section id="contact" backgroundColor="transparent" padding="none">
      {/* CTA Section - ページ横幅いっぱい */}
      <div className="bg-nobilva-accent rounded-none px-3 md:px-4 lg:px-5 py-8 md:py-12 lg:py-16 shadow-lg relative overflow-hidden w-full">
        {/* 斜め下半分の濃い影 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent from-50% via-black/10 via-50% to-black/20 to-100% pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-3 md:gap-4 justify-center items-center max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <a
            href="#pricing"
            className="transition-all hover:scale-105 block text-center font-black text-3xl md:text-4xl lg:text-5xl xl:text-6xl py-2 md:py-3 text-white leading-relaxed"
            style={{ wordBreak: 'keep-all', overflowWrap: 'normal' }}
          >
            {t("hero.cta.main").split("\n").map((line, index, array) => (
              <span key={index}>
                {addSoftBreaks(line)}
                {index < array.length - 1 && <br />}
              </span>
            ))}
          </a>
          <a
            href="https://line.me/ti/p/your-line-id"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-line text-white rounded-none p-3 md:p-4 lg:p-5 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-center font-bold text-base md:text-lg lg:text-xl whitespace-nowrap w-auto"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.93c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            {t("hero.cta.line")}
          </a>
        </div>
      </div>
    </Section>
  );
}
