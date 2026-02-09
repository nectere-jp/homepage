import { addSoftBreaks } from "@/utils/softBreak";
import { LINE_ADD_URL } from "@/lib/constants";
import { SportIllustration } from "./SportIllustration";

interface HeroCTAProps {
  heroCtaMain: string;
  heroCtaLine: string;
  currentSport: string;
  sportFileName: string | undefined;
  imageError: Record<string, boolean>;
  handleImageError: (sport: string) => void;
  heroImageAlt: string;
}

export function HeroCTA({
  heroCtaMain,
  heroCtaLine,
  currentSport,
  sportFileName,
  imageError,
  handleImageError,
  heroImageAlt,
}: HeroCTAProps) {
  return (
    <div className="bg-nobilva-accent md:bg-transparent lg:bg-nobilva-accent rounded-none py-6 px-1.5 md:py-6 md:px-0 lg:py-6 lg:px-3 2xl:py-10 2xl:px-4 shadow-lg md:shadow-none lg:shadow-lg -mx-8 md:-mx-12 lg:-mx-16 2xl:-mx-24 px-8 md:px-12 lg:px-16 2xl:px-24 mt-24 md:mt-12 lg:mt-16 2xl:mt-20 relative overflow-hidden">
      {/* 斜め下半分の濃い影 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent from-50% via-black/10 via-50% to-black/20 to-100% pointer-events-none lg:block"></div>
      <div className="relative z-10 w-[95%] lg:w-full mx-auto flex flex-col md:flex-row lg:flex-col gap-3 md:gap-4 2xl:gap-6 justify-center items-center">
        {/* Sports Illustration (mdのみ表示、lg以上は非表示、smは非表示) */}
        <div className="hidden md:flex lg:hidden">
          <SportIllustration
            currentSport={currentSport}
            sportFileName={sportFileName}
            imageError={imageError}
            handleImageError={handleImageError}
            heroImageAlt={heroImageAlt}
            size="small"
          />
        </div>
        <div className="flex flex-col md:flex-col lg:flex-row gap-3 md:gap-4 2xl:gap-6 items-center md:bg-nobilva-accent md:rounded-none md:px-3 md:py-10 md:shadow-lg md:relative md:overflow-hidden lg:bg-transparent lg:rounded-none lg:p-0 lg:shadow-none">
          {/* mdでの斜め下半分の濃い影 */}
          <div className="hidden md:block lg:hidden absolute inset-0 bg-gradient-to-br from-transparent from-50% via-black/10 via-50% to-black/20 to-100% pointer-events-none"></div>
          <a
            href="#pricing"
            className="relative z-10 transition-all hover:scale-105 block text-center font-black text-xl md:text-2xl lg:text-3xl 2xl:text-5xl py-0.5 md:py-1 2xl:py-2 text-white mr-0 md:mr-0 lg:mr-8 2xl:mr-10"
            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
          >
            {heroCtaMain.split("\n").map((line, index, array) => (
              <span key={index}>
                {addSoftBreaks(line)}
                {index < array.length - 1 && <br />}
              </span>
            ))}
          </a>
          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 bg-line text-white rounded-none px-4 py-2.5 md:p-3 lg:p-4 2xl:p-5 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 2xl:gap-3 text-center font-bold text-sm md:text-base lg:text-lg 2xl:text-xl whitespace-nowrap w-auto"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 2xl:w-8 2xl:h-8"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.93c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            {heroCtaLine}
          </a>
        </div>
      </div>
    </div>
  );
}
