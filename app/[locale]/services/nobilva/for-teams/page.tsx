"use client";

import { useState } from "react";
import Link from "next/link";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { SubpageHero } from "@/components/nobilva/SubpageHero";
import { OutlineLink } from "@/components/nobilva/OutlineLink";
import { wb } from "@/lib/wb";
import { SectionHeading } from "@/components/nobilva/SectionHeading";

export default function ForTeamsPage() {
  return (
    <div className="bg-white min-h-screen">
      <SubpageHero title={wb("中高野球チーム/関係者の皆さまへ")}>
        <p className="text-sm md:text-base text-gray-600 mb-8">
          リトルシニア・ボーイズリーグ・ポニーリーグ・ヤングリーグ・中学軟式野球部・高校野球部の監督・コーチ・父母会の皆さまへ
        </p>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="font-bold text-gray-900 text-base mb-3">直接ご相談いただく場合はこちら</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <ContactInfoBlock />
          </div>
        </div>
      </SubpageHero>

      {/* 2. 監督・指導者に伝えたいこと */}
      <section id="message" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-6">監督・指導者の/皆さまへ</SectionHeading>
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
          <SectionHeading variant="compact" className="mb-6">サービス概要</SectionHeading>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm md:text-base min-w-[480px]">
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
            ].map((item) => (
              <div key={item} className="bg-gray-50 rounded-lg p-3 text-sm md:text-base text-gray-700 text-center">
                {item}
              </div>
            ))}
          </div>

          <div className="text-center">
            <OutlineLink href="/ja/services/nobilva/how-it-works">
              サービス内容の詳細はこちら
            </OutlineLink>
          </div>
        </div>
      </section>

      {/* 4. チーム特別価格 */}
      <section id="team-price" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-6">チーム特別価格</SectionHeading>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm md:text-base min-w-[400px]">
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
                  <td className="py-3 pr-4 font-medium">ミニマム</td>
                  <td className="py-3 pr-4">18,000円/月</td>
                  <td className="py-3 pr-4 font-bold text-nobilva-accent">14,000円/月</td>
                  <td className="py-3">22%</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">ベーシック</td>
                  <td className="py-3 pr-4">26,000円/月</td>
                  <td className="py-3 pr-4 font-bold text-nobilva-accent">20,000円/月</td>
                  <td className="py-3">23%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs md:text-sm text-gray-500 mb-6">
            ※ 適用条件：チームご関係者からのご紹介であることが面談時に確認されたご家庭。
          </p>

          <div className="bg-white rounded-xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">適用の流れ</h3>
              <ol className="space-y-1 text-sm md:text-base text-gray-700">
                <li>1. 監督・コーチ・父母会から保護者・選手にご紹介</li>
                <li>2. ご家庭から無料学習診断に申込（紹介きっかけ欄に「チーム紹介」と記入）</li>
                <li>3. 面談時にチーム名を確認のうえ、特別価格を適用</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 導入の流れ */}
      <section id="flow" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-8">導入の流れ</SectionHeading>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "お問い合わせ",
                who: ["チーム担当者様"],
                detail: "メール nobilva@nectere.jp または電話 03-6820-9037、またはこのページ末尾のフォームからご連絡ください。",
              },
              {
                step: 2,
                title: "オンライン面談（30分・Zoom）",
                who: ["Nobilva", "チーム担当者様"],
                detail: "チームの状況、選手数、保護者会の頻度などをヒアリングいたします。紹介方法・特別価格について個別にすり合わせを行います。",
              },
              {
                step: 3,
                title: "紹介資料の送付",
                who: ["Nobilva"],
                detail: "保護者様/選手様向けの資料を紙媒体あるいは公式LINEにてご提供します。",
              },
              {
                step: 4,
                title: "チーム内での紹介",
                who: ["チーム担当者様"],
                detail: "保護者会・LINE・印刷物などで自由にご配布いただけます。状況に応じて、保護者会等でのオンライン挨拶をさせていただく場合がございます。",
              },
              {
                step: 5,
                title: "選手・保護者からの個別申込み",
                who: ["保護者様"],
                detail: "ご家庭から Nobilva の無料学習診断に直接お申込みいただきます。紹介きっかけ欄に「チーム紹介」とご記入いただくと特別価格が適用されます。契約・料金のお支払いは Nobilva と保護者の間で直接行います。",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-5 flex gap-4 items-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-nobilva-main text-gray-900 font-bold text-base flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-base md:text-lg">{item.title}</h3>
                    {item.who.map((w) => (
                      <span key={w} className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {w}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 監督・運営側の負担 */}
      <section id="workload" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-8">監督・運営側の/負担は/ほぼゼロです</SectionHeading>

          {/* お願いすること */}
          <div className="bg-nobilva-light rounded-2xl p-8 md:p-10 mb-6">
            <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              お願いするのは「ご紹介」だけです
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Nobilva の資料や説明文を、チームの保護者の皆さまにお送りいただくだけで結構です。
              すべて Nobilva が直接ご家庭とやり取りいたします。
            </p>
          </div>

          {/* 不要なこと */}
          <p className="text-sm md:text-base font-medium text-gray-500 mb-3">以下はすべて不要です</p>
          <div className="flex flex-wrap gap-2">
            {[
              "契約手続き",
              "料金徴収",
              "学習指導",
              "進路相談",
              "トラブル対応",
              "解約手続き",
              "個人情報の管理",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 rounded-full px-4 py-1.5 line-through decoration-gray-400">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <SubpageFAQ
        heading="チーム導入に関する/よくあるご質問"
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
      <section id="contact" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading variant="compact" className="mb-8">お問い合わせ・/資料請求</SectionHeading>

          <ContactForm />

          <div className="mt-8 bg-white rounded-xl p-6 text-center">
            <p className="font-bold text-gray-900 text-base mb-3">直接のご連絡も承ります</p>
            <ContactInfoBlock className="justify-center" />
            <p className="text-xs md:text-sm text-gray-500 mt-2">
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

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
          <svg className="w-6 h-6 text-green-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    setSubmitting(true);
    setError(false);

    const messageParts = [
      `【チーム導入お問い合わせ】`,
      `チーム名: ${formData.teamName}`,
      `役職: ${formData.role}`,
      `お問い合わせ内容: ${formData.inquiryTypes.join("、")}`,
      formData.message ? `\nご要望・ご質問:\n${formData.message}` : "",
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.teamName,
          phone: formData.phone || undefined,
          inquiryType: "nobilva",
          message: messageParts,
          privacy: true,
          locale: "ja",
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          送信に失敗しました。時間をおいて再度お試しいただくか、メール・お電話でご連絡ください。
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-nobilva-accent hover:bg-nobilva-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-colors"
      >
        {submitting ? "送信中..." : "お問い合わせを送信する"}
      </button>
    </form>
  );
}

function ContactInfoBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`.trim()}>
      <a href="mailto:nobilva@nectere.jp" className="inline-flex items-center gap-2 text-base font-medium text-gray-900 hover:text-nobilva-accent transition-colors">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        nobilva@nectere.jp
      </a>
      <a href="tel:03-6820-9037" className="inline-flex items-center gap-2 text-base font-medium text-gray-900 hover:text-nobilva-accent transition-colors">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        03-6820-9037
      </a>
      <span className="text-xs md:text-sm text-gray-500">担当：養田貴大（代表）</span>
    </div>
  );
}
