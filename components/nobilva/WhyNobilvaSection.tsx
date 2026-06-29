import Link from "next/link";
import Image from "next/image";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { CTABanner } from "./CTABanner";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";

interface Reason {
  title: string;
  description: string;
  image?: string;
  placeholder?: boolean;
  link?: { label: string; href: string };
}

const reasons: Reason[] = [
  {
    title: "野球選手特有の事情に合わせた\n学習サポート",
    description:
      "練習スケジュール・遠征・疲労度を考慮した計画を、毎週メンターと作成。試合直前は最小限に、テスト前は集中的にと、野球の年間サイクルに合わせて学習量を調整します。",
    placeholder: true,
    link: { label: "無料でシミュレーションしてみる", href: DIAGNOSIS_PATH },
  },
  {
    title: "どんな進路も逃さない\n最低限の「オール3死守」",
    description:
      "スポーツ推薦でも、一般受験でも、指定校推薦でも――内申点「オール3」があれば選択肢は格段に広がります。Nobilvaは5教科すべてで最低ラインを守る戦略を立てます。",
    placeholder: true,
  },
  {
    title: "毎日サポートがあるから\n練習で疲れた日の「最低限」が守れる",
    description:
      "「今日は疲れたから無理」をゼロにするのではなく、疲れた日用の15分メニューを用意。毎日メンターに報告するから、サボりたい日も最低限だけは守れます。",
    placeholder: true,
  },
  {
    title: "塾や他のオンライン学習塾より\n圧倒的にお得",
    description:
      "通塾型の塾は月3〜5万円、個別指導なら6万円超えも。Nobilvaは月18,000円〜で、日割り計画・週1面談・毎日の進捗確認がすべて含まれています。",
    image: "/images/nobilva/cost-comparison.png",
  },
];

export function WhyNobilvaSection() {
  return (
    <Section>
      <SectionHeading center>Nobilvaが選ばれる理由</SectionHeading>

      <div className="space-y-12 md:space-y-16">
        {reasons.map((reason, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
          >
            {/* 左: 画像 */}
            <div className="w-full md:w-[38%] shrink-0">
              {reason.placeholder ? (
                <div className="aspect-[4/3] bg-gray-200 rounded-lg" />
              ) : reason.image ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={reason.image}
                    alt={reason.title.replace("\n", " ")}
                    fill
                    className="object-cover"
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
        <CTABanner />
      </div>
    </Section>
  );
}
