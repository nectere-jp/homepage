"use client";

import { useState } from "react";
import Image from "next/image";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { SubpageHero } from "@/components/nobilva/SubpageHero";
import { SectionHeading } from "@/components/nobilva/SectionHeading";
import { Section } from "@/components/nobilva/Section";
import { EmpathySection } from "@/components/nobilva/EmpathySection";
import { ThreePillarsSection } from "@/components/nobilva/ThreePillarsSection";
import { ConcernsSection } from "@/components/nobilva/ConcernsSection";
import { PricingSection, ESSENTIAL_PRICE } from "@/components/nobilva/PricingSection";
import { wb } from "@/lib/wb";

const TEAM_DISCOUNT = 2000;

export default function ForTeamsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. ヒーロー (PDF p1) */}
      <SubpageHero variant="highlight" title="関係者の皆さまへ">
        <div className="mt-4 space-y-6">
          <div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
              {wb("本気で野球に取り組む中学生の/")}
              <span className="inline-block bg-white px-2 py-0.5 mr-1">野球</span>
              と
              <span className="inline-block bg-white px-2 py-0.5 mx-1">勉強</span>
              の両立を
              <br className="hidden md:block" />
              サポートします
            </p>
          </div>

          <div className="bg-nobilva-accent/90 rounded-xl p-5 md:p-6 text-white">
            <p className="text-lg md:text-xl font-black mb-1">
              モニターチーム募集中！
            </p>
            <p className="text-sm md:text-base leading-relaxed">
              チームを通じて Nobilva をご紹介いただけるモニターチームを募集しています。選手は初月無料・特別価格の対象に。モデルケースとしてホームページ等でご紹介させていただく場合がありますが、選手個人の情報を同意なく掲載することはありません。
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="font-bold text-gray-900 text-base mb-3">
              直接ご相談いただく場合はこちら
            </p>
            <ContactInfoBlock />
          </div>
        </div>
      </SubpageHero>

      {/* 2. オール3死守 (PDF p2) — トップ流用 */}
      <EmpathySection />

      {/* 3. 3つの仕組み (PDF p3) — トップ流用 */}
      <ThreePillarsSection />

      {/* 4. 3つの指針 (PDF p4) */}
      <ThreeGuidelinesSection />

      {/* 5. 保護者の悩み (PDF p6) — トップ流用 + アピールCTA */}
      <ConcernsSection />
      <section className="bg-white pb-16 md:pb-20 -mt-8 md:-mt-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center">
          <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-snug">
            <Image
              src="/images/logo_nobilva.png"
              alt="Nobilva"
              width={180}
              height={44}
              className="inline-block h-7 md:h-9 w-auto align-middle mr-1"
            />
            のご紹介が
            <br className="md:hidden" />
            ご家庭への
            <span className="bg-nobilva-main px-2 py-0.5">大きなアピール</span>
            に！
          </p>
        </div>
      </section>

      {/* 6. 料金プラン (PDF p5) — トップ流用 (team価格) */}
      <PricingSection
        team={{
          essentialSpecial: ESSENTIAL_PRICE - TEAM_DISCOUNT,
        }}
      />

      {/* 事務局負担ゼロ + モニターチーム特典 */}
      <MonitorTeamBenefitSection />

      {/* 7. 導入の流れ */}
      <IntroductionFlowSection />

      {/* 8. FAQ (PDF p7) */}
      <SubpageFAQ
        heading="よくある/ご質問"
        headingAlign="center"
        items={[
          {
            question: "チーム事務局に負担はありますか？",
            answer:
              "契約は各ご家庭と Nobilva の個別契約のため、チーム様がお支払いや事務手続きを行うことはありません。お願いするのは、選手のみなさまへのご案内のみです。",
          },
          {
            question: "なぜ「オール3」なのですか？",
            answer:
              "内申点は、野球推薦・指定校推薦では出願基準として、一般入試では調査書点として、どの受験方式でも合否に関わる数字です。多くの高校でオール3がその最低ラインにあたり、学校によってはさらに高い基準が求められます。まずこのラインを下回らないことが、進路の選択肢を残すための土台になると考えています。",
          },
          {
            question: "チームにどんなメリットがありますか？",
            answer:
              "「野球も勉強も応援するチーム」という姿勢を、具体的なかたちでご家庭に示せます。学業への不安を理由にした退部・活動セーブを防ぎやすくなるほか、入団を検討中のご家庭への説明材料としてもご活用いただけます。",
          },
          {
            question: "野球の指導や活動への影響は？",
            answer:
              "ありません。Nobilva が関わるのは学習面のみで、野球の指導方針には一切介入しません。学習計画は練習・試合・遠征のスケジュールを最優先に組むため、チーム活動と競合しない設計です。",
          },
          {
            question: "どんな人がメンターをしていますか？",
            answer:
              "指導経験豊富な予備校講師が、計画作成から週1回の面談、毎日の進捗確認まで直接担当します。学力だけでなく、中学生に寄り添い、本人が自分で続けられる習慣づくりを重視しています。",
          },
          {
            question: "契約形態はどうなっていますか？",
            answer:
              "各選手のご家庭に、チーム限定価格にて Nobilva と直接ご契約いただきます。チーム様との契約は発生しません。モニターチーム様の選手は全員、初月無料・翌学期末まで月額3,000円引きが適用されます。",
          },
        ]}
      />

      {/* 9. 代表挨拶 (PDF p8) */}
      <RepresentativeSection />

      {/* 10. お問い合わせ */}
      <section id="contact" className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <SectionHeading center className="mb-8">お問い合わせ・/資料請求</SectionHeading>

          <ContactForm />

          <div className="mt-8 bg-white rounded-xl p-6 text-center">
            <p className="font-bold text-gray-900 text-base mb-3">
              直接のご連絡も承ります
            </p>
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

/* --------------------------------------------------------------
 * 3つの指針 (PDF page 4)
 * -------------------------------------------------------------- */
function ThreeGuidelinesSection() {
  const guidelines = [
    {
      title: "学校の時間を\n最大限に活かす。",
      body: "学校の授業／宿題／小テストを最大限活用する計画を立てます。塾のように「別の教材をやる」のではなく、学校の勉強を中心に据え、時間を有効活用しつつ成績に直結する学習を実現します。",
      icon: "📖",
    },
    {
      title: "ご家庭との\n役割分担を明確化",
      body: "計画作成・進捗管理・振り返りは全てメンターが担当。ご家庭にお願いするのは「学習環境の確保」と「スケジュール共有」だけ。共働きや送迎などで忙しいご家庭でも無理なく続けられます。",
      icon: "🏠",
    },
    {
      title: "強制ではなく\n習慣づくり",
      body: "「やらされる勉強」ではなく「自分で決めた計画をこなす」感覚を育てます。できなかった日も責めず、週1回の面談で理由を一緒に整理。数ヶ月かけて、その子に合ったリズムが育っていきます。",
      icon: "🗓️",
    },
  ];

  return (
    <Section bg="white">
      <SectionHeading center className="mb-10 md:mb-12">
        さらに.../成長を続けるための/3つの指針
      </SectionHeading>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {guidelines.map((g, i) => (
          <div
            key={i}
            className="bg-nobilva-light rounded-2xl p-6 md:p-8 flex flex-col"
          >
            <div className="text-4xl md:text-5xl mb-4" aria-hidden="true">
              {g.icon}
            </div>
            <h3 className="text-lg md:text-xl font-black text-gray-900 leading-snug whitespace-pre-line mb-4">
              {g.title}
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {g.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * 事務局負担ゼロ + モニターチーム特典
 * -------------------------------------------------------------- */
function MonitorTeamBenefitSection() {
  return (
    <section className="bg-white pb-16 md:pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        {/* 事務局負担ゼロ */}
        <p className="text-center text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-10 md:mb-12">
          契約は各ご家庭ごと個別なので
          <span className="text-nobilva-accent">事務局負担ゼロ</span>
        </p>

        {/* モニターチーム特典バナー */}
        <div className="bg-nobilva-accent text-white rounded-2xl p-6 md:p-10 text-center">
          <p className="inline-block bg-white text-nobilva-accent text-sm md:text-base font-black px-3 py-1 rounded mb-4">
            モニターチーム様限定
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
            初月無料 &amp; 翌学期末まで
            <br className="md:hidden" />
            月額3,000円引き！
          </p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------
 * 導入の流れ
 * -------------------------------------------------------------- */
function IntroductionFlowSection() {
  const steps = [
    {
      step: 1,
      title: "お問い合わせ",
      who: ["チーム担当者様"],
      detail:
        "メール nobilva@nectere.jp または電話 03-6820-9037、またはこのページ末尾のフォームからご連絡ください。",
    },
    {
      step: 2,
      title: "オンライン面談（30分）",
      who: ["Nobilva", "チーム担当者様"],
      detail:
        "チームの状況、選手数、保護者会の頻度などをヒアリングいたします。紹介方法・特別価格について個別にすり合わせを行います。",
    },
    {
      step: 3,
      title: "紹介資料の送付",
      who: ["Nobilva"],
      detail:
        "保護者様/選手様向けの資料を紙媒体あるいは公式LINEにてご提供します。",
    },
    {
      step: 4,
      title: "チーム内での紹介",
      who: ["チーム担当者様"],
      detail:
        "保護者会・LINE・印刷物などで自由にご配布いただけます。状況に応じて、保護者会等でのオンライン挨拶をさせていただく場合がございます。",
    },
    {
      step: 5,
      title: "選手・保護者からの個別申込み",
      who: ["保護者様"],
      detail:
        "ご家庭から Nobilva の無料学習相談に直接お申込みいただきます。紹介きっかけ欄に「チーム紹介」とご記入いただくと特別価格が適用されます。契約・料金のお支払いは Nobilva と保護者の間で直接行います。",
    },
  ];

  return (
    <Section bg="light">
      <SectionHeading center className="mb-10 md:mb-12">
        導入の流れ
      </SectionHeading>

      <div className="max-w-4xl mx-auto space-y-4">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-white rounded-xl p-5 flex gap-4 items-start"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-nobilva-main text-gray-900 font-bold text-base flex items-center justify-center">
              {item.step}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-base md:text-lg">
                  {item.title}
                </h3>
                {item.who.map((w) => (
                  <span
                    key={w}
                    className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {w}
                  </span>
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * 代表挨拶 (PDF page 8)
 * -------------------------------------------------------------- */
function RepresentativeSection() {
  return (
    <Section bg="light">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-10 items-start">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-nobilva-light overflow-hidden flex items-center justify-center">
              {/* 代表画像プレースホルダー */}
              <span className="text-nobilva-accent text-xs">代表写真</span>
            </div>
            <div className="text-center mt-3">
              <p className="text-xs text-nobilva-accent font-bold">代表</p>
              <p className="font-black text-gray-900 text-lg">養田 貴大</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              はじめまして、Nobilva 代表の養田貴大です。東京で学習塾を二校舎経営し、多くの中高生の指導や進路の相談に携わってきました。
            </p>
            <p>
              弟がリトルシニアで野球に打ち込んでいたこともあり、練習と勉強の両立の大変さは家族として間近で見てきました。その経験から生まれたのが Nobilva です。
            </p>
            <p>
              選手一人ひとりの進路を一緒に守るパートナーとして、お気軽にお声がけください。
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------
 * お問い合わせフォーム / 連絡先ブロック
 * -------------------------------------------------------------- */
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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 space-y-5 border border-gray-200">
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
