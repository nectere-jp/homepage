import type { Metadata } from "next";
import { SubpageCTA } from "@/components/nobilva/SubpageCTA";
import { SubpageHero } from "@/components/nobilva/SubpageHero";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { CheckIcon } from "@/components/nobilva/Icons";
import { PricingCore, OptionSessionCard } from "@/components/nobilva/PricingSection";
import { wb } from "@/lib/wb";
import { SectionHeading } from "@/components/nobilva/SectionHeading";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "料金プラン・全額返金保証 - Nobilva | Nectere",
    description:
      "Nobilva の料金体系。全科目まとめて月18,000円〜。30日全額返金保証・入塾金8,000円・解約違約金なし。エッセンシャルプラン・ベーシックプランの詳細と個別指導オプション。",
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
    answer: "いいえ、違約金は一切ありません。月単位でいつでも解約が可能です。",
  },
  {
    question: "教材を事前に購入する必要はありますか？",
    answer:
      "いいえ、不要です。初回の面談でお子さんの状況を確認した後、メンターが最適な教材をご提案します。学校配布の教材を最大限活用します。",
  },
];

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Nobilva 学習管理サービス",
    description:
      "野球をがんばる中高生のための学習管理。全科目対応・月額固定。30日全額返金保証。",
    brand: { "@type": "Organization", name: "Nectere" },
    offers: [
      {
        "@type": "Offer",
        name: "エッセンシャルプラン",
        price: "18000",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "ベーシックプラン",
        price: "26000",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SubpageHero title={wb("全科目まとめて、/月額最大26,000円。")}>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full">
            入塾金 8,000円
          </span>
          <span className="inline-flex items-center bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full">
            30日全額返金保証
          </span>
          <span className="inline-flex items-center bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full">
            全科目対応・追加料金なし
          </span>
        </div>
      </SubpageHero>

      {/* 2. 料金表示の罠 注意喚起 */}
      <section className="bg-amber-50 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-amber-500">&#9888;</span>
            {wb("他社サービスの/料金表示にご注意ください")}
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
          </div>
        </div>
      </section>

      {/* 3. 料金プラン詳細 */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 space-y-6">
          <PricingCore showOption={false} />

          {/* 全プラン共通 */}
          <div className="bg-nobilva-light p-6 md:p-8">
            <p className="text-sm md:text-base font-bold text-gray-900 mb-3">
              全プラン共通
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "全科目対応・追加料金なし",
                "日割り学習計画の作成",
                "専属メンターの担当",
                "30日全額返金保証",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm md:text-base text-gray-700"
                >
                  <CheckIcon size="sm" color="accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* オプション：フォローアップ個別指導 */}
          <OptionSessionCard />
        </div>
      </section>

      {/* 4. 30日全額返金保証 */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-6">30日全額返金保証</SectionHeading>
          <div className="bg-white rounded-2xl p-6 md:p-8 space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              入会から30日以内であれば、月額料金を全額返金いたします。理由は問いません。
            </p>
            <div>
              <p className="font-bold text-gray-900 mb-1">返金対象</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>月額料金（エッセンシャル / ベーシック）</li>
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
                まで、件名「30日返金保証
                申請」でメールをお送りください。受領から7営業日以内にご登録口座へ返金いたします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 教材費について */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-6">教材費について</SectionHeading>
          <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              Nobilva独自の教材のご用意もありますが、基本的には市販の参考書・問題集をご家庭でご用意いただきます。
              使用する参考書・問題集は、学校で使用している教科書等を参考に、メンターが推薦いたします。
            </p>
            <p>
              年間の教材費の目安は1〜2万円程度。
              学校配布の教材を最大限活用するため、不要な参考書を推奨することはありません。
            </p>
          </div>
        </div>
      </section>

      {/* 6. 解約条件・支払い方法 */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-6">解約条件・/支払い方法</SectionHeading>
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
      <SubpageFAQ items={pricingFAQ} heading="料金に関する/よくある質問" />

      {/* 8. CTA */}
      <SubpageCTA
        heading="料金にご納得いただけたら、/一度ご相談ください。"
        description="無料学習相談で/ご状況に合わせて/どのプランが最適かも/ご提案します。/その場でお申込みを/決める必要はありません。"
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

