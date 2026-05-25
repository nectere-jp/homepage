import type { Metadata } from "next";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { SubpageHero } from "@/components/nobilva/SubpageHero";
import { SectionHeading } from "@/components/nobilva/SectionHeading";
import { wb } from "@/lib/wb";
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
      <SubpageHero title="Nobilvaのしくみ">
        <div className="flex flex-wrap gap-3">
          <a
            href="#calendar"
            className="inline-flex items-center gap-1.5 bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
          >
            日割り学習計画
          </a>
          <a
            href="#meeting"
            className="inline-flex items-center gap-1.5 bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
          >
            週1回オンライン面談
          </a>
          <a
            href="#daily"
            className="inline-flex items-center gap-1.5 bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
          >
            毎日の進捗確認
          </a>
          <a
            href="#week"
            className="inline-flex items-center gap-1.5 bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full hover:bg-nobilva-main/30 transition-colors"
          >
            1週間の流れ
          </a>
        </div>
      </SubpageHero>

      {/* 2. 三本柱の全体像 */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-4">
            <SectionHeading variant="compact">
              3つの柱が、/1週間のサイクルで回る
            </SectionHeading>
          </div>
          {/* 関係図 */}
          {/* サイクル図：2×2 グリッド + 矢印 */}
          <div className="grid grid-cols-[1fr_2rem_1fr] md:grid-cols-[1fr_3rem_1fr] grid-rows-[auto_2rem_auto] md:grid-rows-[auto_3rem_auto] items-center max-w-lg mx-auto mb-8">
            {/* Row 1: 面談 → 日割り計画 */}
            <PillarFlowItem
              label="週1回オンライン面談"
              sub="方向性を決める"
              freq="週1回・40〜50分"
            />
            <CycleArrow direction="right" />
            <PillarFlowItem
              label="日割り学習計画"
              sub="何をやるか決まる"
              freq="毎週更新"
            />

            {/* Row 2: ↑ 　 ↓ */}
            <CycleArrow direction="up" />
            <div />
            <CycleArrow direction="down" />

            {/* Row 3: 振り返り ← 進捗確認 */}
            <PillarFlowItem label="振り返り" sub="次の面談へつなげる" />
            <CycleArrow direction="left" />
            <PillarFlowItem
              label="毎日の進捗確認"
              sub="実行を支える"
              freq="毎日"
            />
          </div>

          <p className="text-base text-gray-600 leading-relaxed">
            これらの3つは独立したサービスではなく、
            <strong>1週間で繰り返すサイクル</strong>です。
            毎週のオンライン面談で計画を立て、その計画が毎日の行動のベースになり、その結果を次の面談で振り返る。
            このループを繰り返すことで、学習が定着していきます。
          </p>
        </div>
      </section>

      {/* 3. 柱1：日割り学習計画 */}
      <section id="calendar" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-nobilva-accent mb-2">柱1</p>
            <SectionHeading variant="compact" className="mb-2">
              日割り学習計画
            </SectionHeading>
            <p className="text-base md:text-lg text-gray-600">
              {wb("「明日のやること」が、/毎朝決まっている状態を作る。")}
            </p>
          </div>

          <div className="space-y-8">
            <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-4">
              <p>
                専属メンターが、皆様の野球の練習スケジュール・得意不得意・学校の進度を踏まえて、
                <strong>1週間分の日割り学習計画</strong>を作成します。
              </p>
              <p>
                計画には、各日の
                <strong>科目・教材ページ・問題番号・所要時間目安</strong>
                まで具体的に書かれます。
                例えば、「数学」ではなく、「数学：サクシード p.42
                253の(1)〜254(3)」といった詳細な計画を作成します。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">計画作成の流れ</h3>
              <ol className="space-y-2 text-sm md:text-base text-gray-700">
                {[
                  "週一回の面談で1週間の振り返り＋来週の方向性を確認",
                  "面談翌日までに、メンターが翌週分の日割りを作成",
                  "翌日から計画を実行",
                  "毎日チャットで進捗を確認",
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

            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2 text-sm md:text-base text-gray-700 mb-4">
                {[
                  "1週間分の日割り計画（各日の科目・教材・所要時間）",
                  "部活スケジュール・遠征日程を考慮した調整",
                  "試験期・大会期に応じた強弱配分",
                  "計画の毎週更新（面談後）",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nobilva-accent flex-shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-3 space-y-1 text-xs text-gray-500">
                <p>※ 計画はAI自動生成ではなく、メンターが手動で作成します</p>
                <p>
                  ※ 保護者用の確認ダッシュボードはありません（チャット内で完結）
                </p>
              </div>
            </div>

            <div className="text-sm md:text-base text-gray-700 leading-relaxed">
              <h3 className="font-bold text-gray-900 mb-2">続けられる工夫</h3>
              <p>
                計画は
                <strong>
                  「立てて終わり」のものではなく、毎週調整するもの
                </strong>
                として運用します。
                1週間試して、合わない部分があれば、土曜面談で見直して翌週に反映。
                数ヶ月かけて、その生徒に合った「リズム」が育っていきます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 柱2：週1回オンライン面談 */}
      <section id="meeting" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-nobilva-accent mb-2">柱2</p>
            <SectionHeading variant="compact" className="mb-2">
              週1回オンライン面談
            </SectionHeading>
            <p className="text-base md:text-lg text-gray-600">
              {wb("40〜50分で、/1週間の方向を決める。")}
            </p>
          </div>

          <div className="space-y-8">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              専属メンターと、
              <strong>毎週40〜50分間、オンラインビデオ会議</strong>{" "}
              で対話します。 「今週振り返り → 課題を分解 → 来週の計画立てる →
              そのほかの不安事相談」の流れで、時間を区切って使います。
            </p>

            {/* 面談の構成 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">40〜50分の構成</h3>
              <div className="space-y-3">
                {[
                  {
                    time: "0〜8分",
                    content: "1週間の進捗振り返り",
                    detail: "達成できた項目とできなかった項目・理由の分解",
                  },
                  {
                    time: "8〜15分",
                    content: "課題分解",
                    detail: "詰まった問題の考え方・単元の理解度チェック",
                  },
                  {
                    time: "15〜25分",
                    content: "来週の計画方針",
                    detail: "試合・試験予定の確認・強化科目・週の目標設定",
                  },
                  {
                    time: "35〜50分",
                    content: "相談",
                    detail: "進路・モチベーション・気になること",
                  },
                ].map((item) => (
                  <div
                    key={item.time}
                    className="bg-white rounded-xl p-4 flex gap-4 items-center"
                  >
                    <span className="flex-shrink-0 text-sm font-bold text-nobilva-accent whitespace-nowrap">
                      {item.time}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {item.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>
                面談は「先生からの説明」ではなく、
                <strong>「対話で整理する場」</strong>です。
                メンターが一方的に話すのではなく、生徒が自分の言葉で振り返ることを大切にしています。
              </p>
              <p className="mt-2 text-sm text-gray-500">
                保護者の方は、希望されれば最後の5分のみ同席いただけます。
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2 text-sm md:text-base text-gray-700 mb-4">
                {[
                  "専属メンターによる毎週40〜50分のオンライン面談",
                  "録画なし（プライベートな話も率直に話せるように）",
                  "面談後のメモはチャットで共有",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nobilva-accent flex-shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-3 space-y-1 text-xs text-gray-500">
                <p>※ グループ面談ではなく、1対1のみで実施します</p>
                <p>※ 個別指導としての問題解説はオプションで対応</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 柱3：毎日の進捗確認 */}
      <section id="daily" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-nobilva-accent mb-2">柱3</p>
            <SectionHeading variant="compact" className="mb-2">
              毎日の進捗確認
            </SectionHeading>
            <p className="text-base md:text-lg text-gray-600">
              {wb("やった／やれなかったを、/毎日ひとことで。")}
            </p>
          </div>

          <div className="space-y-8">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              専用チャットで、その日の学習結果を
              <strong>生徒からひとこと報告</strong>します。
              「今日のやることリスト」のうち、できたもの・できなかったもの・詰まったところを書くだけです。
              メンターは24時間以内に返信し、必要なら
              <strong>明日の計画に類題を追加で指定</strong>します。
            </p>

            {/* チャット風モック */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 space-y-4 max-w-lg mx-auto">
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
                message="類題は解けました！"
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
                  "報告は短文でもOK",
                  "詰まったところは写真で送ればOK",
                  "「今日できなかった」報告でも責められない（週一回の面談で理由を一緒に考えます）",
                  "やる気が出ない日も、その理由を一緒に整理する",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nobilva-accent flex-shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2 text-sm md:text-base text-gray-700 mb-4">
                {[
                  "専用チャット（生徒・メンター間の1対1）",
                  "毎日の進捗報告・写真添付",
                  "24時間以内のメンター返信",
                  "詰まった問題への類題指定",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nobilva-accent flex-shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-3 space-y-1 text-xs text-gray-500">
                <p>※ 保護者同伴の3者チャットではなく、生徒・メンター間のみ</p>
                <p>※ 返信はAI自動返信ではなく、メンターが手動で対応します</p>
                <p>
                  ※
                  詰まった問題には類題を指定しますが、解答そのものは提示しません
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">
                保護者の関与について
              </p>
              <p>
                チャットは生徒とメンターの間で完結します。
                ご家庭での様子で気になることがある場合や、サービス全体についてのご相談は、保護者の方からメールでお問い合わせいただければ随時対応します。
              </p>
              <p className="mt-2 text-xs text-gray-500">
                ※「保護者同伴のチャット」「保護者ダッシュボードでの進捗監視」は提供していません。生徒が安心して報告できる場として、独立した関係性を大切にしています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 1週間の流れ */}
      <section id="week" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-8">
            <SectionHeading variant="compact" className="mb-2">
              1週間の流れ
            </SectionHeading>
            <p className="text-base text-gray-600 leading-relaxed">
              {wb(
                "1週間のサイクルがどう回るかを、/生徒・メンターそれぞれの動きで/見ていきます。",
              )}
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                day: "日曜",
                title: "来週の計画が届く",
                student:
                  "チャットで翌週の日割り計画を受け取る・練習や試合の予定と照らし合わせて確認",
                mentor:
                  "面談を踏まえて翌週分の計画を作成・練習日程に合わせた量の調整・送信",
              },
              {
                day: "月〜金",
                title: "練習後に計画を実行・毎日チャットで報告",
                student:
                  "練習から帰宅後、日割りに沿って1日15〜30分の学習・夜にチャットで進捗報告・詰まったら写真で送信",
                mentor:
                  "報告にコメント返信（24時間以内）・必要なら類題指定・試合や遠征の日は計画を軽めに再調整",
              },
              {
                day: "土",
                title: "オンライン面談",
                student:
                  "練習前後の時間で40〜50分の面談・来週の試合予定や体調も共有",
                mentor:
                  "面談を実施・来週の練習スケジュールを踏まえた計画方針を相談・面談メモをチャット送信",
              },
            ].map((item) => (
              <div key={item.day} className="bg-gray-50 rounded-xl p-4 md:p-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-sm font-bold text-nobilva-accent whitespace-nowrap">
                    {item.day}
                  </span>
                  <span className="font-bold text-gray-900">{item.title}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-4 text-sm">
                  <div>
                    <span className="text-xs font-bold text-gray-400 block mb-1">
                      生徒
                    </span>
                    <span className="text-gray-700">{item.student}</span>
                  </div>
                  <div className="hidden md:block bg-gray-200" />
                  <div className="border-t md:border-t-0 border-gray-200 pt-3 md:pt-0">
                    <span className="text-xs font-bold text-gray-400 block mb-1">
                      メンター
                    </span>
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
              Nobilva
              が目指すのは、派手な短期成績アップではなく、長く続けられる学習リズムを身につけることです。
            </p>
          </div>
        </div>
      </section>

      {/* 7. ご家庭にお願いすること */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-8">
            <SectionHeading variant="compact" className="mb-2">
              ご家庭に/お願いすること
            </SectionHeading>
            <p className="text-base text-gray-600 leading-relaxed">
              {wb(
                "Nobilva はメンターと生徒が/中心になって動く仕組みですが、/いくつかご家庭にご協力いただきたいことがあります。",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">
                生徒（ご本人）にお願いすること
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-nobilva-accent">-</span>
                  毎日のチャット報告（長文不要・スタンプでも可）
                </li>
                <li className="flex gap-2">
                  <span className="text-nobilva-accent">-</span>
                  週1回40〜50分の面談への参加
                </li>
                <li className="flex gap-2">
                  <span className="text-nobilva-accent">-</span>
                  教材（市販の参考書・問題集）の準備
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">
                保護者の方にお願いすること
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-nobilva-accent">-</span>
                  学習時間を確保できる環境作り（夜の自宅で30分集中できる場所）
                </li>
                <li className="flex gap-2">
                  <span className="text-nobilva-accent">-</span>
                  試合・遠征・試験のスケジュール共有
                </li>
                <li className="flex gap-2">
                  <span className="text-nobilva-accent">-</span>
                  教材費の負担（市販書）
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">教材費の目安</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              全科目で参考書・問題集を揃える場合、
              <strong>年間 1万円〜2万円程度</strong>が目安です。
              すでにお持ちの教材を活用することも多く、追加購入が必要なものをメンターが厳選してお伝えします。
              学校で配布される教材（サクシードなど）が使える場合は、そちらを優先的に使うため追加購入はさらに少なくなります。
            </p>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">お願いしないこと</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-gray-400">-</span>
                学習内容の確認・採点（メンターが行います）
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400">-</span>
                計画の作成・管理（メンターが行います）
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400">-</span>
                進捗の毎日チェック（チャットは生徒・メンター間で完結）
              </li>
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
          <div className="text-center mb-8">
            <SectionHeading variant="compact">
              Nobilva が合うご家庭・/合わないご家庭
            </SectionHeading>
          </div>

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
                    <span className="text-green-600 flex-shrink-0 font-bold">
                      &#10003;
                    </span>
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
                  "保護者がリアルタイムで進捗を監視したい場合",
                  "教科ごとに専門講師による解説を期待される場合",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-400 flex-shrink-0 font-bold">
                      &#10005;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-sm text-gray-700 leading-relaxed">
            <h3 className="font-bold text-gray-900 mb-2">判断に迷ったら</h3>
            <p>
              どちらに該当するか分からない場合は、無料学習診断で具体的な状況をお聞かせください。
            </p>
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <SubpageCTA
        heading="仕組みを理解した上で、/一度話してみませんか。"
        description="無料学習診断では、/ご家庭の状況に合わせて/「Nobilva が合うかどうか」を/率直にお伝えします。/その場での申込みは求めません。"
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
  freq,
}: {
  label: string;
  sub: string;
  freq?: string;
}) {
  return (
    <div className="text-center rounded-2xl px-4 py-5 md:px-6 md:py-6 bg-white">
      <p className="font-black text-gray-900 text-base md:text-lg leading-tight">
        {label}
      </p>
      <p className="text-sm text-nobilva-accent font-medium mt-1">{sub}</p>
      {freq && <p className="text-xs text-gray-500 mt-1">{freq}</p>}
    </div>
  );
}

function CycleArrow({
  direction,
}: {
  direction: "right" | "down" | "left" | "up";
}) {
  const rotation = { right: "0", down: "90", left: "180", up: "270" }[
    direction
  ];
  return (
    <div className="flex items-center justify-center">
      <svg
        className="w-5 h-5 md:w-6 md:h-6 text-nobilva-accent"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <path
          d="M5 12h14m-4-4l4 4-4 4"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
        <span
          className={`text-xs font-bold ${isStudent ? "text-nobilva-accent" : "text-gray-500"}`}
        >
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
