import Link from "next/link";
import { DiagnosisCTA } from "./DiagnosisCTA";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        {/* リード文 */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block mb-4">
            一つの月額で、全科目をまとめて。
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            科目が増えても、料金は変わりません。
          </p>
        </div>

        {/* 全科目パック訴求バナー */}
        <div className="bg-nobilva-main/20 border border-nobilva-main rounded-2xl p-6 md:p-8 mb-10 text-center">
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            全科目まとめて、月18,000円から
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
            国語・数学・英語・理科・社会、必要なときに必要な科目を、追加料金なしで。
            テスト前だけ理科を強化したい、内申のために実技4教科も見てほしい——どれもこの料金内で対応します。
          </p>
        </div>

        {/* プランカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
          {/* エッセンシャル */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              エッセンシャルプラン
            </h3>
            <p className="text-3xl md:text-4xl font-bold text-nobilva-accent mb-1">
              18,000
              <span className="text-base font-medium text-gray-500">
                円/月（税込・1人）
              </span>
            </p>
            <p className="text-sm text-gray-500 mb-6">全科目対応</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckIcon />
                <span className="text-sm md:text-base text-gray-700">
                  日割り学習計画の作成（全科目）
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon />
                <span className="text-sm md:text-base text-gray-700">
                  週1回のオンライン面談（30分）
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                学習計画をプロに任せたい、週1面談でしっかり方向性を確認したい方。シンプルで始めやすいプランです。
              </p>
            </div>
          </div>

          {/* ベーシック（おすすめ） */}
          <div className="bg-white border-2 border-nobilva-accent rounded-2xl p-6 md:p-8 relative">
            <span className="absolute -top-3 left-6 bg-nobilva-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              おすすめ
            </span>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              ベーシックプラン
            </h3>
            <p className="text-3xl md:text-4xl font-bold text-nobilva-accent mb-1">
              26,000
              <span className="text-base font-medium text-gray-500">
                円/月（税込・1人）
              </span>
            </p>
            <p className="text-sm text-gray-500 mb-6">全科目対応</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckIcon />
                <span className="text-sm md:text-base text-gray-700">
                  日割り学習計画の作成（全科目）
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon />
                <span className="text-sm md:text-base text-gray-700">
                  週1回のオンライン面談（30分）
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon />
                <span className="text-sm md:text-base text-gray-700 font-medium">
                  毎日チャットで進捗管理
                </span>
              </div>
            </div>

            <div className="bg-nobilva-light rounded-lg p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                毎日の学習習慣を定着させたい、モチベーション維持に不安がある方。三本柱がフルで機能するプランです。
              </p>
            </div>
          </div>
        </div>

        {/* オプション */}
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-10">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            オプション：1対1個別指導
          </h3>
          <p className="text-sm text-gray-500 mb-3">月額別途（応相談）</p>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            苦手科目の克服や、より深い学習を希望する方向け。東大・京大などの難関大生メンターによる1対1個別指導。学習管理プランと併用も、個別指導のみのご利用も可能です。
          </p>
        </div>

        {/* 料金比較の注意 */}
        <div className="border-2 border-dashed border-amber-300 bg-amber-50/60 rounded-2xl p-6 md:p-8 mb-10 text-center">
          <p className="text-amber-500 text-3xl mb-3">&#9888;</p>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
            料金比較の前にチェックしたいこと
          </h3>
          <p className="text-base md:text-lg font-bold text-gray-800 mb-4">
            「月額○○円〜」の表記は、何科目分ですか？
          </p>
          <div className="max-w-xl mx-auto space-y-3 text-sm md:text-base text-gray-600 leading-relaxed mb-6">
            <p>
              オンライン個別指導サービスの多くは、表記が「1科目あたり」になっています。
              <br className="hidden md:inline" />
              一見お得に見えても、複数科目を受講すると料金が積み上がる仕組みです。
            </p>
            <p>
              たとえば「1科目19,800円」のサービスで英・数・国の3科目を受講すると、
              <br className="hidden md:inline" />
              月額は<span className="font-bold text-gray-900">約60,000円</span>になります。
            </p>
          </div>
          <div className="border-t border-amber-200 pt-5 max-w-md mx-auto">
            <p className="text-sm font-bold text-gray-800 mb-3">
              Nobilva はそもそも料金体系が違います。
            </p>
            <ul className="space-y-2 text-sm text-gray-700 text-left inline-block">
              <li className="flex items-start gap-2">
                <CheckIcon color="accent" />
                一つの月額で<span className="font-bold">全科目まとめて</span>対応
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon color="accent" />
                テスト前だけ理科を増やしたい、なども追加料金なし
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon color="accent" />
                学習計画・進捗管理も料金内に含む
              </li>
            </ul>
          </div>
          <p className="text-gray-400 text-xs mt-5">
            サービスを比較する際は、「複数科目を受講した場合の月額総額」で比べることをおすすめします。
          </p>
        </div>

        {/* 共通の安心設計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-nobilva-accent/10 border border-nobilva-accent/30 rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto text-nobilva-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 mb-1">30日全額返金保証</p>
            <p className="text-xs text-gray-500">
              入会から30日以内であれば全額返金。
            </p>
          </div>
          <div className="bg-nobilva-accent/10 border border-nobilva-accent/30 rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto text-nobilva-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 mb-1">入会金：0円</p>
            <p className="text-xs text-gray-500">
              教材はメンターが推薦する市販の参考書・問題集をご家庭でご用意いただきます。
            </p>
          </div>
          <div className="bg-nobilva-accent/10 border border-nobilva-accent/30 rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto text-nobilva-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 mb-1">通塾・送迎：不要</p>
            <p className="text-xs text-gray-500">
              全てオンラインで完結します
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/ja/services/nobilva/pricing"
            className="inline-flex items-center gap-2 border-2 border-nobilva-accent text-nobilva-accent font-bold text-base px-6 py-3 rounded-lg hover:bg-nobilva-accent hover:text-white transition-all"
          >
            料金の詳細を見る
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <DiagnosisCTA />
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ color = "green" }: { color?: "green" | "accent" }) {
  const colorClass =
    color === "accent" ? "text-nobilva-accent" : "text-green-500";
  return (
    <svg
      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorClass}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
