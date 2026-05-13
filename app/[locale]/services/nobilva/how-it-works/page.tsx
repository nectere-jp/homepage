import type { Metadata } from "next";
import Link from "next/link";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "サービスの仕組み - Nobilva | Nectere",
    description:
      "Nobilva の三本柱「日割り学習計画・週1回オンライン面談・毎日の進捗確認」の仕組みをすべて開示します。何が含まれて、メンターは何をして、ご家庭は何を準備すればよいのか。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/how-it-works"),
      languages: getAlternatesLanguages("/services/nobilva/how-it-works"),
    },
  };
}

export default function HowItWorksPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー */}
      <section className="bg-white pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nobilva の仕組みを、すべて開示します。
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            派手な機能はありません。3つのシンプルな仕組みを、確実に回すこと。
            何が含まれていて、メンターは何をして、ご家庭は何を準備すれば良いのか。
            このページでは、すべてを具体的に説明します。
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <a
              href="#calendar"
              className="inline-flex items-center gap-1.5 bg-nobilva-light text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
            >
              日割り学習計画
            </a>
            <a
              href="#meeting"
              className="inline-flex items-center gap-1.5 bg-nobilva-light text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
            >
              週1回オンライン面談
            </a>
            <a
              href="#daily"
              className="inline-flex items-center gap-1.5 bg-nobilva-light text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
            >
              毎日の進捗確認
            </a>
            <a
              href="#week"
              className="inline-flex items-center gap-1.5 bg-nobilva-light text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
            >
              1週間の流れ
            </a>
          </div>

          <p className="text-sm text-gray-400">通読時間：約7分</p>
        </div>
      </section>

      {/* 2. 三本柱の全体像 */}
      <section className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-4">
            3つの柱が、1週間のサイクルで回る
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
            Nobilva の仕組みは、3つの柱でできています。
            1つの柱だけでも機能しますが、3つを組み合わせると、続けられる構造になります。
          </p>

          {/* 関係図 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <div className="flex flex-col items-center gap-4">
              <PillarFlowItem
                label="週1回オンライン面談"
                sub="方向性を決める"
                accent
              />
              <FlowArrow />
              <PillarFlowItem
                label="日割り学習計画"
                sub="何をやるか決まる"
              />
              <FlowArrow />
              <PillarFlowItem
                label="毎日の進捗確認"
                sub="実行を支える"
              />
              <FlowArrow />
              <div className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full px-4 py-2">
                振り返り
              </div>
              <FlowArrow />
              <div className="text-sm font-medium text-nobilva-accent">
                次の週1回オンライン面談へ
              </div>
            </div>
          </div>

          {/* ひとこと定義表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-4 font-bold text-gray-900">柱</th>
                  <th className="text-left py-3 pr-4 font-bold text-gray-900">役割</th>
                  <th className="text-left py-3 font-bold text-gray-900">頻度</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">週1回オンライン面談</td>
                  <td className="py-3 pr-4">方向性を決める／調整する</td>
                  <td className="py-3">週1回・30分</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">日割り学習計画</td>
                  <td className="py-3 pr-4">何を・いつやるか決まる</td>
                  <td className="py-3">毎週更新</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-900">毎日の進捗確認</td>
                  <td className="py-3 pr-4">実行を支える</td>
                  <td className="py-3">毎日</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-sm text-gray-600 leading-relaxed">
            3つは独立した機能ではなく、<strong>1週間でぐるぐる回るサイクル</strong>です。
            面談で決めたことが計画になり、計画が毎日の行動になり、その結果が次の面談で振り返られる——
            このループが続くことで、学習が定着していきます。
          </p>
        </div>
      </section>

      {/* 3. 柱1：日割り学習計画 */}
      <section id="calendar" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <p className="text-sm font-bold text-nobilva-accent mb-2">柱1</p>
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-2">
            日割り学習計画
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-8">
            「明日のやること」が、毎朝決まっている状態を作る。
          </p>

          <div className="space-y-8">
            <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-4">
              <p>
                専属メンターが、生徒の練習スケジュール・得意苦手・学校の進度を踏まえて、<strong>1週間分の日割り学習計画</strong>を作成します。
              </p>
              <p>
                計画には、各日の<strong>科目・教材ページ・問題番号・所要時間目安</strong>まで具体的に書かれます。
                「数学」ではなく「数学：問題集 p.42 大問1〜3、20分」のレベルです。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">どう作られるか</h3>
              <ol className="space-y-2 text-sm md:text-base text-gray-700">
                {[
                  "面談（柱2）で1週間の振り返り＋来週の方向性を確認",
                  "メンターが翌週分の日割りを作成（土曜面談後〜日曜中）",
                  "日曜中にチャットで翌週分が届く",
                  "月曜から実行",
                  "毎日の進捗確認（柱3）と連動",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-nobilva-main text-gray-900 font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IncludesList
                title="含まれるもの"
                items={[
                  "1週間分の日割り計画（各日の科目・教材・所要時間）",
                  "部活スケジュール・遠征日程を考慮した調整",
                  "試験期・大会期に応じた強弱配分",
                  "計画の毎週更新（土曜面談後）",
                ]}
                type="included"
              />
              <IncludesList
                title="含まれないもの"
                items={[
                  "AI による自動生成（メンターが手動で作成）",
                  "親が確認・承認するダッシュボード（チャット内で完結）",
                  "ゲーミフィケーション（ポイント・バッジ等）",
                ]}
                type="excluded"
              />
            </div>

            <div className="bg-nobilva-light rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">続けられる工夫</p>
              <p>
                計画は<strong>「立てて終わり」のものではなく、毎週調整するもの</strong>として運用します。
                1週間試して、合わない部分があれば、土曜面談で見直して翌週に反映。
                数ヶ月かけて、その生徒に合った「リズム」が育っていきます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 柱2：週1回オンライン面談 */}
      <section id="meeting" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <p className="text-sm font-bold text-nobilva-accent mb-2">柱2</p>
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-2">
            週1回オンライン面談
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-8">
            30分で、1週間の方向を決める。
          </p>

          <div className="space-y-8">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              専属メンターと、<strong>毎週土曜（または希望曜日）30分間、Zoom</strong> で対話します。
              「振り返り → 課題分解 → 来週の計画 → 不安事相談」の流れで、30分を区切って使います。
            </p>

            {/* 30分の構成 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">30分の構成</h3>
              <div className="space-y-3">
                {[
                  { time: "0〜8分", content: "1週間の進捗振り返り", detail: "達成できた項目とできなかった項目・理由の分解" },
                  { time: "8〜15分", content: "課題分解", detail: "詰まった問題の考え方・単元の理解度チェック" },
                  { time: "15〜25分", content: "来週の計画方針", detail: "試合・試験予定の確認・強化科目・週の目標設定" },
                  { time: "25〜30分", content: "相談", detail: "進路・モチベーション・気になること" },
                ].map((item) => (
                  <div key={item.time} className="bg-white rounded-xl p-4 flex gap-4 items-start">
                    <span className="flex-shrink-0 text-sm font-bold text-nobilva-accent whitespace-nowrap">
                      {item.time}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.content}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>
                面談は「先生からの説明」ではなく、<strong>「対話で整理する場」</strong>です。
                メンターが一方的に話すのではなく、生徒が自分の言葉で振り返ることを大切にしています。
              </p>
              <p className="mt-2 text-sm text-gray-500">
                保護者の方は、希望されれば最後の5分から同席いただけます。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IncludesList
                title="含まれるもの"
                items={[
                  "専属メンターによる毎週30分のZoom面談",
                  "録画なし（プライベートな話も率直に話せるように）",
                  "面談後のメモはチャットで共有",
                ]}
                type="included"
              />
              <IncludesList
                title="含まれないもの"
                items={[
                  "グループ面談（1対1のみ）",
                  "個別指導としての問題解説（オプションで対応）",
                ]}
                type="excluded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. 柱3：毎日の進捗確認 */}
      <section id="daily" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <p className="text-sm font-bold text-nobilva-accent mb-2">柱3</p>
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-2">
            毎日の進捗確認
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-8">
            やった／やれなかったを、毎日ひとこと。
          </p>

          <div className="space-y-8">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              専用チャットで、その日の学習結果を<strong>生徒からひとこと報告</strong>します。
              「今日のやることリスト」のうち、できたもの・できなかったもの・詰まったところを書くだけです。
              メンターは24時間以内に返信し、必要なら<strong>明日の計画に類題を追加で指定</strong>します。
            </p>

            {/* チャット風モック */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 space-y-4 max-w-lg">
              <ChatBubble
                sender="生徒"
                time="21:30"
                message="今日は数学3問やった。1問目の途中で詰まった。"
                isStudent
              />
              <ChatBubble
                sender="メンター"
                time="22:30"
                message="お疲れさま。詰まったところ確認しました。明日の計画に類題（サクシード p.45 問1）を追加してあります。同じ手法で解けるはずなので、試してみてください。"
              />
              <ChatBubble
                sender="生徒"
                time="翌日 21:30"
                message="類題できた。流れがわかった。"
                isStudent
              />
              <ChatBubble
                sender="メンター"
                time=""
                message="その調子！金曜の振り返りで再確認しよう。"
              />
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">続けられる工夫</h3>
              <ul className="space-y-2 text-sm md:text-base text-gray-700">
                {[
                  "報告は長文不要・スタンプでも可",
                  "詰まったところは写真で送ればOK",
                  "「今日できなかった」報告でも責められない（理由を一緒に分解）",
                  "やる気が出ない日も、その理由を一緒に整理する",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nobilva-accent flex-shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">メンターの返信ルール</h3>
              <ul className="space-y-2 text-sm md:text-base text-gray-700">
                {[
                  "24時間以内に必ず返信",
                  "「すごい」「えらい」だけの返信はしない（具体的に何が良かったかを伝える）",
                  "できなかった日は理由を質問する（責めない）",
                  "詰まった問題には類題の指定（解答そのものは言わない）",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nobilva-accent flex-shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IncludesList
                title="含まれるもの"
                items={[
                  "専用チャット（生徒・メンター間の1対1）",
                  "毎日の進捗報告・写真添付",
                  "24時間以内のメンター返信",
                  "詰まった問題への類題指定",
                ]}
                type="included"
              />
              <IncludesList
                title="含まれないもの"
                items={[
                  "親同伴の3者チャット（生徒・メンター間のみ）",
                  "AI による自動返信（メンターが手動返信）",
                  "詰まった問題の解答そのものの提示",
                ]}
                type="excluded"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">親の関与について</p>
              <p>
                チャットは生徒とメンターの間で完結します。
                ご家庭での様子で気になることがある場合や、サービス全体についてのご相談は、保護者の方からメールでお問い合わせいただければ随時対応します。
              </p>
              <p className="mt-2 text-xs text-gray-500">
                ※「親同伴のチャット」「親ダッシュボードでの進捗監視」は提供していません。生徒が安心して報告できる場として、独立した関係性を大切にしています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 1週間の流れ */}
      <section id="week" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-4">
            1週間の流れ
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            1週間のサイクルがどう回るかを、生徒・メンターそれぞれの動きで見ていきます。
          </p>

          <div className="space-y-4">
            {[
              {
                day: "日曜",
                title: "来週の計画が届く",
                student: "チャットで翌週の日割り計画を受け取る・週末に確認",
                mentor: "土曜面談を踏まえて翌週分の計画を作成・送信",
              },
              {
                day: "月曜",
                title: "実行開始",
                student: "日割りに沿って学習・夜にチャットで進捗報告",
                mentor: "報告にコメント返信（24時間以内）",
              },
              {
                day: "火・水・木",
                title: "継続",
                student: "1日15〜30分の積み上げ・詰まったら写真でチャット送信",
                mentor: "質問への返信・必要なら類題指定",
              },
              {
                day: "金",
                title: "振り返り準備",
                student: "その週の進捗を見返す・面談で話したいことを準備",
                mentor: "1週間の進捗を整理・面談の話題を準備",
              },
              {
                day: "土",
                title: "オンライン面談",
                student: "30分の面談でメンターと対話",
                mentor: "30分の面談を実施・面談後にメモをチャット送信",
              },
            ].map((item) => (
              <div key={item.day} className="bg-white rounded-xl p-4 md:p-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-sm font-bold text-nobilva-accent whitespace-nowrap">
                    {item.day}
                  </span>
                  <span className="font-bold text-gray-900">{item.title}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-2">
                    <span className="flex-shrink-0 text-xs font-bold text-gray-400 w-14">生徒</span>
                    <span className="text-gray-700">{item.student}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex-shrink-0 text-xs font-bold text-gray-400 w-14">メンター</span>
                    <span className="text-gray-700">{item.mentor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              数ヶ月続けると、「決まった時間に決まったことをやる」が習慣になります。
              試合期・試験期で多少崩れても、土曜面談でリセットして、月曜からまた再開できます。
            </p>
            <p className="mt-2 font-medium text-gray-900">
              Nobilva が目指すのは、派手な短期成績アップではなく、長く続けられる学習リズムを身につけることです。
            </p>
          </div>
        </div>
      </section>

      {/* 7. メンターについて */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            メンター制度について
          </h2>

          <div className="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">現在の体制</h3>
              <p>
                2026年5月現在、Nobilva のメンターは<strong>ヘッドコーチ・中村龍人（東京大学 計数工学科）</strong>と<strong>代表メンター・養田貴大</strong>の2名で運用しています。
                全ての生徒に対して、上記のいずれかが直接担当します。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">今後の体制</h3>
              <p>
                2026年内に、東京大学野球部OB・東京大学現役生からの追加メンター採用を予定しています。
                採用は、ヘッドコーチが面接・指導観・コミュニケーションを直接審査します。
              </p>
              <p className="mt-2 font-medium text-gray-900">
                量を増やすために質を下げることは行いません。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">メンター制度の方針</h3>
              <ul className="space-y-1">
                <li className="flex gap-2">
                  <span className="text-nobilva-accent flex-shrink-0">-</span>
                  担当メンターは<strong>原則として継続</strong>（途中で変わらない）
                </li>
                <li className="flex gap-2">
                  <span className="text-nobilva-accent flex-shrink-0">-</span>
                  メンターは学習計画と面談・進捗確認に専念（個別指導は別オプション）
                </li>
              </ul>
            </div>

            <Link
              href="/ja/services/nobilva/coach"
              className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline"
            >
              ヘッドコーチ・代表メンターの紹介を見る
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. ご家庭にお願いすること */}
      <section className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-4">
            ご家庭にお願いすること
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            Nobilva はメンターと生徒が中心になって動く仕組みですが、いくつかご家庭にご協力いただきたいことがあります。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">生徒（ご本人）にお願いすること</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="text-nobilva-accent">-</span>毎日のチャット報告（長文不要・スタンプでも可）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent">-</span>週1回30分の面談への参加</li>
                <li className="flex gap-2"><span className="text-nobilva-accent">-</span>教材（市販の参考書・問題集）の準備</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">保護者の方にお願いすること</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="text-nobilva-accent">-</span>学習時間を確保できる環境作り（夜の自宅で30分集中できる場所）</li>
                <li className="flex gap-2"><span className="text-nobilva-accent">-</span>試合・遠征・試験のスケジュール共有</li>
                <li className="flex gap-2"><span className="text-nobilva-accent">-</span>教材費の負担（市販書）</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">教材費の目安</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              全科目で参考書・問題集を揃える場合、<strong>年間 1万円〜2万円程度</strong>が目安です。
              すでにお持ちの教材を活用することも多く、追加購入が必要なものをメンターが厳選してお伝えします。
              学校で配布される教材（サクシードなど）が使える場合は、そちらを優先的に使うため追加購入はさらに少なくなります。
            </p>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">お願いしないこと</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><span className="text-gray-400">-</span>学習内容の確認・採点（メンターが行います）</li>
              <li className="flex gap-2"><span className="text-gray-400">-</span>計画の作成・管理（メンターが行います）</li>
              <li className="flex gap-2"><span className="text-gray-400">-</span>進捗の毎日チェック（チャットは生徒・メンター間で完結）</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              「保護者がやらなければならないこと」を最小限にする設計です。
              共働き・送迎で忙しいご家庭でも、無理なく続けていただける運用を目指しています。
            </p>
          </div>
        </div>
      </section>

      {/* 9. 合う家庭・合わない家庭 */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-8">
            Nobilva が合うご家庭・合わないご家庭
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">合うご家庭</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "部活・スポーツと勉強の両立に悩んでいる",
                  "自宅学習の習慣を作りたい",
                  "スポーツ推薦と一般進学、両方の選択肢を残したい",
                  "通塾の時間・体力を捻出できない",
                  "「監視」ではなく「伴走」を求めている",
                  "即効性より、長く続けられる仕組みを重視する",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-600 flex-shrink-0 font-bold">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">合わないご家庭</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "短期間（1〜2ヶ月）で大幅な成績向上を期待される場合",
                  "1対1の個別指導をメインに希望される場合（オプションで対応可）",
                  "親がリアルタイムで進捗を監視したい場合",
                  "教科ごとに専門講師による解説を期待される場合",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-400 flex-shrink-0 font-bold">&#10005;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-nobilva-light rounded-xl p-6 text-sm text-gray-700 leading-relaxed">
            <p className="font-bold text-gray-900 mb-2">判断に迷ったら</p>
            <p>
              どちらに該当するか分からない場合は、無料学習診断で具体的な状況をお聞かせください。
              「Nobilva は合わないかもしれない」とお伝えすることもあります。
            </p>
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <SubpageCTA
        heading="仕組みを理解した上で、一度話してみませんか。"
        description="無料学習診断では、ご家庭の状況に合わせて「Nobilva が合うかどうか」を率直にお伝えします。その場での申込みは求めません。"
        secondaryLinks={[
          {
            label: "料金プランを見る",
            href: "/ja/services/nobilva/pricing",
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

/* ---- Helper Components ---- */

function PillarFlowItem({
  label,
  sub,
  accent,
}: {
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`w-full max-w-xs text-center rounded-xl p-4 ${
        accent ? "bg-nobilva-main/20 border border-nobilva-main" : "bg-gray-50 border border-gray-200"
      }`}
    >
      <p className="font-bold text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <svg className="w-4 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
    </svg>
  );
}

function IncludesList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "included" | "excluded";
}) {
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={`flex-shrink-0 ${type === "included" ? "text-green-600" : "text-gray-400"}`}>
              {type === "included" ? "\u2713" : "\u2717"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatBubble({
  sender,
  time,
  message,
  isStudent,
}: {
  sender: string;
  time: string;
  message: string;
  isStudent?: boolean;
}) {
  return (
    <div className={`flex flex-col ${isStudent ? "items-end" : "items-start"}`}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className={`text-xs font-bold ${isStudent ? "text-nobilva-accent" : "text-gray-500"}`}>
          {sender}
        </span>
        {time && <span className="text-xs text-gray-400">{time}</span>}
      </div>
      <div
        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] ${
          isStudent
            ? "bg-nobilva-main/20 text-gray-900 rounded-tr-md"
            : "bg-white text-gray-700 rounded-tl-md shadow-sm"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
