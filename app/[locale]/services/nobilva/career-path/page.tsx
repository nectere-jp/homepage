import type { Metadata } from "next";
import Link from "next/link";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "野球をがんばる中高生の進路ガイド - Nobilva | Nectere",
    description:
      "スポーツ推薦・指定校推薦・公募推薦・総合型選抜・一般入試。野球をがんばる中高生の進路には複数の道があります。それぞれの仕組み・判断基準・準備のタイミングを整理します。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/career-path"),
      languages: getAlternatesLanguages("/services/nobilva/career-path"),
    },
  };
}

export default function CareerPathPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー＋目次 */}
      <section className="bg-white pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            野球をがんばる中高生の進路ガイド
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            スポーツ推薦・指定校推薦・公募推薦・総合型選抜・一般入試。
            野球をがんばる中高生の進路には、複数の道があります。
            このページでは、それぞれの仕組み・判断基準・準備のタイミングを、保護者の方と本人向けに整理します。
          </p>

          <p className="text-sm text-gray-400 mb-6">通読時間：約10分</p>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "全体像", href: "#overview" },
              { label: "スポーツ推薦", href: "#sports-recommendation" },
              { label: "指定校・公募推薦", href: "#school-recommendation" },
              { label: "総合型選抜", href: "#comprehensive" },
              { label: "一般入試", href: "#general" },
              { label: "年間タイムライン", href: "#timeline" },
              { label: "複数の選択肢を残す", href: "#multiple-paths" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center bg-nobilva-light text-gray-800 font-medium text-xs px-3 py-1.5 rounded-full hover:bg-nobilva-main/30 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 進路選択の全体像 */}
      <section id="overview" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-4">
            進路選択の全体像
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            中学・高校から大学進学までの進路には、大きく分けて5つのパターンがあります。
            どのパターンを選ぶかは、生徒の状況・志望・部活との両立度によって異なります。
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs md:text-sm min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">パターン</th>
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">主な判断要素</th>
                  <th className="text-center py-3 pr-3 font-bold text-gray-900">部活との両立</th>
                  <th className="text-center py-3 pr-3 font-bold text-gray-900">評定の重要度</th>
                  <th className="text-center py-3 pr-3 font-bold text-gray-900">学力テスト</th>
                  <th className="text-left py-3 font-bold text-gray-900">出願時期</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  { name: "スポーツ推薦", factor: "競技実績＋評定", club: "\u25CE", gpa: "\u25CB", test: "\u25B3", timing: "高3秋〜冬" },
                  { name: "指定校推薦", factor: "評定＋校内選考", club: "\u25CB", gpa: "\u25CE", test: "\u25B3", timing: "高3秋" },
                  { name: "公募推薦", factor: "評定＋小論文・面接", club: "\u25CB", gpa: "\u25CE", test: "\u25CB", timing: "高3秋〜冬" },
                  { name: "総合型選抜", factor: "主体性・実績・志望理由", club: "\u25CE", gpa: "\u25CB", test: "\u25B3〜\u25CB", timing: "高3夏〜冬" },
                  { name: "一般入試", factor: "学力テスト", club: "\u25B3", gpa: "\u25B3", test: "\u25CE", timing: "高3冬〜春" },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-gray-100">
                    <td className="py-3 pr-3 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 pr-3">{row.factor}</td>
                    <td className="py-3 pr-3 text-center">{row.club}</td>
                    <td className="py-3 pr-3 text-center">{row.gpa}</td>
                    <td className="py-3 pr-3 text-center">{row.test}</td>
                    <td className="py-3">{row.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700 mb-6">
            上記はあくまで一般論です。学校・大学・学部により条件は異なります。
            志望する進路がある場合は、必ず学校の進路指導・志望校の最新情報をご確認ください。
          </div>

          <div className="text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              多くのご家庭で、最初は「とにかく一般入試に向けて勉強」と思いがちです。
              しかし、野球をがんばる中高生にとっては、<strong>部活経験が逆に強みになる進路ルート</strong>も多く存在します。
            </p>
            <p className="mt-2">
              「5つのパターンを知った上で、戦略的に選ぶ・残す」ことが、最も後悔の少ない進路選択につながります。
            </p>
          </div>
        </div>
      </section>

      {/* 3. スポーツ推薦 */}
      <section id="sports-recommendation" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            スポーツ推薦
          </h2>

          <div className="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              競技実績を主な評価対象とする推薦入試の総称です。
              大学・高校ともに、各校が独自に基準を設けており、「全国大会出場」「都道府県上位」など段階的なレベル設定があります。
            </p>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">主な条件</h3>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>競技実績</strong>：所属チームでの試合実績・大会成績</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>評定</strong>：最低ラインは設定されている（3.0〜3.8程度が一般的）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>学力テスト</strong>：免除〜小論文・面接のみ、または共通テスト要求も</li>
              </ul>
            </div>

            <div className="bg-nobilva-light rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">よくある誤解</h3>
              <p>
                「スポーツが強ければ勉強は無視できる」と思われがちですが、<strong>評定の最低ラインを満たさなければ出願できない</strong>ケースが多くあります。
                中3〜高1で勉強を放置すると、せっかくのチャンスを失うリスクがあります。
              </p>
            </div>
          </div>
        </div>

        <SubpageFAQ
          items={[
            {
              question: "スポーツ推薦に「最低限の評定」はどれくらいですか？",
              answer: "大学・学部・学校によって異なりますが、3.0〜3.8程度が一般的な目安です。難関校では4.0以上を求める場合もあります。「うちの志望校はどのレベルか」は、高校の進路指導室で確認するのが最も確実です。",
            },
            {
              question: "野球をやめたら推薦は取り消されますか？",
              answer: "多くの場合、入学までは野球部に所属している前提です。怪我などのやむを得ない事情を除き、退部・転部は推薦取り消しのリスクがあります。入学後は学校により条件が異なります。",
            },
            {
              question: "強豪校でないとスポーツ推薦は無理ですか？",
              answer: "強豪校・全国レベルの実績がなくても、個人の競技スキルや成績で推薦を取れるケースは多くあります。リトルシニア・ボーイズリーグ・ポニーリーグ・ヤングリーグでの地方大会上位、中学軟式（部活）や高校野球部での県大会・地区大会上位なども、推薦対象になる大学・高校はあります。",
            },
          ]}
        />
      </section>

      {/* 4. 指定校推薦・公募推薦 */}
      <section id="school-recommendation" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            指定校推薦・公募推薦
          </h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs md:text-sm min-w-[480px]">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">項目</th>
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">指定校推薦</th>
                  <th className="text-left py-3 font-bold text-gray-900">公募推薦</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  { item: "出願条件", designated: "校内選考通過", public: "大学の条件を満たせば出願可" },
                  { item: "評定の重要度", designated: "\u25CE（最重要）", public: "\u25CE（最重要）" },
                  { item: "出願時期", designated: "高3秋", public: "高3秋〜冬" },
                  { item: "合格率", designated: "校内選考通過後はほぼ合格", public: "専願・併願による" },
                  { item: "部活との両立", designated: "\u25CB", public: "\u25CB" },
                ].map((row) => (
                  <tr key={row.item} className="border-b border-gray-100">
                    <td className="py-3 pr-3 font-medium text-gray-900">{row.item}</td>
                    <td className="py-3 pr-3">{row.designated}</td>
                    <td className="py-3">{row.public}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">指定校推薦の特徴</h3>
              <p>
                高校に与えられた推薦枠を、校内選考で誰が使うかが決まる仕組みです。
                <strong>評定平均が校内で最も高い生徒</strong>から優先的に選ばれることが一般的です。
                校内選考を通過すれば、ほぼ確実に合格できるのが大きな特徴です。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">公募推薦の特徴</h3>
              <p>
                大学が設定した出願条件（評定平均、英検級など）を満たせば、誰でも出願できる推薦入試です。
                小論文・面接・場合により基礎学力テストが課されます。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">評定平均の重要性</h3>
              <p>
                指定校推薦・公募推薦どちらでも、<strong>評定平均は中学3年・高校1〜3年1学期までの成績で決まります</strong>。
                「高3になってから頑張ろう」では遅すぎます。
                中3〜高2の段階で、提出物・定期テスト・授業態度を継続的に積み上げることが、推薦の可能性を最大化します。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-nobilva-light">
          <SubpageFAQ
            items={[
              {
                question: "評定平均はどのように計算されますか？",
                answer: "高校1年1学期から高校3年1学期までの、全科目の評定（1〜5）の平均値です。多くの大学で3.5以上が公募推薦の出願条件となっており、難関大学では4.0以上を求める場合もあります。",
              },
              {
                question: "英検は必要ですか？",
                answer: "大学・学部により異なりますが、英検準2級〜2級を出願条件とする場合が多くあります。難関大学では英検準1級を求めるところも増えています。推薦を視野に入れるなら、高校2年生のうちに英検対策を始めるのが安全です。",
              },
              {
                question: "指定校推薦の枠が志望校にない場合はどうすればいいですか？",
                answer: "公募推薦・総合型選抜・一般入試を視野に入れます。指定校推薦の枠がない大学でも、公募推薦や総合型選抜で出願できる場合があります。学校の進路指導室で、過去の合格実績・募集要項を確認することをおすすめします。",
              },
            ]}
          />
        </div>
      </section>

      {/* 5. 総合型選抜 */}
      <section id="comprehensive" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            総合型選抜（旧AO入試）
          </h2>

          <div className="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              学力テストではなく、<strong>志望理由書・面接・小論文・活動実績</strong>などで総合的に評価する入試です。
              2021年に「AO入試」から「総合型選抜」に名称変更され、現在では多くの大学で実施されています。
            </p>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">特徴</h3>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>出願時期が早い（一般的に高3夏〜秋）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>志望理由・主体性・課外活動実績が重視される</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>学力テストを課す大学も増えている</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>評定平均の最低ラインは設定されることが多い（3.0〜3.5程度）</li>
              </ul>
            </div>

            <div className="bg-nobilva-light rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">野球をがんばる中高生にとっての親和性</h3>
              <p className="mb-3">
                総合型選抜は、<strong>部活で培った経験や主体性を「言語化」できれば、強力な武器になる</strong>入試です。
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>野球を通じて学んだことを志望理由・小論文で表現できる</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>大会出場・キャプテン経験・チーム運営などが活動実績になる</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>面接で「自分の言葉で語れる経験」がある</li>
              </ul>
              <p className="mt-3 text-sm">
                単なる「野球を頑張りました」ではなく、<strong>「野球を通じて何を学び、それを大学でどう活かすか」</strong>が言語化できると、合格可能性が大きく上がります。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">準備すること</h3>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>志望理由の早期構築（高2〜高3夏）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>活動実績の整理（大会成績・キャプテン経験・地域活動など）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>小論文・面接対策</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>大学が求める「アドミッションポリシー」の理解</li>
              </ul>
            </div>
          </div>
        </div>

        <SubpageFAQ
          items={[
            {
              question: "総合型選抜は誰でも合格できますか？",
              answer: "「総合的に評価される」とはいえ、準備の量と質が大きく合否を分ける入試です。安易に「学力に自信がないから総合型選抜」と考えると、準備不足で不合格になるケースが多くあります。早期から計画的に準備することが、合格の鍵です。",
            },
            {
              question: "野球の実績がそれほどなくても総合型選抜で合格できますか？",
              answer: "はい、可能です。総合型選抜で重視されるのは「実績の派手さ」ではなく、経験から何を学び、どう成長したかです。リトルシニア・ボーイズ系のチーム運営経験、副キャプテンとしての貢献、レギュラーになれなかった時期の取り組みなど、自分の経験を深く言語化できれば合格の道はあります。",
            },
            {
              question: "一般入試との併願は可能ですか？",
              answer: "多くの場合、出願時期がずれるため併願可能です。ただし、総合型選抜の「専願」を選んだ場合は、合格時には必ず入学する義務があります。各大学の募集要項を必ずご確認ください。",
            },
          ]}
        />
      </section>

      {/* 6. 一般入試 */}
      <section id="general" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            一般入試
          </h2>

          <div className="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              学力テスト（共通テスト・大学独自試験）の点数で合否が決まる入試です。
              国公立大学は共通テスト＋二次試験、私立大学は独自試験が中心となります。
            </p>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">特徴</h3>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>評価が「学力テストの点数」に集約される（最も公平で透明性が高い）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>出願時期は高3冬〜春（推薦より遅い）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>浪人という選択肢がある</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">部活との両立の現実</h3>
              <p className="mb-3">
                一般入試で合格するためには、<strong>高3夏までに引退して受験勉強に集中する</strong>のが一般的なパターンです。
                引退後の半年〜1年で、基礎の確認・志望校レベルへの到達・過去問演習を行う必要があります。
              </p>
              <p>
                一方、高校3年間ずっと部活を続けながら一般入試で合格するケースもあります。
                その場合は、<strong>中3〜高2の段階で基礎学力をしっかり積み上げておく</strong>ことが必須条件です。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">戦略</h3>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>早期準備型</strong>：中3〜高2で基礎を完成、高3で実戦演習</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>引退集中型</strong>：高3夏引退、半年で集中的に学力を上げる</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>浪人前提型</strong>：現役は推薦・総合型中心、不合格なら浪人で一般入試</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-nobilva-light">
          <SubpageFAQ
            items={[
              {
                question: "野球を続けながら一般入試で合格できますか？",
                answer: "可能ですが、高3夏までに基礎が完成していることが現実的な条件です。高3秋から一般入試に切り替えると、時間的に厳しくなります。中3〜高2で勉強の習慣を作っておくことが、両立の鍵です。",
              },
              {
                question: "浪人すると推薦は使えなくなりますか？",
                answer: "多くの推薦入試は「現役」が条件となっており、浪人すると使えなくなります。ただし、総合型選抜・一般入試は浪人でも出願可能です。「現役で推薦を狙い、不合格なら浪人で一般入試」という戦略は、十分に成立します。",
              },
              {
                question: "共通テストはどれくらい難しいですか？",
                answer: "各科目の出題傾向は毎年微調整されますが、高校範囲の基礎〜標準レベルが中心です。ただし、思考力・読解力を問う問題が多く、暗記だけでは対応できません。早期から「考えながら解く」訓練を積むことが重要です。",
              },
            ]}
          />
        </div>
      </section>

      {/* 7. 進路選択の年間タイムライン */}
      <section id="timeline" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-4">
            進路選択の年間タイムライン
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            進路選択は、高3の出願時期だけで決まるわけではありません。
            中1からの積み上げが、選択肢の幅を決めます。
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-xs md:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 pr-3 font-bold text-gray-900 w-16">学年</th>
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">学習面</th>
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">進路面</th>
                  <th className="text-left py-3 font-bold text-gray-900">部活面</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  { grade: "中1", study: "学習習慣の確立／全科目バランスよく", career: "興味のある分野・職業を意識し始める", club: "中学硬式 or 中学軟式スタート" },
                  { grade: "中2", study: "苦手科目の特定・対策／英検3級〜準2級", career: "高校選びの情報収集", club: "公式戦の本格化" },
                  { grade: "中3", study: "内申点の積み上げ／高校受験対策", career: "高校進学の判断", club: "中学野球の集大成" },
                  { grade: "高1", study: "評定平均の意識／英検準2級〜2級", career: "大学・学部の方向性検討", club: "高校野球部スタート" },
                  { grade: "高2", study: "評定維持／英検2級〜準1級／総合型選抜準備", career: "志望校絞り込み／推薦の可能性検討", club: "公式戦・大会出場" },
                  { grade: "高3", study: "出願種別ごとの対策／学力強化", career: "出願・面接・受験", club: "夏に引退（一般入試組）" },
                ].map((row) => (
                  <tr key={row.grade} className="border-b border-gray-100">
                    <td className="py-3 pr-3 font-bold text-nobilva-accent">{row.grade}</td>
                    <td className="py-3 pr-3">{row.study}</td>
                    <td className="py-3 pr-3">{row.career}</td>
                    <td className="py-3">{row.club}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-6">
            {[
              {
                period: "中1〜中2",
                text: "「進路はまだ早い」と思いがちですが、学習習慣と英検の積み上げは、後の選択肢を大きく広げます。部活と勉強の両立の感覚を、この時期に身につけることが理想です。",
              },
              {
                period: "中3〜高1",
                text: "内申点・評定平均の積み上げが本格化する時期です。「高校で頑張ればいい」ではなく、中3後半から評定の重要性を意識し始めることが、推薦の可能性を広げます。",
              },
              {
                period: "高2",
                text: "進路の方向性を絞り込むタイミングです。推薦を視野に入れる場合は、評定・英検・志望理由の準備をこの時期から開始します。",
              },
              {
                period: "高3",
                text: "出願種別が確定する時期です。推薦・総合型選抜・一般入試で出願時期が異なるため、年間スケジュールを早めに把握することが必要です。",
              },
            ].map((item) => (
              <div key={item.period} className="bg-nobilva-light rounded-xl p-5">
                <p className="text-sm font-bold text-nobilva-accent mb-1">{item.period}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 複数の選択肢を残す */}
      <section id="multiple-paths" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            複数の選択肢を残すという考え方
          </h2>

          <div className="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">なぜ「絞り込まない」のか</h3>
              <p className="mb-3">
                中学・高校の段階で「一般入試一本」「スポーツ推薦一本」と絞り込むのは、リスクが大きい判断です。
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>怪我で競技を続けられなくなる可能性</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>志望校・志望学部の方針変更</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>本人の意向の変化</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>経済状況・家庭状況の変化</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">複数の選択肢を残すための条件</h3>
              <ol className="space-y-2">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-nobilva-main text-gray-900 font-bold text-xs flex items-center justify-center">1</span>
                  <span><strong>学習習慣</strong>：どのルートでも必要な、続けられる勉強リズム</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-nobilva-main text-gray-900 font-bold text-xs flex items-center justify-center">2</span>
                  <span><strong>基礎学力</strong>：一般入試にも対応できる土台</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-nobilva-main text-gray-900 font-bold text-xs flex items-center justify-center">3</span>
                  <span><strong>評定平均</strong>：推薦に必要な最低ライン</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">学習支援サービスを選ぶ際の視点</h3>
              <p className="mb-3">
                学習面のサポートを外部に求める場合、世の中には多様なサービスがあります。
                それぞれ強みが異なるため、ご家庭の状況に合わせて選ぶことが重要です。
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>動画コンテンツ型</strong>：低価格で多科目をカバーできるが、自走できる生徒向け</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>オンライン個別指導型</strong>：苦手科目の集中対策に強いが、複数科目を取ると料金が積み上がる</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>特定スポーツ特化型</strong>：そのスポーツの両立ノウハウに強いが、対象競技が限定される</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span><strong>学習管理型</strong>（Nobilva）：計画作成と継続支援に特化し、全科目をパック料金で対応</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Nobilva が目指していること</h3>
              <p className="mb-3">
                Nobilva は、この3つを<strong>野球を続けながら確実に積み上げる仕組み</strong>を提供しています。
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>日割り学習計画で、忙しい中でも続けられるリズムを作る</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>週1面談で、推薦と一般進学を並行設計する</li>
                <li className="flex gap-2"><span className="text-nobilva-accent flex-shrink-0">-</span>毎日の進捗確認で、評定の積み上げを支える</li>
              </ul>
              <p className="mt-3 font-medium text-gray-900">
                「どの進路を選ぶか」は、最後まで先送りできるように。
                それが、Nobilva の伴走の目的です。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/ja/services/nobilva/how-it-works" className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm">
                Nobilva の仕組みを詳しく見る
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <SubpageCTA
        heading="進路で悩んだら、一度ご相談ください。"
        description="無料学習診断では、生徒の学年・現在の状況・志望進路の方向性を踏まえて、「今、何から始めるのが現実的か」を具体的にお伝えします。30日全額返金保証もご用意しています。"
        secondaryLinks={[
          {
            label: "Nobilva の仕組みを詳しく見る",
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
