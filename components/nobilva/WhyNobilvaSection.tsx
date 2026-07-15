"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { NobilvaLogo } from "./Icons";
import { CTABanner } from "./CTABanner";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";

interface Reason {
  title: string;
  description: string;
  image?: string;
  placeholder?: boolean;
  chart?: boolean;
  link?: { label: string; href: string };
}

function buildReasons(diagnosisHref: string): Reason[] {
  return [
    {
      title: "野球選手特有の事情に合わせた\n学習サポート",
      description:
        "練習スケジュール・遠征・疲労度を考慮した計画を、毎週メンターと作成。試合直前は最小限に、テスト前は集中的にと、野球の年間サイクルに合わせて学習量を調整します。",
      image: "/images/nobilva/why/01-planning.png",
      link: { label: "無料でシミュレーションしてみる", href: diagnosisHref },
    },
    {
      title: "どんな進路も逃さない\n最低限の「オール3死守」",
      description:
        "野球推薦でも、一般受験でも、指定校推薦でも――内申点「オール3」があれば選択肢は格段に広がります。Nobilvaは5教科すべてで最低ラインを守る戦略を立てます。",
      image: "/images/nobilva/why/02-baseline.png",
    },
    {
      title: "毎日サポートがあるから\n練習で疲れた日の「最低限」が守れる",
      description:
        "「今日は疲れたから無理」をゼロにするのではなく、疲れた日用の15分メニューを用意。毎日メンターに報告するから、サボりたい日も最低限だけは守れます。",
      image: "/images/nobilva/why/03-daily-support.png",
    },
    {
      title: "塾や他のオンライン学習塾より\n圧倒的にお得",
      description:
        "通塾型の塾は月3〜5万円、個別指導なら6万円超えも。Nobilvaは月18,000円〜で、日割り計画・週1面談・毎日の進捗確認がすべて含まれています。",
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
            <div className="w-full md:w-[38%] shrink-0">
              {reason.chart ? (
                <MiniCostChart />
              ) : reason.placeholder ? (
                <div className="aspect-[4/3] bg-gray-200 rounded-lg" />
              ) : reason.image ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={reason.image}
                    alt={reason.title.replace("\n", " ")}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 38vw"
                  />
                </div>
              ) : null}
            </div>

            {/* 右: テキスト */}
            <div className="w-full md:flex-1 space-y-3">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-snug whitespace-pre-line">
                {reason.title}
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {reason.description}
              </p>
              {reason.link && (
                <Link
                  href={reason.link.href}
                  className="inline-flex items-center gap-1 text-gray-900 font-bold text-sm md:text-base hover:underline"
                >
                  {reason.link.label}
                  <span>&rarr;</span>
                </Link>
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
