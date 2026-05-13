import type { Metadata } from "next";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
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

export default function ResultsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー */}
      <section className="bg-white pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            ヘッドコーチ・代表メンターの個別指導実績
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            Nobilva は始まったばかりのサービスです。以下は、サービス立ち上げ前から個別に指導してきた選手たちの実績をご紹介します。
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
            本ページの実績は2026年3月以前の個別指導によるものです。Nobilva
            直接生徒のケーススタディは、6〜12ヶ月後に順次追加掲載予定です。
          </div>
        </div>
      </section>

      {/* 2. ハイライト数字 */}
      <section className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* ユウキくん */}
            <a href="#yuki" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow block">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                ユウキくん
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                中学3年生 / バスケットボール部 / 指導期間 13ヶ月
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">学校提出物の提出率</p>
                  <p className="text-2xl md:text-3xl font-bold text-nobilva-accent">
                    54%<span className="text-lg"> 向上</span>
                  </p>
                  <p className="text-sm text-gray-600">学期通算 92% 達成</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">定期テスト各科目平均点</p>
                  <p className="text-2xl md:text-3xl font-bold text-nobilva-accent">
                    +23<span className="text-lg">点 向上</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                「大会前の忙しい時期も、メンターと一緒に立てた計画のおかげで勉強を続けられました。」
              </p>
            </a>

            {/* アヤカさん */}
            <a href="#ayaka" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow block">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                アヤカさん
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                高校3年生 / 指導期間 3ヶ月
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">勉強時間</p>
                  <p className="text-2xl md:text-3xl font-bold text-nobilva-accent">
                    470%<span className="text-lg"> 向上</span>
                  </p>
                  <p className="text-sm text-gray-600">週 3h → 14.5h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">学内テスト順位</p>
                  <p className="text-2xl md:text-3xl font-bold text-nobilva-accent">
                    約500<span className="text-lg">位 向上</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                「最初は問題集の答えを見ても何もわからずフリーズする状態でしたが、だんだん勉強する習慣ができて楽しくなりました。」
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* 3. ケーススタディ：ユウキくん */}
      <section id="yuki" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-2">
            ユウキくんのケース
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            中学3年生 / バスケットボール部 / 指導期間 13ヶ月 / 担当：中村龍人
          </p>

          <div className="space-y-8">
            <TimelineBlock
              label="開始時"
              items={[
                "部活の練習で疲れて、帰宅後に勉強が続かない状態",
                "学校の提出物が半分程度しか出せておらず、テストの点数も伸び悩み",
              ]}
            />
            <TimelineBlock
              label="3ヶ月後"
              items={[
                "毎日チャットでの進捗報告が習慣化",
                "週1回の面談で学習計画の振り返り・調整のリズムが定着",
              ]}
            />
            <TimelineBlock
              label="半年後"
              items={[
                "提出物の提出率が顕著に改善",
                "英語・社会を中心にテストの点数が向上",
                "大会期間中も「忙しくても続ける」自信がついた",
              ]}
            />
            <TimelineBlock
              label="1年後（最終成果）"
              items={[
                "学校提出物の提出率：54% 向上（学期通算 92% 達成）",
                "定期テスト各科目平均点：+23点 向上",
              ]}
              highlight
            />
          </div>

          <div className="mt-8 space-y-4">
            <blockquote className="bg-nobilva-light rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">ユウキくんのコメント</p>
              「メンターに報告するから、少しでもやろうって思えるようになった。1日15分でも続けることで、テスト前に焦らなくなった。」
            </blockquote>
            <blockquote className="bg-gray-50 rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">
                中村龍人のコメント
              </p>
              「最初は毎日の報告も忘れがちでしたが、3ヶ月で習慣になりました。量より継続を重視した結果として、大きな変化につながったケースです。」
            </blockquote>
          </div>
        </div>
      </section>

      {/* 4. ケーススタディ：アヤカさん */}
      <section id="ayaka" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-2">
            アヤカさんのケース
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            高校3年生 / 指導期間 3ヶ月 / 面談＋チャット＋個別指導 / 担当：中村龍人
          </p>

          <div className="space-y-8">
            <TimelineBlock
              label="開始時"
              items={[
                "「何をどう勉強すればいいかわからない」状態",
                "週の勉強時間は約3時間、学内テスト順位は下位",
              ]}
            />
            <TimelineBlock
              label="1ヶ月後"
              items={[
                "1日30分の学習習慣から開始",
                "わからない問題は写真で送るルールを導入、つまずき即解決",
              ]}
            />
            <TimelineBlock
              label="2ヶ月後"
              items={[
                "週の勉強時間が10時間に到達",
                "学内テストで順位の変化が見え始める",
                "「勉強が楽しいかも」という発言が出始める",
              ]}
            />
            <TimelineBlock
              label="3ヶ月後（最終成果）"
              items={[
                "勉強時間：470% 向上（週 3h → 14.5h）",
                "学内テスト順位：約 500位 向上",
              ]}
              highlight
            />
          </div>

          <div className="mt-8 space-y-4">
            <blockquote className="bg-white rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">
                アヤカさんのコメント
              </p>
              「勉強する習慣ができて楽しくなりました。毎日応援されるから続くのが楽でした。」
            </blockquote>
            <blockquote className="bg-white rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">
                中村龍人のコメント
              </p>
              「『勉強の仕方がわからない』という状態からのスタートでした。最初の1ヶ月は量よりも習慣に全振りし、2ヶ月目から質の議論に移行しました。3ヶ月で驚くほど意識が変わったケースです。」
            </blockquote>
          </div>
        </div>
      </section>

      {/* 5. Nobilva 直接生徒の実績について */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            Nobilva 直接生徒の実績について
          </h2>
          <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              Nobilva は2026年3月に開始したサービスです。2026年5月現在、フルケーススタディとして公開できる段階にはまだ達していません。6ヶ月〜1年後に、Nobilva
              直接生徒のケーススタディを順次追加掲載する予定です。
            </p>
            <p>
              現時点では、上記の個別指導実績・サービスの仕組み詳細・30日全額返金保証・無料学習診断をご判断材料としてお使いください。
            </p>
            <div className="bg-nobilva-light rounded-xl p-6 mt-6">
              <h3 className="font-bold text-gray-900 mb-2">
                始まったばかりのサービスを選んでいただく方へ
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                大手の長期実績はありません。しかし、始まったばかりだからこそ、指導者が直接一人ひとりに向き合い、丁寧に対応できる段階にあります。最初の生徒の皆さまに感謝しながら、全力で伴走しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <SubpageCTA
        heading="あなたのご家庭の状況に合うかどうか、一度ご相談ください。"
        description="無料学習診断で、ご家庭の状況に合わせて率直にご提案します。その場でお申込みを決める必要はありません。30日全額返金保証があります。"
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

function TimelineBlock({
  label,
  items,
  highlight,
}: {
  label: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${highlight ? "bg-nobilva-accent" : "bg-nobilva-main"}`}
        />
        <div className="w-0.5 flex-1 bg-gray-200" />
      </div>
      <div className="pb-2">
        <p
          className={`text-sm font-bold mb-2 ${highlight ? "text-nobilva-accent" : "text-gray-500"}`}
        >
          {label}
        </p>
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className={`text-sm md:text-base leading-relaxed ${highlight ? "text-gray-900 font-medium" : "text-gray-700"}`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
