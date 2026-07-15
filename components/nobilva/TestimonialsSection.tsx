import Image from "next/image";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { CTABanner } from "./CTABanner";

interface Testimonial {
  role: "子供" | "保護者";
  title: string;
  body: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    role: "子供",
    title: "Nobilvaのおかげで勉強がきつい時期でも勉強できました！",
    body: "夏の大会前は毎日練習で本当にきつかったけど、メンターが「今週は英単語だけでOK」と計画を調整してくれたので、完全にゼロにならずに済みました。大会が終わった後もスムーズに勉強のリズムを取り戻せました。",
    image: "/images/nobilva/voices/01-training-study.png",
  },
  {
    role: "保護者",
    title: "成績表から2が消えて安心しました",
    body: "中2の後半から成績が下がり始め、通知表に2が並んだときは正直焦りました。Nobilvaを始めてからは毎日少しずつでも机に向かうようになり、3学期にはすべて3以上に。進路の選択肢が広がったことが何より嬉しいです。",
    image: "/images/nobilva/voices/02-parent-report.png",
  },
  {
    role: "子供",
    title: "希望していた高校に進学できました。",
    body: "中3の春から始めて、最初は正直間に合うか不安でした。でもメンターが内申点を逆算して計画を立ててくれて、毎日やることが明確だったので迷わず続けられました。高校生になってからも勉強のリズムができていたのでよかったです。",
    image: "/images/nobilva/voices/03-high-school.png",
  },
];

interface TestimonialsSectionProps {
  diagnosisHref?: string;
  onCTAClick?: () => void;
  hideLine?: boolean;
  monitorTeamBadge?: boolean;
}

export function TestimonialsSection({
  diagnosisHref,
  onCTAClick,
  hideLine,
  monitorTeamBadge,
}: TestimonialsSectionProps = {}) {
  return (
    <Section>
      <SectionHeading center>利用者様の声</SectionHeading>

      <div className="divide-y divide-gray-200">
        {testimonials.map((t, i) => {
          const imageLeft = i % 2 === 0;

          const image = (
            <div className="w-full md:w-[30%] shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={t.image}
                  alt={t.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
              </div>
              <p className="text-center text-xs text-gray-500 mt-1.5">
                {t.role}
              </p>
            </div>
          );

          const text = (
            <div className="w-full md:flex-1 space-y-3">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-snug">
                {t.title}
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {t.body}
              </p>
            </div>
          );

          return (
            <div
              key={i}
              className="flex flex-col md:flex-row items-center gap-6 md:gap-10 py-10 md:py-12 first:pt-0 last:pb-0"
            >
              {imageLeft ? (
                <>
                  {image}
                  {text}
                </>
              ) : (
                <>
                  {text}
                  {image}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA バナー */}
      <div className="mt-14 md:mt-18">
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
