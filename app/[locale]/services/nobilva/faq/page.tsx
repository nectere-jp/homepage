"use client";

import { useState } from "react";
import Link from "next/link";
import { DiagnosisCTA } from "@/components/nobilva/DiagnosisCTA";

const PARENT_FAQ = [
  {
    category: "サービス内容について",
    items: [
      {
        q: "Nobilva はどんなサービスですか？",
        a: "野球をがんばる中高生のための、オンライン学習管理サービスです。「日割り学習計画」「週1回オンライン面談」「毎日の進捗確認」の3つの仕組みで、練習と勉強の両立をサポートします。",
      },
      {
        q: "学習指導サービスとの違いは何ですか？",
        a: "一般的な学習指導サービスは「問題の解説・解き方の指導」が中心です。Nobilva は「続けられる学習の仕組み作り」が中心です。計画作成・進捗管理・モチベーション維持に重点を置いています。個別指導が必要な場合は、オプションで追加できます。",
      },
      {
        q: "野球以外のスポーツでも利用できますか？",
        a: "はい。Nobilva は野球をがんばる中高生を主な対象として設計していますが、他のスポーツや部活動に取り組まれている方も歓迎しています。無料学習診断で具体的な状況を伺ったうえで、最適なご提案をします。",
      },
      {
        q: "オンラインだけで本当に成果が出ますか？",
        a: "学習管理は対面である必要性が低く、むしろ毎日の進捗確認をオンラインで完結できる方が、続けやすいケースが多くあります。過去の指導実績では、オンラインのみで顕著な変化が見られています。",
      },
      {
        q: "どのような生徒に向いていますか／向いていませんか？",
        a: "向いている：部活と勉強の両立に悩んでいる／自宅学習の習慣を作りたい／推薦と一般進学の両方を残したい／通塾の時間がない方。向いていない：1〜2ヶ月で大幅な成績向上を期待される場合／親がリアルタイムで進捗を監視したい場合／教科ごとの専門講師による解説をメインに求める場合。",
      },
    ],
  },
  {
    category: "料金・支払いについて",
    items: [
      {
        q: "料金プランは何種類ありますか？",
        a: "月額プランは2種類（エッセンシャル 18,000円／ベーシック 26,000円）と、オプションで1対1個別指導があります。どちらのプランも全科目対応・追加料金なしが基本です。",
      },
      {
        q: "複数科目を受講すると料金は上がりますか？",
        a: "上がりません。エッセンシャル／ベーシックともに全科目対応で固定料金です。テスト前だけ理科を強化したい、内申のために実技4教科も見てほしい、なども追加料金なしで対応します。",
      },
      {
        q: "兄弟2人で利用する場合、割引はありますか？",
        a: "はい。兄弟同時受講の場合、2人目は月額10%割引とさせていただきます。",
      },
      {
        q: "支払い方法は何がありますか？",
        a: "銀行振込のみです（クレジットカード決済は現在対応していません）。月初に当月分を指定口座へお振込みください。振込手数料はお客様にてご負担をお願いいたします。",
      },
      {
        q: "教材費はどれくらいかかりますか？",
        a: "全科目で参考書・問題集を揃える場合、年間 1万円〜2万円程度が目安です。すでにお持ちの教材や学校配布教材を活用できる場合は、追加購入はさらに少なくなります。",
      },
      {
        q: "途中でプランを変更できますか？",
        a: "はい、いつでも可能です。前月25日までにご連絡いただければ、翌月から変更が反映されます。",
      },
    ],
  },
  {
    category: "申込み・契約について",
    items: [
      {
        q: "申込みの流れを教えてください",
        a: "1. 無料学習診断に申込み → 2. 24時間以内に面談日時の確定メールが届く → 3. オンラインで30分の面談 → 4. ご検討期間を経て正式申込み → 5. サービス開始。",
      },
      {
        q: "無料学習診断は本当に無料ですか？",
        a: "はい、完全に無料です。30分のオンライン面談のみで、追加料金・教材販売はありません。その場での申込み強要もしません。「判断材料をお持ち帰りいただく場」として運用しています。",
      },
      {
        q: "契約期間の縛りはありますか？",
        a: "ありません。月単位の契約で、いつでも解約可能です。「合わなければやめられる」状態を維持しています。",
      },
      {
        q: "誰が申し込みできますか？",
        a: "保護者の方・生徒ご本人、どちらでも申込み可能です。保護者の代理申込みも、生徒の自主的な申込みも歓迎しています。",
      },
    ],
  },
  {
    category: "解約・返金について",
    items: [
      {
        q: "解約はいつでもできますか？",
        a: "はい。月単位でいつでも解約可能です。解約希望月の前月25日までにメールでご連絡ください。25日以降のご連絡は、翌月解約扱いとなります。",
      },
      {
        q: "解約に違約金はありますか？",
        a: "ありません。いつでも、何ヶ月利用された後でも、解約手数料は発生しません。",
      },
      {
        q: "30日全額返金保証の条件は？",
        a: "入会から30日以内であれば、ご利用いただいた月額料金を全額返金いたします。申し出のみで処理し、理由は問いません。教材費（市販書）は対象外です。",
      },
      {
        q: "一時休会はできますか？",
        a: "はい。試合期以外の長期休暇・大会期・怪我などの事情で、1ヶ月単位の一時休会が可能です。休会期間中は月額料金が発生しません。",
      },
    ],
  },
  {
    category: "学習について",
    items: [
      {
        q: "練習で疲れていても勉強できますか？",
        a: "はい。メンターが疲労度や体調も考慮して、1日15分から始められる無理のない計画を立てます。短時間でも効果的な学習方法を提案し、徐々に学習時間を増やしていきます。",
      },
      {
        q: "遠征や大会で学校を欠席することが多くても大丈夫ですか？",
        a: "はい、むしろそのような生徒こそ Nobilva のサポートが役立ちます。遠征スケジュールを共有していただき、計画を週単位で柔軟に調整します。戻った後の追い上げもメンターと一緒に設計します。",
      },
      {
        q: "成績はどれくらいで上がりますか？",
        a: "個人差がありますが、過去の指導実績では3ヶ月程度で学習リズムの定着が見られ、半年〜1年でテスト成績・評定の改善が出てくるケースが多くあります。Nobilva は「即効性」よりも「長く続けられるリズムの定着」に重点を置いています。",
      },
      {
        q: "苦手科目に集中して指導してほしいのですが、可能ですか？",
        a: "学習管理プランの中で、苦手科目への重点配分は可能です。ただし、解説中心の集中指導をご希望の場合は、オプションの1対1個別指導をおすすめします。",
      },
    ],
  },
  {
    category: "メンター・指導について",
    items: [
      {
        q: "メンターはどんな人ですか？",
        a: "現在、Nobilva のメンターはヘッドコーチ・中村龍人と代表メンター・養田貴大の2名で運用しています。全生徒を直接担当しています。",
      },
      {
        q: "メンターは途中で変わりますか？",
        a: "担当メンターは原則として継続します（途中で変わらない設計）。担当の継続性が、長く続く伴走の前提条件だと考えています。",
      },
      {
        q: "保護者は面談に同席できますか？",
        a: "はい、ご希望されれば最後の5分間から同席いただけます。通常は生徒とメンターの1対1で進めますが、保護者の方のご相談事もお受けします。",
      },
    ],
  },
  {
    category: "進路について",
    items: [
      {
        q: "スポーツ推薦と一般進学、両方の選択肢を残せますか？",
        a: "はい。Nobilva は「進路は最後まで先送りできる」状態を目指して学習を設計します。週1面談で、推薦基準（評定・英検）と一般受験準備を並行設計します。",
      },
      {
        q: "志望校選びの相談もできますか？",
        a: "はい。週1面談で進路・志望校についてのご相談もお受けします。ただし、最終的な志望校の決定は、学校の進路指導と連携して進めていただくことを推奨します。",
      },
    ],
  },
];

const STUDENT_FAQ = [
  {
    category: "始め方",
    items: [
      {
        q: "自分で勝手に申し込んでいいの？",
        a: "いいです。Nobilva は生徒本人からの申込みも受け付けています。無料学習診断のフォームで、お申し込み者欄に自分の名前を書いてください。ただし、契約・料金支払いは保護者の方を経由する形になるため、最終的にはご家族に話す必要があります。",
      },
      {
        q: "診断の面談、親がいないと話せない？",
        a: "いいえ。生徒1人で参加できます。保護者の方も同席されてもされなくても、どちらでも対応します。",
      },
      {
        q: "何を準備すればいい？",
        a: "特に準備は不要です。Zoom が使える環境（スマホでもOK）と、30分の時間だけご用意ください。学校で配布されている教材や、今使っている問題集があれば、面談の場でメンターに見せてもらえると助かります。",
      },
    ],
  },
  {
    category: "日常の使い方",
    items: [
      {
        q: "毎日のチャット報告って、長く書かなきゃダメ？",
        a: "いいえ。一行・スタンプだけでもOKです。「今日のやることリストのうち、できたもの・できなかったもの」が伝わればそれで十分です。",
      },
      {
        q: "詰まった問題はどうすればいい？",
        a: "写真を撮ってチャットで送ってください。メンターが24時間以内に返信して、明日の計画に類題や復習のページを追加します。",
      },
      {
        q: "やる気が出ない日があったらどうする？",
        a: "「やる気が出ない」と正直にチャットで伝えてください。責められません。理由を一緒に分解して、明日できる範囲に計画を調整します。",
      },
    ],
  },
  {
    category: "困った時",
    items: [
      {
        q: "面談の日に部活の予定が入ったらどうすればいい？",
        a: "別の日時に振り替えできます。メンターにチャットで連絡してください。最低24時間前のご連絡が望ましいですが、急な変更も柔軟に対応します。",
      },
      {
        q: "メンターと相性が合わない気がする時は？",
        a: "遠慮なく言ってください。全員に合うメンターはいません。担当変更はお約束できませんが、ご相談には乗ります。30日以内であれば全額返金保証もあるので、合わないと感じたらサービス自体を止める選択もあります。",
      },
    ],
  },
];

const TEAM_FAQ = [
  {
    category: "導入の流れ",
    items: [
      {
        q: "チーム全体で導入する必要がありますか？",
        a: "いいえ。Nobilva は選手・ご家庭ごとに個別契約するサービスです。「導入」と表現していますが、チームに対する一括契約ではありません。ご紹介いただいた選手・ご家庭のうち、ご希望の方だけが個別にご利用いただきます。",
      },
      {
        q: "他の学習サービスを既に紹介しているチームでも導入できますか？",
        a: "はい、可能です。他のサービスとの併用も妨げません。",
      },
      {
        q: "保護者会での挨拶は必ず必要ですか？",
        a: "いいえ、不要です。紹介資料（ビラ・LINE文面など）を配布いただくだけでも導入は可能です。「直接話を聞きたい」というご希望があれば、オンライン挨拶（5〜10分）で対応します。",
      },
    ],
  },
  {
    category: "お金の流れ",
    items: [
      {
        q: "チーム特別価格はどれくらいですか？",
        a: "通常価格から10%割引（仮設定）です。ご利用継続中ずっと有効です。チーム特別価格は保護者の月額に直接反映されるため、チーム側に金銭的な手続きは発生しません。",
      },
      {
        q: "チームに対する紹介手数料はありますか？",
        a: "いいえ、ありません。Nobilva ではチームへの紹介手数料は提供していません。チーム経由のご紹介に対する経済的メリットは、保護者の月額10%割引（チーム特別価格）として直接ご家庭に反映する形に一本化しています。",
      },
    ],
  },
  {
    category: "責任の所在",
    items: [
      {
        q: "選手・保護者から Nobilva にトラブルが発生した場合は？",
        a: "Nobilva が直接対応します。監督・小頭の皆さまに間に立っていただく必要はありません。",
      },
      {
        q: "契約・料金徴収・解約の事務はチーム側でやる必要がありますか？",
        a: "いいえ、ありません。契約・料金徴収・解約は、すべて Nobilva と保護者の直接やり取りで完結します。",
      },
    ],
  },
];

type TabKey = "parent" | "student" | "team";

const TABS: { key: TabKey; label: string; description: string }[] = [
  { key: "parent", label: "保護者の方", description: "サービス内容・料金・申込・解約・進路など" },
  { key: "student", label: "生徒の方", description: "始め方・日常の使い方・困った時" },
  { key: "team", label: "チーム関係者の方", description: "導入の流れ・お金の流れ・責任の所在" },
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("parent");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const currentFAQ =
    activeTab === "parent"
      ? PARENT_FAQ
      : activeTab === "student"
        ? STUDENT_FAQ
        : TEAM_FAQ;

  return (
    <div className="bg-white min-h-screen">
      {/* ヒーロー */}
      <section className="bg-white pt-32 md:pt-40 pb-8 md:pb-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            よくあるご質問
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
            Nobilva について、よくいただくご質問をまとめました。
            ご質問のお立場に合わせて、タブをお選びください。
          </p>

          {/* タブ */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-nobilva-main text-gray-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ本体 */}
      <section className="bg-white pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="space-y-10">
            {currentFAQ.map((category) => (
              <div key={category.category}>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {category.items.map((item, i) => {
                    const key = `${activeTab}-${category.category}-${i}`;
                    const isOpen = openIndex === key;
                    return (
                      <div
                        key={key}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setOpenIndex(isOpen ? null : key)
                          }
                          className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
                        >
                          <span className="text-lg font-black text-nobilva-main flex-shrink-0">
                            Q
                          </span>
                          <span className="flex-1 text-sm md:text-base font-medium text-gray-900">
                            {item.q}
                          </span>
                          <svg
                            className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-200 ${
                            isOpen ? "max-h-[500px]" : "max-h-0"
                          }`}
                        >
                          <div className="px-4 md:px-5 pb-4 md:pb-5 pl-12 md:pl-14">
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-nobilva-light to-amber-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center">
          <h2 className="bg-nobilva-main px-8 py-3 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-4">
            疑問が解消したら、一度ご相談ください。
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            個別の状況に応じたご提案は、無料学習診断またはお問い合わせフォームでお受けします。
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 bg-nobilva-main text-gray-900 font-bold text-sm px-4 py-2 rounded-full">
              月20名限定
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm px-4 py-2 rounded-full">
              30日全額返金保証
            </span>
          </div>

          <DiagnosisCTA variant="hero" />

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/ja/services/nobilva/for-teams"
              className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm md:text-base"
            >
              チーム導入のお問い合わせ
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>このページにご質問が掲載されていない場合は、お気軽にお問い合わせください。</p>
            <p className="mt-1">
              nobilva@nectere.jp / 03-6820-9037
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
