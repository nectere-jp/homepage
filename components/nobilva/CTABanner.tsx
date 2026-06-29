import Image from "next/image";
import Link from "next/link";
import { LINE_ADD_URL } from "@/lib/constants";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";

export function CTABanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 ${className}`}
    >
      {/* 左: 無料学習面談 */}
      <div className="bg-gray-200 px-8 py-8 md:px-10 md:py-10 flex flex-col items-center md:items-start justify-center gap-4">
        <div>
          <p className="text-sm md:text-base text-gray-700 mb-1">
            毎月20名限定
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900">
            無料学習面談はこちら！
          </p>
        </div>
        <Link
          href={DIAGNOSIS_PATH}
          data-track-cta="cta-banner-diagnosis"
          className="inline-block border-2 border-gray-900 text-gray-900 font-bold text-sm md:text-base px-6 py-3 hover:bg-gray-900 hover:text-white transition-colors"
        >
          無料学習診断に申し込む
        </Link>
      </div>

      {/* 右: LINE相談 */}
      <a
        href={LINE_ADD_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-track-cta="cta-banner-line"
        className="border-2 border-[#06C755] px-6 py-6 md:px-8 md:py-8 flex flex-col justify-center gap-3 hover:bg-[#06C755]/5 transition-colors"
      >
        <div>
          <p className="text-sm text-gray-600 mb-0.5">または...</p>
          <p className="text-base md:text-lg text-gray-900">
            <span className="font-bold">まずは気楽に</span>{" "}
            LINEで質問/相談
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs md:text-sm text-gray-600">
              「スポーツ×受験の基本のき」
              <br />
              プレゼント中！
            </p>
          </div>
          <Image
            src="/images/nobilva/line-qr.png"
            alt="LINE QRコード"
            width={60}
            height={60}
            className="shrink-0"
          />
        </div>
      </a>
    </div>
  );
}
