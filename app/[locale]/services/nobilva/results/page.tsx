import type { Metadata } from "next";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { SubpageHero } from "@/components/nobilva/SubpageHero";
import { wb } from "@/lib/wb";
import { SectionHeading } from "@/components/nobilva/SectionHeading";
import { ResultCardGrid } from "@/components/nobilva/ResultCard";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "指導実績 - Nobilva | Nectere",
    description:
      "Nobilva のヘッドコーチ・代表メンターが個別に指導してきた選手たちの実績。提出物率54%向上、定期テスト平均+23点、勉強時間470%向上など、具体的な数字とケーススタディを紹介します。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/results"),
      languages: getAlternatesLanguages("/services/nobilva/results"),
    },
  };
}

interface TimelineStep {
  label: string;
  items: string[];
  highlight?: boolean;
}

interface CaseStudyData {
  id: string;
  name: string;
  subtitle: string;
  timeline: TimelineStep[];
  studentComment: string;
  coachName: string;
  coachComment: string;
}

const caseStudies: CaseStudyData[] = [
  {
    id: "yuki",
    name: "ユウキくん",
    subtitle: "中学3年生 / バスケットボール部 / 指導期間 13ヶ月 / 担当：中村ヘッドコーチ",
    timeline: [
      {
        label: "開始時",
        items: [
          "部活の練習で疲れて、帰宅後に勉強が続かない状態",
          "学校の提出物が半分程度しか出せておらず、テストの点数も伸び悩み",
        ],
      },
      {
        label: "3ヶ月後",
        items: [
          "毎日チャットでの進捗報告が習慣化",
          "週1回の面談で学習計画の振り返り・調整のリズムが定着",
        ],
      },
      {
        label: "半年後",
        items: [
          "提出物の提出率が顕著に改善",
          "英語・社会を中心にテストの点数が向上",
          "大会期間中も「忙しくても続ける」自信がついた",
        ],
      },
      {
        label: "1年後（最終成果）",
        items: [
          "学校提出物の提出率：54% 向上（学期通算 92% 達成）",
          "定期テスト各科目平均点：+23点 向上",
        ],
        highlight: true,
      },
    ],
    studentComment:
      "メンターに報告するから、少しでもやろうって思えるようになった。1日15分でも続けることで、テスト前に焦らなくなった。",
    coachName: "中村ヘッドコーチ",
    coachComment:
      "最初は毎日の報告も忘れがちでしたが、3ヶ月で習慣になりました。量より継続を重視した結果として、大きな変化につながったケースです。",
  },
  {
    id: "ayaka",
    name: "アヤカさん",
    subtitle: "高校3年生 / 指導期間 3ヶ月 / 面談＋チャット＋個別指導 / 担当：養田コーチ",
    timeline: [
      {
        label: "開始時",
        items: [
          "「何をどう勉強すればいいかわからない」状態",
          "週の勉強時間は約3時間、学内テスト順位は下位",
        ],
      },
      {
        label: "1ヶ月後",
        items: [
          "1日30分の学習習慣から開始",
          "わからない問題は写真で送るルールを導入、つまずき即解決",
        ],
      },
      {
        label: "2ヶ月後",
        items: [
          "週の勉強時間が10時間に到達",
          "学内テストで順位の変化が見え始める",
          "「勉強が楽しいかも」という発言が出始める",
        ],
      },
      {
        label: "3ヶ月後（最終成果）",
        items: [
          "勉強時間：470% 向上（週 3h → 14.5h）",
          "学内テスト順位：約 500位 向上",
        ],
        highlight: true,
      },
    ],
    studentComment:
      "勉強する習慣ができて楽しくなりました。毎日応援されるから続けるのが楽でした。",
    coachName: "養田コーチ",
    coachComment:
      "『勉強の仕方がわからない』という状態からのスタートでした。最初の1ヶ月は習慣づけに全振りし、2ヶ月目から時間の使い方の質の向上に取り組みました。3ヶ月で驚くほど意識が変わったケースです。",
  },
];

export default function ResultsPage() {
  return (
    <div className="bg-white min-h-screen">
      <SubpageHero title={wb("ヘッドコーチ・代表メンターの/個別指導実績")} />


      {/* 2. ハイライト数字 */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <ResultCardGrid linkPrefix="#" />
        </div>
      </section>

      {/* 3-4. ケーススタディ */}
      {caseStudies.map((cs) => (
        <CaseStudySection key={cs.id} {...cs} />
      ))}

      {/* 6. CTA */}
      <SubpageCTA
        heading="あなたのご家庭の状況に/合うかどうか、/一度ご相談ください。"
        description="無料学習診断で、/ご家庭の状況に合わせて/率直にご提案します。/その場でお申込みを/決める必要はありません。/30日全額返金保証があります。"
        secondaryLinks={[
          {
            label: "サービスの仕組みを詳しく見る",
            href: "/ja/services/nobilva/how-it-works",
          },
          {
            label: "料金プランを見る",
            href: "/ja/services/nobilva/pricing",
          },
        ]}
      />
    </div>
  );
}

function CaseStudySection({
  id,
  name,
  subtitle,
  timeline,
  studentComment,
  coachName,
  coachComment,
}: CaseStudyData) {
  return (
    <section id={id} className="bg-white py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
        <SectionHeading variant="compact" className="mb-2">{`${name}のケース`}</SectionHeading>
        <p className="text-sm text-gray-500 mb-8">{subtitle}</p>

        <div className="space-y-8">
          {timeline.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${step.highlight ? "bg-nobilva-accent" : "bg-nobilva-main"}`}
                />
                <div className="w-0.5 flex-1 bg-gray-200" />
              </div>
              <div className="pb-2">
                <p
                  className={`text-sm font-bold mb-2 ${step.highlight ? "text-nobilva-accent" : "text-gray-500"}`}
                >
                  {step.label}
                </p>
                <ul className="space-y-1">
                  {step.items.map((item, j) => (
                    <li
                      key={j}
                      className={`text-sm md:text-base leading-relaxed ${step.highlight ? "text-gray-900 font-medium" : "text-gray-700"}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <blockquote className="bg-nobilva-light rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <p className="font-bold text-gray-900 mb-2">
              {name}のコメント
            </p>
            「{studentComment}」
          </blockquote>
          <blockquote className="bg-gray-50 rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <p className="font-bold text-gray-900 mb-2">
              {coachName}のコメント
            </p>
            「{coachComment}」
          </blockquote>
        </div>
      </div>
    </section>
  );
}
