"use client";

import { useState } from "react";
import Link from "next/link";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";

export default function ForTeamsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー */}
      <section className="bg-white pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            リトルシニア・ボーイズ・ポニー・ヤング・高校野球部
            <br />
            ご関係者の皆さまへ
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            Nobilva は、野球をがんばる中高生のための学習管理サービスです。
            練習と勉強の両立に課題を感じる選手・ご家庭に向けて、
            チーム経由でのご紹介に対する<strong>チーム特別価格</strong>をご用意しています。
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            このページでは、監督・コーチ・父母会ご担当者の方向けに、
            Nobilva のチーム導入の仕組みを簡潔にご説明します。
          </p>

          {/* 目次 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { label: "伝えたいこと", href: "#message" },
              { label: "価値提供", href: "#value" },
              { label: "特別価格", href: "#team-price" },
              { label: "導入の流れ", href: "#flow" },
              { label: "負担ゼロ", href: "#workload" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center bg-gray-100 text-gray-700 font-medium text-xs px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* 連絡先 */}
          <div className="bg-nobilva-light rounded-xl p-5">
            <p className="font-bold text-gray-900 text-sm mb-2">直接ご相談はこちら</p>
            <p className="text-sm text-gray-700">
              nobilva@nectere.jp / 03-6820-9037
            </p>
            <p className="text-xs text-gray-500 mt-1">
              担当：中村龍人（ヘッドコーチ）・養田貴大（代表メンター）
            </p>
          </div>
        </div>
      </section>

      {/* 2. 監督・指導者に伝えたいこと */}
      <section id="message" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            監督・指導者の皆さまへ
          </h2>
          <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              中学・高校で野球に取り組む選手たちは、練習・遠征・大会と、限られた時間を競技に費やしています。
              その時間の使い方は、本人にとっても保護者の方にとっても、大切な選択です。
            </p>
            <p>
              一方で、進路選択の局面では、<strong>学業の積み上げ</strong>が選手の選択肢を広げる重要な要素となります。
              スポーツ推薦・指定校推薦・一般入試——どの道を選ぶにも、評定や基礎学力は必要です。
            </p>
            <p>
              Nobilva は、競技と学業の両立に課題を感じる選手・ご家庭に向けて、<strong>「続けられる学習の仕組み」</strong>を提供するサービスです。
              派手な短期成績向上ではなく、<strong>長く続けられる学習リズムの定着</strong>を主眼に置いています。
            </p>
            <p>
              チーム経由でのご紹介を、特別価格でお受けする仕組みをご用意しています。
              選手たちの<strong>進路の選択肢を、最後まで残せる状態</strong>を、Nobilva とご一緒に作っていただければ幸いです。
            </p>
          </div>
        </div>
      </section>

      {/* 3. 選手・保護者への価値提供 */}
      <section id="value" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            選手・保護者に提供する価値
          </h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-4 font-bold text-gray-900">仕組み</th>
                  <th className="text-left py-3 pr-4 font-bold text-gray-900">内容</th>
                  <th className="text-left py-3 font-bold text-gray-900">頻度</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">日割り学習計画</td>
                  <td className="py-3 pr-4">専属メンターが翌週分の計画を作成</td>
                  <td className="py-3">毎週更新</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">週1回オンライン面談</td>
                  <td className="py-3 pr-4">30分のZoomで方向性確認</td>
                  <td className="py-3">週1回</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-900">毎日の進捗確認</td>
                  <td className="py-3 pr-4">専用チャットでメンターと対話</td>
                  <td className="py-3">毎日</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              "完全オンライン（通塾不要）",
              "全科目対応のパック料金",
              "専属メンターによる個別対応",
              "30日全額返金保証",
              "入会金 0円",
            ].map((item) => (
              <div key={item} className="bg-gray-50 rounded-lg p-3 text-xs md:text-sm text-gray-700 text-center">
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/ja/services/nobilva/how-it-works" className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm">
              サービスの仕組み詳細
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/ja/services/nobilva/results" className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm">
              指導実績
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/ja/services/nobilva/coach" className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm">
              指導者紹介
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. チーム特別価格 */}
      <section id="team-price" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-6">
            チーム特別価格
          </h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-4 font-bold text-gray-900">プラン</th>
                  <th className="text-left py-3 pr-4 font-bold text-gray-900">通常価格</th>
                  <th className="text-left py-3 pr-4 font-bold text-nobilva-accent">チーム特別価格</th>
                  <th className="text-left py-3 font-bold text-gray-900">割引率</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium">エッセンシャル</td>
                  <td className="py-3 pr-4">18,000円/月</td>
                  <td className="py-3 pr-4 font-bold text-nobilva-accent">16,200円/月</td>
                  <td className="py-3">10%</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">ベーシック</td>
                  <td className="py-3 pr-4">26,000円/月</td>
                  <td className="py-3 pr-4 font-bold text-nobilva-accent">23,400円/月</td>
                  <td className="py-3">10%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            ※ 上記は仮設定です。正式な割引率・適用条件は別途ご相談ください。
            適用条件：チームご関係者からのご紹介であることが面談時に確認されたご家庭。
          </p>

          <div className="bg-white rounded-xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">適用の流れ</h3>
              <ol className="space-y-1 text-sm text-gray-700">
                <li>1. 監督・コーチ・父母会から保護者・選手にご紹介</li>
                <li>2. ご家庭から無料学習診断に申込（紹介きっかけ欄に「チーム紹介」と記入）</li>
                <li>3. 面談時にチーム名を確認のうえ、特別価格を適用</li>
              </ol>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">適用期間</h3>
              <p className="text-sm text-gray-700">
                チーム特別価格は、<strong>ご利用継続中ずっと有効</strong>です。
                入会後にチームを退団された場合も、適用は継続します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 導入の流れ */}
      <section id="flow" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-8">
            導入の流れ
          </h2>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "お問い合わせ",
                who: "チーム側",
                detail: "メール nobilva@nectere.jp または電話 03-6820-9037、またはこのページ末尾のフォームから。",
              },
              {
                step: 2,
                title: "オンライン面談（30分・Zoom）",
                who: "Nobilva + チーム側",
                detail: "チームの状況、選手数、保護者会の頻度などをヒアリング。紹介方法・特別価格について個別にすり合わせ。",
              },
              {
                step: 3,
                title: "紹介資料の送付",
                who: "Nobilva 側",
                detail: "ビラ（保護者向け・選手向け）の PDF をメール送付。LINE で配布できる紹介文面のテンプレートも提供。ご希望に応じて印刷済みビラを郵送。",
              },
              {
                step: 4,
                title: "チーム内での紹介",
                who: "チーム側",
                detail: "保護者会・LINE・印刷物などで自由に配布。ご希望があれば、保護者会等でのオンライン挨拶（5〜10分）にも対応可能。",
              },
              {
                step: 5,
                title: "選手・保護者からの個別申込み",
                who: "保護者側",
                detail: "ご家庭から Nobilva の無料学習診断に直接申込み。紹介きっかけ欄に「チーム紹介」と記入で特別価格適用。契約・料金支払いは Nobilva と保護者の直接やり取り。",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-5 flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main text-gray-900 font-bold text-sm flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                    <span className="text-xs text-gray-400">（{item.who}）</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 監督・運営側の負担はゼロ */}
      <section id="workload" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-8">
            監督・運営側の負担はゼロです
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">チーム側にお願いしないこと</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "契約手続き・料金徴収",
                  "学習指導・進路相談の対応",
                  "トラブル時の仲介",
                  "解約時の手続き",
                  "個人情報の管理",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-400 flex-shrink-0 font-bold">&#10005;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">チーム側にお願いすること</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "チームへの紹介（ビラ配布・LINE 配信など）",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-600 flex-shrink-0 font-bold">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-nobilva-light rounded-xl p-6 text-sm text-gray-700 leading-relaxed">
            <p className="font-bold text-gray-900 mb-2">トラブル時の対応</p>
            <p>
              万一、入会後にトラブルが発生した場合も、<strong>全て Nobilva が直接対応します</strong>。
              監督・コーチ・父母会の皆さまに、間に立っていただく必要はありません。
              30日全額返金保証もあるため、合わなければご家庭はいつでも退会できます。
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <SubpageFAQ
        heading="チーム導入に関するよくあるご質問"
        items={[
          {
            question: "チーム全体で導入する必要がありますか？",
            answer: "いいえ。Nobilva は選手・ご家庭ごとに個別契約するサービスです。「導入」と表現していますが、チームに対する一括契約ではありません。ご紹介いただいた選手・ご家庭のうち、ご希望の方だけが個別にご利用いただきます。",
          },
          {
            question: "他の学習サービスを既に紹介しているチームでも導入できますか？",
            answer: "はい、可能です。他のサービスとの併用も妨げません。「複数の選択肢を提示する」ことが、ご家庭の判断材料を増やすことにつながります。",
          },
          {
            question: "チーム経由の紹介として認められるタイミングは？",
            answer: "無料学習診断の申込時に、紹介きっかけ欄で「チーム紹介」を選択し、チーム名をご記入いただければ、面談時に確認のうえチーム特別価格が適用されます。",
          },
          {
            question: "保護者会での挨拶は必ず必要ですか？",
            answer: "いいえ、不要です。紹介資料（ビラ・LINE文面など）を配布いただくだけでも導入は可能です。「直接話を聞きたい」というご希望があれば、オンライン挨拶（5〜10分）で対応します。",
          },
          {
            question: "選手・保護者から Nobilva にトラブルが発生した場合は？",
            answer: "Nobilva が直接対応します。監督・コーチの皆さまに間に立っていただく必要はありません。万一、ご家庭から Nobilva への連絡がうまくいかない状況があれば、メール nobilva@nectere.jp までご一報いただければ即対応します。",
          },
        ]}
      />

      {/* 8. お問い合わせ */}
      <section id="contact" className="bg-nobilva-light py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <h2 className="bg-nobilva-main px-6 py-2 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-8">
            お問い合わせ・資料請求
          </h2>

          <ContactForm />

          <div className="mt-8 bg-white rounded-xl p-6 text-center">
            <p className="font-bold text-gray-900 text-sm mb-2">直接のご連絡も承ります</p>
            <p className="text-sm text-gray-700">
              nobilva@nectere.jp / 03-6820-9037
            </p>
            <p className="text-xs text-gray-500 mt-1">
              担当：中村龍人（ヘッドコーチ）・養田貴大（代表メンター）
            </p>
            <p className="text-xs text-gray-500 mt-1">
              平日・土日問わずご連絡いただけます。24時間以内にご返信します。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    teamName: "",
    role: "",
    email: "",
    phone: "",
    inquiryTypes: [] as string[],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const roles = ["監督", "コーチ・小頭", "父母会代表・役員", "学校関係者", "その他"];
  const inquiryOptions = [
    "チーム導入について話を聞きたい",
    "紹介資料（ビラ・LINE文面）を送ってほしい",
    "保護者会でのオンライン挨拶を依頼したい",
    "その他",
  ];

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">お問い合わせを受け付けました</h3>
        <p className="text-sm text-gray-600">24時間以内にご連絡いたします。</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase / メール送信の実装
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 space-y-5">
      {/* お名前 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      {/* 所属チーム名 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          所属チーム名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="○○リトルシニア、○○高校野球部 など"
          value={formData.teamName}
          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      {/* お役職 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          お役職 <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        >
          <option value="">選択してください</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* メールアドレス */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      {/* 電話番号 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          電話番号 <span className="text-xs text-gray-400">（任意）</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      {/* お問い合わせ内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          お問い合わせ内容 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {inquiryOptions.map((option) => (
            <label key={option} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inquiryTypes.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, inquiryTypes: [...formData.inquiryTypes, option] });
                  } else {
                    setFormData({ ...formData, inquiryTypes: formData.inquiryTypes.filter((t) => t !== option) });
                  }
                }}
                className="mt-0.5 accent-nobilva-accent"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ご要望・ご質問 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          ご要望・ご質問 <span className="text-xs text-gray-400">（任意・500字まで）</span>
        </label>
        <textarea
          maxLength={500}
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-nobilva-accent hover:bg-nobilva-accent/90 text-white font-bold py-3 px-6 rounded-full transition-colors"
      >
        お問い合わせを送信する
      </button>
    </form>
  );
}
