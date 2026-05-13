import type { Metadata } from "next";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "料金プラン・全額返金保証 - Nobilva | Nectere",
    description:
      "Nobilva の料金体系。全科目まとめて月18,000円〜。30日全額返金保証・入会金0円・解約違約金なし。エッセンシャルプラン・ベーシックプランの詳細と個別指導オプション。",
    alternates: {
      canonical: getCanonicalUrl("/services/nobilva/pricing"),
      languages: getAlternatesLanguages("/services/nobilva/pricing"),
    },
  };
}

const pricingFAQ = [
  {
    question: "複数科目を受講すると料金は上がりますか？",
    answer:
      "いいえ、上がりません。Nobilva は全科目まとめて固定料金です。テスト前だけ理科を強化したい、など科目の追加・変更にも追加料金はかかりません。",
  },
  {
    question: "兄弟割引はありますか？",
    answer: "はい。2人目のご兄弟は月額料金から10%割引となります。",
  },
  {
    question: "途中でプラン変更はできますか？",
    answer:
      "はい、可能です。前月25日までにメールでご連絡いただければ、翌月から変更が反映されます。",
  },
  {
    question: "30日全額返金保証の30日はいつから数えますか？",
    answer:
      "入会日（初回月額料金の決済日）から30日間です。30日以内にメールでお申し出いただければ、全額返金いたします。",
  },
  {
    question: "解約時に違約金はかかりますか？",
    answer:
      "いいえ、違約金は一切ありません。月単位でいつでも解約が可能です。",
  },
  {
    question: "教材を事前に購入する必要はありますか？",
    answer:
      "いいえ、不要です。初回の面談でお子さんの状況を確認した後、メンターが最適な教材をご提案します。学校配布の教材を最大限活用します。",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー */}
      <section className="bg-white pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            全科目まとめて、月18,000円から。
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            一つの月額で全科目をまとめてサポート。科目が増えても、料金は変わりません。
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center bg-nobilva-light text-gray-800 font-medium text-sm px-4 py-2 rounded-full">
              入会金 0円
            </span>
            <span className="inline-flex items-center bg-nobilva-light text-gray-800 font-medium text-sm px-4 py-2 rounded-full">
              30日全額返金保証
            </span>
            <span className="inline-flex items-center bg-nobilva-light text-gray-800 font-medium text-sm px-4 py-2 rounded-full">
              全科目対応・追加料金なし
            </span>
          </div>
        </div>
      </section>

      {/* 2. 料金表示の罠 注意喚起 */}
      <section className="bg-amber-50 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-amber-500">&#9888;</span>
            他社サービスの料金表示にご注意
          </h2>
          <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-3">
            <p className="font-bold">
              「月額○○円〜」の表記は、何科目分ですか？
            </p>
            <p>
              オンライン個別指導サービスの多くは、表記が「1科目あたり」になっています。一見お得に見えても、複数科目を受講すると料金が積み上がります。
            </p>
            <p>
              たとえば「1科目19,800円」のA社で英・数・国の3科目を受講すると、月額は
              <span className="font-bold">約59,400円</span>
              になります。Nobilva
              ベーシックプランなら全科目まとめて26,000円/月です。
            </p>
            <p className="text-sm text-gray-500">
              ただし、1〜2科目のみの受講なら他社の方が安い場合もあります。ご家庭の状況に合わせてご比較ください。
            </p>
          </div>
        </div>
      </section>

      {/* 3. 料金プラン詳細 */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 space-y-6">
          {/* エッセンシャル */}
          <div className="border border-gray-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              エッセンシャルプラン
            </h3>
            <p className="text-3xl md:text-4xl font-bold text-nobilva-accent mb-1">
              18,000
              <span className="text-base font-medium text-gray-500">
                円/月（税込・1人）
              </span>
            </p>
            <p className="text-sm text-gray-500 mb-6">全科目対応</p>

            <h4 className="text-sm font-bold text-gray-700 mb-3">
              含まれるもの
            </h4>
            <ul className="space-y-2 mb-4">
              {[
                "日割り学習計画の作成（全科目）",
                "週1回のオンライン面談（30分）",
                "専属メンターの担当",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-bold text-gray-700 mb-2">
              含まれないもの
            </h4>
            <ul className="space-y-1 mb-4">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <X /> 毎日のチャット進捗確認
              </li>
            </ul>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <span className="font-bold">向いている方：</span>
                学習計画をプロに任せたい、週1面談でしっかり方向性を確認したい方。シンプルで始めやすいプランです。
              </p>
            </div>
          </div>

          {/* ベーシック */}
          <div className="border-2 border-nobilva-accent rounded-2xl p-6 md:p-8 relative">
            <span className="absolute -top-3 left-6 bg-nobilva-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              おすすめ
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ベーシックプラン
            </h3>
            <p className="text-3xl md:text-4xl font-bold text-nobilva-accent mb-1">
              26,000
              <span className="text-base font-medium text-gray-500">
                円/月（税込・1人）
              </span>
            </p>
            <p className="text-sm text-gray-500 mb-6">全科目対応</p>

            <h4 className="text-sm font-bold text-gray-700 mb-3">
              含まれるもの
            </h4>
            <ul className="space-y-2 mb-4">
              {[
                "日割り学習計画の作成（全科目）",
                "週1回のオンライン面談（30分）",
                "毎日チャットで進捗管理",
                "専属メンターの担当",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-nobilva-light rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-bold">向いている方：</span>
                毎日の学習習慣を定着させたい、モチベーション維持に不安がある方。三本柱がフルで機能するプランです。
              </p>
            </div>
            <p className="text-xs text-gray-500">
              <span className="font-bold">推奨理由：</span>
              三本柱の「毎日の進捗確認」が含まれることで、学習習慣の定着率が大きく変わります。
            </p>
          </div>

          {/* オプション */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              オプション：1対1個別指導
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              週1コマ（月4コマ）20,000円〜（仮設定）
            </p>
            <h4 className="text-sm font-bold text-gray-700 mb-3">
              含まれるもの
            </h4>
            <ul className="space-y-2 mb-4">
              {[
                "東大・京大などの難関大生メンターによる60分の1対1個別指導",
                "学習管理プランとの併用が可能",
                "個別指導のみのご利用も可能",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500">
              個別指導の正式な料金体系は現在整備中です。詳細は無料学習診断でお問い合わせください。
            </p>
          </div>
        </div>
      </section>

      {/* 4. 30日全額返金保証 */}
      <section className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            30日全額返金保証
          </h2>
          <div className="bg-white rounded-2xl p-6 md:p-8 space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              入会から30日以内であれば、月額料金を全額返金いたします。理由は問いません。
            </p>
            <div>
              <p className="font-bold text-gray-900 mb-1">返金対象</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>
                  月額料金（エッセンシャル / ベーシック）
                </li>
                <li>30日以内の個別指導オプション料金</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">返金対象外</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>教材費（市販の参考書・問題集）</li>
                <li>30日を超えた期間の月額料金</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">申請方法</p>
              <p className="text-gray-600">
                <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                  nobilva@nectere.jp
                </code>{" "}
                まで、件名「30日返金保証 申請」でメールをお送りください。受領から7営業日以内にご登録口座へ返金いたします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 教材費について */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            教材費について
          </h2>
          <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              Nobilva
              独自の教材はありません。市販の参考書・問題集をご家庭でご用意いただきます（メンターが推薦）。
            </p>
            <p>
              <span className="font-bold">年間の教材費目安：</span>1〜2万円程度。
              学校配布の教材を最大限活用するため、不要な高額参考書は推奨しません。
            </p>
          </div>
        </div>
      </section>

      {/* 6. 解約条件・支払い方法 */}
      <section className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            解約条件・支払い方法
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">支払い方法</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>銀行振込のみ（クレジットカード非対応）</li>
                <li>月初に当月分をお振込み</li>
                <li>振込手数料はお客様ご負担</li>
                <li>初月は日割り計算</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">解約条件</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>いつでも解約可能（月単位）</li>
                <li>前月25日までにメール連絡で翌月解約</li>
                <li>違約金なし</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">一時休会</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>1ヶ月単位で可能</li>
                <li>休会期間中は月額料金なし</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">プラン変更</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>いつでも変更可能</li>
                <li>前月25日までにメール連絡で翌月反映</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <SubpageFAQ items={pricingFAQ} heading="料金に関するよくある質問" />

      {/* 8. CTA */}
      <SubpageCTA
        heading="料金にご納得いただけたら、一度ご相談ください。"
        description="無料学習診断でご状況に合わせてどのプランが最適かもご提案します。その場でお申込みを決める必要はありません。"
        secondaryLinks={[
          {
            label: "サービスの仕組みを見る",
            href: "/ja/services/nobilva/how-it-works",
          },
          {
            label: "指導実績を見る",
            href: "/ja/services/nobilva/results",
          },
          {
            label: "指導者を見る",
            href: "/ja/services/nobilva/coach",
          },
        ]}
      />
    </div>
  );
}

function Check() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function X() {
  return (
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
