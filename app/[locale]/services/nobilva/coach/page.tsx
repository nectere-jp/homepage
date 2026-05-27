import type { Metadata } from "next";
import Image from "next/image";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { SubpageHero } from "@/components/nobilva/SubpageHero";
import { wb } from "@/lib/wb";
import { SectionHeading } from "@/components/nobilva/SectionHeading";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "指導者紹介 - Nobilva | Nectere",
    description:
      "Nobilva のヘッドコーチ・中村龍人（東京大学 計数工学科）の経歴・指導観を紹介します。代表メンター・養田貴大のプロフィールは準備中です。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/coach"),
      languages: getAlternatesLanguages("/services/nobilva/coach"),
    },
  };
}

export default function CoachPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "中村龍人",
      jobTitle: "ヘッドコーチ",
      affiliation: { "@type": "Organization", name: "Nectere" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "東京大学 工学部 計数工学科" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "養田貴大",
      jobTitle: "代表メンター",
      affiliation: { "@type": "Organization", name: "Nectere" },
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SubpageHero title={wb("Nobilva の指導者を/紹介します。")}>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
          顔写真は掲載しておりません。アバターイラストでご紹介しています。
        </div>
      </SubpageHero>

      {/* 2. ヘッドコーチ 中村龍人 */}
      <section id="nakamura" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-sm overflow-hidden">
                <Image
                  src="/images/nobilva/ryuto.svg"
                  alt="ヘッドコーチ 中村龍人のアバターイラスト"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-nobilva-accent font-medium mb-1">
                ヘッドコーチ / Nectere 共同代表
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                中村龍人
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                なかむら りゅうと / 東京大学 計数工学科 在学中
              </p>

              <blockquote className="text-base md:text-lg text-gray-700 border-l-3 border-nobilva-main pl-4 mb-6">
                「続けられない自分を責めるのではなく、続けられる仕組みを外側に作る。」
              </blockquote>

              <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">経歴</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>東京都立戸山高校 卒業</li>
                    <li>東京大学 工学部 計数工学科 2024年入学</li>
                    <li>
                      小学生時代に野球、中学時代にFIRST LEGO League、高校では3年9月までブラスバンド部に所属
                    </li>
                    <li>Nectere 共同創業</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    学習と部活の両立への想い
                  </h3>
                  <p>
                    高校3年の9月までブラスバンド部で活動を続けながら受験準備を進めた経験から、「やりたいこと」と「やるべきこと」を並行させる難しさを自分の身体で理解しています。小学生の頃には野球もやっていました。練習で疲れて帰ってきて、宿題に手をつける気力が残らない感覚は、いまも覚えています。
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">指導観</h3>
                  <p>
                    「やる気がない」のではなく「続けられる仕組みがない」だけ。メンターは「先生」ではなく「伴走者」として接します。教えるのではなく、一緒に走る。計画を渡すのではなく、一緒に作る。それが結局、一番遠くまで連れて行ってくれると信じています。
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 代表メンター 養田貴大 */}
      <section id="yoda" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 shadow-sm flex items-center justify-center text-2xl text-gray-400">
                YT
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-nobilva-accent font-medium mb-1">
                代表メンター / Nectere 共同代表
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                養田貴大
              </h2>
              <p className="text-sm text-gray-500 mb-6">ようだ たかひろ</p>

              <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
                <div className="bg-white/60 rounded-lg p-4 text-sm text-gray-500">
                  プロフィール詳細は現在準備中です。
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 指導観・哲学 */}
      <section id="philosophy" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-8">Nobilva のメンターが/大切にしていること</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "「続けられる仕組み」を/作る",
                desc: "やる気に頼らず、/仕組みで毎日を回す。/計画・面談・進捗確認の3つを/確実に回すことが、/最も再現性の高い伴走です。",
              },
              {
                num: "02",
                title: "「先生」ではなく/「伴走者」として接する",
                desc: "教えるのではなく、/一緒に走る。/計画を渡すのではなく、/一緒に作る。/主役は常に生徒本人です。",
              },
              {
                num: "03",
                title: "「責めない・煽らない」",
                desc: "「やらなかった日」を責めず、/理由を一緒に分解する。/できた日はちゃんと積み上げる。/安心して報告できる関係が、/長く続く前提条件です。",
              },
              {
                num: "04",
                title: "「進路は最後まで/先送りできるように」",
                desc: "スポーツ推薦も一般進学も、/選択肢を閉じない。/どの道も選べる状態を/維持することが、/結果的に本人の後悔を/最小化します。",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-nobilva-light rounded-xl p-6"
              >
                <span className="text-sm font-bold text-nobilva-accent">
                  {item.num}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">
                  {wb(item.title)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {wb(item.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <SubpageCTA
        heading="一度、/話してみませんか。"
        description="無料学習相談では、/ヘッドコーチ・中村龍人または/代表メンター・養田貴大が/直接対応します。/ご家庭の状況に合わせて、/率直にご提案します。"
        secondaryLinks={[
          {
            label: "サービスの仕組みを見る",
            href: "/ja/services/nobilva/how-it-works",
          },
          {
            label: "指導実績を見る",
            href: "/ja/services/nobilva/results",
          },
        ]}
      />
    </div>
  );
}
