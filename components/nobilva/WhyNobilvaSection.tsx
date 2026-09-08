"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { NobilvaLogo } from "./Icons";
import { CTABanner } from "./CTABanner";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";
import { OutlineLink } from "./OutlineLink";

interface Reason {
  title: ReactNode;
  imageAlt: string;
  description: ReactNode;
  image?: string;
  placeholder?: boolean;
  chart?: boolean;
  link?: { label: string; href: string };
}

function buildReasons(diagnosisHref: string): Reason[] {
  return [
    {
      title: (
        <>
          野球選手<wbr />特有の<wbr />事情に<wbr />合わせた
          <br />
          学習<wbr />サポート
        </>
      ),
      imageAlt: "野球選手特有の事情に合わせた学習サポート",
      description: (
        <>
          練習スケジュール・<wbr />遠征・<wbr />疲労度を<wbr />考慮した計画を、<wbr />
          毎週<wbr />メンターと<wbr />作成。<wbr />
          試合直前は最小限に、<wbr />テスト前は集中的にと、<wbr />
          野球の<wbr />年間サイクルに<wbr />合わせて<wbr />学習量を<wbr />調整します。
        </>
      ),
      image: "/images/nobilva/why/01-planning.png",
      link: { label: "無料でシミュレーションしてみる", href: diagnosisHref },
    },
    {
      title: (
        <>
          どんな進路も<wbr />逃さない
          <br />
          最低限の<wbr />「オール3<wbr />死守」
        </>
      ),
      imageAlt: "どんな進路も逃さない最低限のオール3死守",
      description: (
        <>
          野球推薦でも、<wbr />一般受験でも、<wbr />指定校推薦でも――<wbr />
          内申点「オール3」があれば<wbr />選択肢は<wbr />格段に<wbr />広がります。<wbr />
          Nobilvaは<wbr />5教科<wbr />すべてで<wbr />最低ラインを<wbr />守る<wbr />戦略を<wbr />立てます。
        </>
      ),
      image: "/images/nobilva/why/02-baseline.png",
    },
    {
      title: (
        <>
          毎日<wbr />サポートが<wbr />あるから
          <br />
          練習で<wbr />疲れた日の<wbr />「最低限」が<wbr />守れる
        </>
      ),
      imageAlt: "毎日サポートがあるから練習で疲れた日の最低限が守れる",
      description: (
        <>
          「今日は疲れたから無理」を<wbr />ゼロに<wbr />するのではなく、<wbr />
          疲れた日用の<wbr />15分<wbr />メニューを<wbr />用意。<wbr />
          毎日<wbr />メンターに<wbr />報告するから、<wbr />サボりたい日も<wbr />最低限だけは<wbr />守れます。
        </>
      ),
      image: "/images/nobilva/why/03-daily-support.png",
    },
    {
      title: (
        <>
          塾や<wbr />他の<wbr />オンライン<wbr />学習塾より
          <br />
          圧倒的に<wbr />お得
        </>
      ),
      imageAlt: "塾や他のオンライン学習塾より圧倒的にお得",
      description: (
        <>
          通塾型の塾は<wbr />月3〜5万円、<wbr />個別指導なら<wbr />6万円超えも。<wbr />
          Nobilvaは<wbr />月18,000円〜で、<wbr />
          日割り計画・<wbr />週1面談・<wbr />毎日の<wbr />進捗確認が<wbr />すべて<wbr />含まれています。
        </>
      ),
      chart: true,
    },
  ];
}

const subjects = [
  { label: "英語", amount: 15000, color: "#ef4444" },
  { label: "数学", amount: 15000, color: "#f97316" },
  { label: "国語", amount: 12000, color: "#eab308" },
  { label: "理科", amount: 10000, color: "#22c55e" },
  { label: "社会", amount: 10000, color: "#3b82f6" },
];
const jukuTotal = subjects.reduce((s, v) => s + v.amount, 0);

function MiniCostChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nobilvaHeight = (18000 / jukuTotal) * 100;

  return (
    <div ref={ref} className="bg-white rounded-lg p-5 aspect-[4/3] flex flex-col">
      <div className="flex-1 flex items-end justify-center gap-8 md:gap-12 pb-4">
        <div className="flex flex-col items-center gap-2 w-24 md:w-28">
          <span className="text-xs md:text-sm font-bold text-nobilva-accent">¥18,000〜</span>
          <div className="w-full relative" style={{ height: "180px" }}>
            <div
              className="absolute bottom-0 w-full rounded-t-md bg-nobilva-accent transition-all duration-1000 ease-out flex items-center justify-center"
              style={{ height: visible ? `${nobilvaHeight}%` : "0%" }}
            >
              <span className="text-[10px] md:text-xs text-white font-bold">全科目</span>
            </div>
          </div>
          <NobilvaLogo height={14} />
        </div>
        <div className="flex flex-col items-center gap-2 w-24 md:w-28">
          <span className="text-xs md:text-sm font-bold text-gray-500">¥{jukuTotal.toLocaleString()}〜</span>
          <div className="w-full relative" style={{ height: "180px" }}>
            {(() => {
              let offset = 0;
              return subjects.map((subj, i) => {
                const h = (subj.amount / jukuTotal) * 100;
                const bottom = offset;
                offset += h;
                return (
                  <div
                    key={subj.label}
                    className="absolute w-full flex items-center justify-center transition-all duration-1000 ease-out"
                    style={{
                      bottom: `${bottom}%`,
                      height: visible ? `${h}%` : "0%",
                      backgroundColor: subj.color,
                      transitionDelay: visible ? `${i * 150}ms` : "0ms",
                      borderTopLeftRadius: i === subjects.length - 1 ? "0.375rem" : 0,
                      borderTopRightRadius: i === subjects.length - 1 ? "0.375rem" : 0,
                    }}
                  >
                    <span className="text-[10px] md:text-xs text-white font-bold">{subj.label}</span>
                  </div>
                );
              });
            })()}
          </div>
          <span className="text-xs md:text-sm font-bold text-gray-700">一般的な学習塾</span>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-2 text-center">
        <p className="text-[10px] md:text-xs text-gray-400">※5科目受講時の月額目安</p>
      </div>
    </div>
  );
}

interface WhyNobilvaSectionProps {
  diagnosisHref?: string;
  onCTAClick?: () => void;
  hideLine?: boolean;
  monitorTeamBadge?: boolean;
}

export function WhyNobilvaSection({
  diagnosisHref,
  onCTAClick,
  hideLine,
  monitorTeamBadge,
}: WhyNobilvaSectionProps = {}) {
  const resolvedHref = diagnosisHref ?? DIAGNOSIS_PATH;
  const reasons = buildReasons(resolvedHref);

  return (
    <Section>
      <SectionHeading center>Nobilvaが選ばれる理由</SectionHeading>

      <div className="space-y-12 md:space-y-16">
        {reasons.map((reason, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
          >
            {/* 左: 画像 or チャート */}
            <div className="w-3/4 max-w-[280px] mx-auto md:w-[38%] md:max-w-none md:mx-0 shrink-0">
              {reason.chart ? (
                <MiniCostChart />
              ) : reason.placeholder ? (
                <div className="aspect-[4/3] bg-gray-200 rounded-lg" />
              ) : reason.image ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={reason.image}
                    alt={reason.imageAlt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 38vw"
                  />
                </div>
              ) : null}
            </div>

            {/* 右: テキスト */}
            <div className="w-full md:flex-1 space-y-3">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-snug break-keep">
                {reason.title}
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed break-keep">
                {reason.description}
              </p>
              {reason.link && (
                <div className="pt-2">
                  <OutlineLink href={reason.link.href}>
                    {reason.link.label}
                  </OutlineLink>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA バナー */}
      <div className="mt-16 md:mt-20">
        <CTABanner
          diagnosisHref={diagnosisHref}
          onCTAClick={onCTAClick}
          hideLine={hideLine}
          monitorTeamBadge={monitorTeamBadge}
        />
      </div>
    </Section>
  );
}
