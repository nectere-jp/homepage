import type { Metadata } from "next";
import Image from "next/image";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "指導者紹介 - Nobilva | Nectere",
    description:
      "Nobilva のヘッドコーチ・中村龍人（東京大学 計数工学科）と代表メンター・養田貴大を紹介します。指導観・メンター制度の現状と今後について。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/coach"),
      languages: getAlternatesLanguages("/services/nobilva/coach"),
    },
  };
}

export default function CoachPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー */}
      <section className="bg-white pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nobilva の指導者を紹介します。
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            野球をがんばる中高生の毎日に伴走するメンターを紹介します。
          </p>
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            顔写真は掲載しておりません。アバターイラストでご紹介しています。
          </div>
        </div>
      </section>

      {/* 2. ヘッドコーチ 中村龍人 */}
      <section id="nakamura" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-sm overflow-hidden">
                <Image
                  src="/images/nobilva/ryuto.svg"
                  alt="中村龍人"
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

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">担当範囲</h3>
                  <p>
                    学習計画の設計・週1回オンライン面談・毎日の進捗確認・進路相談・無料学習診断の対応。Nobilva の学習面すべてを統括しています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 代表メンター 養田貴大 */}
      <section id="yoda" className="bg-nobilva-light py-12 md:py-16">
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
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">担当範囲</h3>
                  <p>
                    Nectere 側では営業・内部ツール開発・経理を担当。メンターとしても一部の生徒を担当しています。
                  </p>
                </div>

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
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-8">
            Nobilva のメンターが大切にしていること
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "「続けられる仕組み」を作る",
                desc: "やる気に頼らず、仕組みで毎日を回す。計画・面談・進捗確認の3つを確実に回すことが、最も再現性の高い伴走です。",
              },
              {
                num: "02",
                title: "「先生」ではなく「伴走者」として接する",
                desc: "教えるのではなく、一緒に走る。計画を渡すのではなく、一緒に作る。主役は常に生徒本人です。",
              },
              {
                num: "03",
                title: "「責めない・煽らない」",
                desc: "「やらなかった日」を責めず、理由を一緒に分解する。できた日はちゃんと積み上げる。安心して報告できる関係が、長く続く前提条件です。",
              },
              {
                num: "04",
                title: "「進路は最後まで先送りできるように」",
                desc: "スポーツ推薦も一般進学も、選択肢を閉じない。どの道も選べる状態を維持することが、結果的に本人の後悔を最小化します。",
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
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500">
            これらは、今後メンターを採用する際の基準にもなります。
          </p>
        </div>
      </section>

      {/* 5. メンター制度の現状と今後 */}
      <section id="mentor-system" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-8">
            メンター制度の現状と今後
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <span className="text-xs font-bold text-nobilva-accent uppercase tracking-wide">
                現在（2026年5月）
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">
                ヘッドコーチ・中村龍人 + 代表メンター・養田貴大の2名体制
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                全生徒をヘッドコーチ・中村龍人と代表メンター・養田貴大が直接担当しています。始まったばかりのサービスだからこそ、指導者が一人ひとりと丁寧に向き合います。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                段階2
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">
                東京大学野球部OBによる顧問配置
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                進路相談の専門性を高めるため、東京大学野球部OBを顧問として配置する予定です。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                段階3
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">
                東京大学現役生・OBから本格メンター採用
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                セクション4の4原則を採用基準に、指導の質を維持しながら体制を拡大します。担当メンターは原則として継続し、生徒と長く関係を築ける設計にしています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <SubpageCTA
        heading="一度、話してみませんか。"
        description="無料学習診断では、ヘッドコーチ・中村龍人または代表メンター・養田貴大が直接対応します。ご家庭の状況に合わせて、率直にご提案します。"
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
