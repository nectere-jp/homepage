import Image from "next/image";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { LINE_ADD_URL } from "@/lib/constants";

interface LineQRStepProps {
  step: number;
  title: string;
  description: string;
  lineButtonLabel: string;
  index: number;
  isLast: boolean;
}

export function LineQRStep({
  step,
  title,
  description,
  lineButtonLabel,
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
            <p className="text-base md:text-lg text-blue font-semibold mb-4">
              {title}
            </p>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
              {/* QRコード */}
              <div className="flex-shrink-0">
                <div className="bg-white p-2 rounded-lg w-32 h-32 md:w-40 md:h-40 flex items-center justify-center border-2 border-green-500">
                  <Image
                    src="/images/nobilva/line-qr.png"
                    alt="LINE QR Code"
                    width={160}
                    height={160}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* LINEボタン */}
              <div className="flex-1 flex items-center justify-center">
                <a
                  href={LINE_ADD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-line text-white rounded-none p-3 md:p-4 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-center font-bold text-base md:text-lg whitespace-nowrap"
                >
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.93c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  {lineButtonLabel}
                </a>
              </div>
            </div>
            <p className="text-sm md:text-base text-text/70 leading-relaxed mt-4">
              {description}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
