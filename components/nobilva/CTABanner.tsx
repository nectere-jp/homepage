import Image from "next/image";
import Link from "next/link";
import { LINE_ADD_URL } from "@/lib/constants";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";

const CTA_BG = `linear-gradient(135deg,
  #38bdf8 0%, #38bdf8 70%,
  #2da8e0 70%, #2da8e0 80%,
  #2595c9 80%, #2595c9 90%,
  #1e82b3 90%, #1e82b3 100%
)`;

const lineStyles = {
  inline: {
    container:
      "bg-[#06C755] px-6 py-8 md:px-8 md:py-10 flex flex-col justify-center gap-3 hover:bg-[#05b34c] transition-colors",
    subText: "text-sm text-white/80",
    mainText: "text-xl md:text-2xl text-white",
    noteText: "text-xs md:text-sm text-white/80",
    qrClass: "shrink-0 rounded bg-white p-1",
  },
  final: {
    container:
      "bg-[#06C755] px-6 py-8 md:px-8 md:py-10 flex flex-col justify-center gap-3 hover:bg-[#05b34c] transition-colors",
    subText: "text-sm text-white/80",
    mainText: "text-xl md:text-2xl text-white",
    noteText: "text-xs md:text-sm text-white/80",
    qrClass: "shrink-0 rounded bg-white p-1",
  },
} as const;

type CTABannerProps = {
  variant?: "inline" | "final";
  className?: string;
  diagnosisHref?: string;
  onCTAClick?: () => void;
  hideLine?: boolean;
  monitorTeamBadge?: boolean;
  /** 「毎月20名限定」表示を隠す。チームページなど、限定枠を訴求しない文脈で使用 */
  hideMonthlyLimit?: boolean;
};

export function CTABanner({
  variant = "inline",
  className = "",
  diagnosisHref,
  onCTAClick,
  hideLine = false,
  monitorTeamBadge = false,
  hideMonthlyLimit = false,
}: CTABannerProps) {
  const trackPrefix = variant === "final" ? "final-cta" : "cta-banner";
  const line = lineStyles[variant];
  const resolvedHref = diagnosisHref ?? DIAGNOSIS_PATH;

  return (
    <div
      className={`grid grid-cols-1 ${hideLine ? "" : "md:grid-cols-[1fr_auto]"} gap-4 md:gap-6 ${className}`}
    >
      {/* 左: 無料学習面談 */}
      <div
        className="px-8 py-10 md:pl-10 md:pr-0 md:py-0 flex items-center gap-6 relative overflow-hidden"
        style={{ background: CTA_BG }}
      >
        {/* ポリゴンあしらい */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 600 200"
          aria-hidden="true"
        >
          {/* 大きな三角形 */}
          <polygon points="0,0 180,0 60,200" fill="white" opacity="0.07" />
          <polygon points="120,0 300,0 200,140" fill="white" opacity="0.05" />
          <polygon points="350,0 500,0 420,180" fill="white" opacity="0.04" />
          <polygon points="450,30 600,0 600,120" fill="white" opacity="0.06" />
          {/* 小さなアクセント三角形 */}
          <polygon points="60,200 180,80 140,200" fill="white" opacity="0.08" />
          <polygon points="200,140 300,40 340,200" fill="white" opacity="0.03" />
          <polygon points="480,0 550,0 520,80" fill="white" opacity="0.07" />
          <polygon points="0,100 80,40 40,200" fill="white" opacity="0.04" />
          {/* 線（ノード間接続風） */}
          <line x1="60" y1="200" x2="200" y2="140" stroke="white" strokeWidth="0.5" opacity="0.1" />
          <line x1="200" y1="140" x2="420" y2="180" stroke="white" strokeWidth="0.5" opacity="0.08" />
          <line x1="180" y1="80" x2="300" y2="40" stroke="white" strokeWidth="0.5" opacity="0.07" />
          <line x1="420" y1="180" x2="520" y2="80" stroke="white" strokeWidth="0.5" opacity="0.08" />
          {/* 小さなドット（ノード） */}
          <circle cx="200" cy="140" r="2" fill="white" opacity="0.12" />
          <circle cx="420" cy="180" r="2" fill="white" opacity="0.1" />
          <circle cx="520" cy="80" r="2" fill="white" opacity="0.12" />
          <circle cx="180" cy="80" r="1.5" fill="white" opacity="0.1" />
        </svg>
        <Image
          src="/images/yoda_transparent.webp"
          alt="養田"
          width={240}
          height={240}
          className="absolute right-0 bottom-0 hidden md:block object-contain pointer-events-none"
        />
        <div className="relative flex-1 flex flex-col items-center md:items-start justify-center gap-4 md:py-10">
          {monitorTeamBadge ? (
            <>
              <div>
                <p className="text-base md:text-lg font-bold text-yellow-300 mb-1">
                  モニターチーム様限定
                </p>
                <p className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                  <span className="text-white">全員</span>
                  <span className="text-yellow-300">初月無料</span>
                </p>
                <p className="text-base md:text-lg font-bold text-white mt-3 leading-snug">
                  さらに翌学期末まで、
                  <br className="md:hidden" />
                  チーム特別価格から
                  <span className="text-yellow-300 font-black whitespace-nowrap">
                    さらに月3,000円引き
                  </span>
                </p>
              </div>
              <p className="text-sm md:text-base text-white/85 leading-relaxed">
                <span className="block font-bold text-white text-base md:text-lg mb-1">
                  チームメイトと一緒に、まずは1ヶ月だけ試してみませんか？
                </span>
                30日全額返金保証・違約金なし。
                <wbr />
                合わなければすぐやめられるので、気軽に始められます。
                今こそ、<span className="font-bold text-white">チーム全体で学力を上げるタイミング</span>です。
              </p>
            </>
          ) : (
            <>
              <div>
                {!hideMonthlyLimit && (
                  <p className="text-base md:text-lg text-white/70 mb-1">
                    毎月20名限定
                  </p>
                )}
                <p className="text-3xl md:text-4xl lg:text-5xl font-black">
                  <span className="text-white">無料学習面談</span>
                  <span className="text-white">実施中！</span>
                </p>
              </div>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                練習スケジュール、得意・苦手、<wbr />志望進路を伺ったうえで、
                <br />
                ご家庭に合わせた学習プランを<wbr />具体的にお見せします。
                <br />
                <span className="font-bold text-white">
                  判断材料として、お持ち帰りください。
                </span>
              </p>
            </>
          )}
          <Link
            href={resolvedHref}
            onClick={onCTAClick}
            data-track-cta={`${trackPrefix}-diagnosis`}
            className="inline-block bg-orange-500 text-white font-bold text-base md:text-lg px-8 py-3.5 hover:bg-orange-600 transition-colors"
          >
            今すぐ申し込む →
          </Link>
        </div>
      </div>

      {/* 右: LINE相談 */}
      {!hideLine && (
      <a
        href={LINE_ADD_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-track-cta={`${trackPrefix}-line`}
        className={line.container}
      >
        <div>
          <p className="text-sm md:text-base text-white/80 font-normal">
            <span className="text-white/60">または</span> まずは気楽に
          </p>
          <p className="text-2xl md:text-3xl font-black text-white">LINEで質問/相談</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs md:text-sm text-white/70">特典として</p>
            <p className="text-lg md:text-xl font-black text-yellow-300 leading-tight">
              野球×受験の基本
            </p>
            <p className="text-base md:text-lg font-bold text-white">
              資料をプレゼント！
            </p>
          </div>
          <Image
            src="/images/nobilva/line-qr.png"
            alt="LINE QRコード"
            width={100}
            height={100}
            className={line.qrClass}
          />
        </div>
      </a>
      )}
    </div>
  );
}
