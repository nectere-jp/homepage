import Image from "next/image";
import Link from "next/link";
import { LINE_ADD_URL } from "@/lib/constants";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";
import { Section } from "./Section";

export function FinalCTASection() {
  return (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6">
        {/* 左: 無料学習面談 */}
        <div className="bg-nobilva-accent px-8 py-10 md:px-10 md:py-12 flex flex-col items-center md:items-start justify-center gap-5">
          <div>
            <p className="text-sm md:text-base text-white/80 mb-1">
              毎月20名限定
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
              無料学習面談はこちら！
            </p>
          </div>
          <Link
            href={DIAGNOSIS_PATH}
            data-track-cta="final-cta-diagnosis"
            className="inline-block border-2 border-white text-white font-bold text-sm md:text-base px-6 py-3 hover:bg-white hover:text-nobilva-accent transition-colors"
          >
            無料学習診断に申し込む
          </Link>
        </div>

        {/* 右: LINE相談 */}
        <a
          href={LINE_ADD_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-track-cta="final-cta-line"
          className="bg-[#06C755] px-6 py-6 md:px-8 md:py-8 flex flex-col justify-center gap-3 hover:bg-[#05b34c] transition-colors"
        >
          <div>
            <p className="text-sm text-white/80 mb-0.5">または...</p>
            <p className="text-base md:text-lg text-white">
              <span className="font-bold">まずは気楽に</span>{" "}
              LINEで質問/相談
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-white/80">
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
              className="shrink-0 rounded bg-white p-1"
            />
          </div>
        </a>
      </div>
    </Section>
  );
}
