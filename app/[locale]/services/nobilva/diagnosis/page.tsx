"use client";

import { useState } from "react";
import Link from "next/link";

const GRADE_OPTIONS = [
  "小学6年生（中学進学準備）",
  "中学1年生",
  "中学2年生",
  "中学3年生",
  "高校1年生",
  "高校2年生",
  "高校3年生",
  "高校卒業（浪人中）",
];

const CLUB_OPTIONS = [
  "中学硬式（リトルシニア）",
  "中学硬式（ボーイズリーグ）",
  "中学硬式（ポニーリーグ）",
  "中学硬式（ヤングリーグ）",
  "中学軟式（部活）",
  "高校野球部",
  "高校卒業（受験中）",
  "その他のスポーツ",
  "部活には所属していない",
];

const CONCERN_OPTIONS = [
  "練習で疲れて、勉強する時間・体力がない",
  "遠征・大会で授業を欠席し、追いつけない",
  "内申点が思うように上がらない",
  "スポーツ推薦と一般進学、両方の選択肢を残したい",
  "計画を立てても続かない",
  "塾に通う時間と体力がない",
];

const CAREER_OPTIONS = [
  "スポーツ推薦を中心に考えている",
  "一般進学を中心に考えている",
  "両方の選択肢を残したい",
  "まだ決まっていない",
];

const SOURCE_OPTIONS = [
  "チームの紹介（リトルシニア・ボーイズ等）",
  "保護者会・チラシ",
  "Google検索",
  "Instagram",
  "お知り合いの紹介",
  "その他",
];

type Step = "form" | "schedule" | "confirm" | "complete";

interface FormData {
  name: string;
  email: string;
  phone: string;
  grade: string;
  club: string;
  concerns: string[];
  concernOther: string;
  careerDirection: string;
  source: string;
  scheduleSlots: string[];
  scheduleCustom: string;
  noSlotAvailable: boolean;
}

export default function DiagnosisPage() {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    grade: "",
    club: "",
    concerns: [],
    concernOther: "",
    careerDirection: "",
    source: "",
    scheduleSlots: [],
    scheduleCustom: "",
    noSlotAvailable: false,
  });

  const stepIndex = step === "form" ? 0 : step === "schedule" ? 1 : step === "confirm" ? 2 : 3;

  if (step === "complete") {
    return <CompletionScreen />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ヒーロー */}
      <section className="bg-white pt-32 md:pt-40 pb-8 md:pb-12">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          <div className="mb-4">
            <Link
              href="/ja/services/nobilva"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Nobilva トップに戻る
            </Link>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            無料学習診断
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">
            30分のオンライン面談で、ご家庭に合った学習プランを具体的にお持ち帰りいただけます。
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center bg-nobilva-main text-gray-900 font-bold text-xs px-3 py-1.5 rounded-full">
              月20名限定
            </span>
            <span className="inline-flex items-center bg-gray-100 text-gray-800 font-bold text-xs px-3 py-1.5 rounded-full">
              完全無料
            </span>
            <span className="inline-flex items-center bg-gray-100 text-gray-800 font-bold text-xs px-3 py-1.5 rounded-full">
              LINE登録不要
            </span>
          </div>

          {/* ステップインジケーター */}
          <div className="flex items-center gap-2 mb-6">
            {["アンケート", "日程選択", "確認・送信"].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    i <= stepIndex
                      ? "bg-nobilva-accent text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs ${
                    i <= stepIndex ? "text-gray-900 font-medium" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div className="flex-1 h-px bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 期待値セクション（フォームステップのみ） */}
      {step === "form" && (
        <section className="pb-8 md:pb-12">
          <div className="max-w-2xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3">起きること</h3>
                <ul className="space-y-2 text-xs text-gray-700">
                  {[
                    "30分のオンライン面談（Zoom）",
                    "学習状況・部活スケジュールのヒアリング",
                    "具体的な学習プラン提案",
                    "「合う／合わない」を率直にお伝え",
                    "ご質問への回答",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-600 flex-shrink-0">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3">起きないこと</h3>
                <ul className="space-y-2 text-xs text-gray-700">
                  {[
                    "LINE登録の要求",
                    "当日その場での申込み強要",
                    "後日のしつこい電話・営業",
                    "教材販売・別商品の案内",
                    "個人情報の他社共有",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gray-400 flex-shrink-0">&#10005;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              「判断材料をお持ち帰りいただく場」として運用しています。その場で決める必要はありません。
            </p>
          </div>
        </section>
      )}

      {/* フォーム本体 */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          {step === "form" && (
            <FormStep formData={formData} setFormData={setFormData} onNext={() => setStep("schedule")} />
          )}
          {step === "schedule" && (
            <ScheduleStep formData={formData} setFormData={setFormData} onNext={() => setStep("confirm")} onBack={() => setStep("form")} />
          )}
          {step === "confirm" && (
            <ConfirmStep formData={formData} onSubmit={() => setStep("complete")} onBack={() => setStep("schedule")} />
          )}
        </div>
      </section>

      {/* FAQ（フォームステップのみ） */}
      {step === "form" && (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-12">
            <h2 className="text-lg font-bold text-gray-900 mb-6">よくあるご質問</h2>
            <DiagnosisFAQ />
          </div>
        </section>
      )}
    </div>
  );
}

function FormStep({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const isValid = formData.name && formData.email && formData.grade && formData.club;

  return (
    <div className="space-y-6">
      {/* Q1: お名前 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          お申し込みされる方のお名前 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">保護者の方・生徒ご本人、どちらでも構いません。</p>
        <input
          type="text"
          required
          placeholder="山田 花子"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      {/* Q2: メールアドレス */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">面談日時の確定とZoom URLをこちらにお送りします。</p>
        <input
          type="email"
          required
          placeholder="example@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      {/* Q3: 電話番号 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          電話番号 <span className="text-xs text-gray-400">（任意）</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">万一メールが届かない場合の連絡用です。営業電話には使用しません。</p>
        <input
          type="tel"
          placeholder="090-1234-5678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        />
      </div>

      {/* Q4: 生徒の学年 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          生徒の学年 <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.grade}
          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        >
          <option value="">選択してください</option>
          {GRADE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Q5: 野球の現在の所属 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          野球の現在の所属 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">「その他のスポーツ」を選んでもサービス対象です。</p>
        <div className="space-y-2">
          {CLUB_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="club"
                value={opt}
                checked={formData.club === opt}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                className="accent-nobilva-accent"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Q6: お悩み・ご状況 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          現在のお悩み・ご状況 <span className="text-xs text-gray-400">（任意・複数選択可）</span>
        </label>
        <div className="space-y-2 mb-3">
          {CONCERN_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.concerns.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, concerns: [...formData.concerns, opt] });
                  } else {
                    setFormData({ ...formData, concerns: formData.concerns.filter((c) => c !== opt) });
                  }
                }}
                className="mt-0.5 accent-nobilva-accent"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
        <textarea
          placeholder="その他のお悩みやご状況があればご記入ください（300字まで）"
          maxLength={300}
          rows={3}
          value={formData.concernOther}
          onChange={(e) => setFormData({ ...formData, concernOther: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent resize-none"
        />
      </div>

      {/* Q7: 志望進路 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          志望進路の方向性 <span className="text-xs text-gray-400">（任意）</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">現段階での方向性で大丈夫です。</p>
        <select
          value={formData.careerDirection}
          onChange={(e) => setFormData({ ...formData, careerDirection: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        >
          <option value="">選択してください</option>
          {CAREER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Q8: きっかけ */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Nobilva を知ったきっかけ <span className="text-xs text-gray-400">（任意）</span>
        </label>
        <select
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent"
        >
          <option value="">選択してください</option>
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className={`w-full font-bold py-3 px-6 rounded-full transition-colors ${
          isValid
            ? "bg-nobilva-accent hover:bg-nobilva-accent/90 text-white"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        次へ：日程候補を選ぶ
      </button>
    </div>
  );
}

function ScheduleStep({
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}) {
  // Generate dummy schedule slots for the next 14 days
  const slots = generateDummySlots();
  const isValid = formData.noSlotAvailable
    ? formData.scheduleCustom.length > 0
    : formData.scheduleSlots.length >= 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          面談の希望日時を、3つお選びください。
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          平日 18:00〜22:00 / 土日 9:00〜21:00 の30分枠から選択できます。
        </p>
        <p className="text-sm text-gray-600">
          24時間以内に、いずれかで日時を確定したメールをお送りします。
        </p>
      </div>

      {!formData.noSlotAvailable && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {slots.map((slot) => {
            const isSelected = formData.scheduleSlots.includes(slot);
            const isMaxed = formData.scheduleSlots.length >= 3 && !isSelected;
            return (
              <button
                key={slot}
                onClick={() => {
                  if (isSelected) {
                    setFormData({
                      ...formData,
                      scheduleSlots: formData.scheduleSlots.filter((s) => s !== slot),
                    });
                  } else if (!isMaxed) {
                    setFormData({
                      ...formData,
                      scheduleSlots: [...formData.scheduleSlots, slot],
                    });
                  }
                }}
                disabled={isMaxed}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  isSelected
                    ? "border-nobilva-accent bg-nobilva-accent/10 text-gray-900 font-medium"
                    : isMaxed
                      ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 bg-white text-gray-700 hover:border-nobilva-main"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.noSlotAvailable}
          onChange={(e) => {
            setFormData({
              ...formData,
              noSlotAvailable: e.target.checked,
              scheduleSlots: e.target.checked ? [] : formData.scheduleSlots,
            });
          }}
          className="mt-0.5 accent-nobilva-accent"
        />
        <span className="text-sm text-gray-700">上記の候補に都合の良い日時がない</span>
      </label>

      {formData.noSlotAvailable && (
        <textarea
          placeholder="ご希望の時間帯をお知らせください（例：土曜の午前中希望）"
          rows={3}
          value={formData.scheduleCustom}
          onChange={(e) => setFormData({ ...formData, scheduleCustom: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent resize-none"
        />
      )}

      {formData.scheduleSlots.length > 0 && (
        <p className="text-sm text-nobilva-accent font-medium">
          {formData.scheduleSlots.length}/3 枠選択中
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-full transition-colors"
        >
          戻る
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`flex-1 font-bold py-3 px-6 rounded-full transition-colors ${
            isValid
              ? "bg-nobilva-accent hover:bg-nobilva-accent/90 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          次へ：確認
        </button>
      </div>
    </div>
  );
}

function ConfirmStep({
  formData,
  onSubmit,
  onBack,
}: {
  formData: FormData;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    // TODO: Supabase保存 + メール送信
    await new Promise((r) => setTimeout(r, 1000));
    onSubmit();
  };

  const items = [
    { label: "お名前", value: formData.name },
    { label: "メールアドレス", value: formData.email },
    { label: "電話番号", value: formData.phone || "未入力" },
    { label: "生徒の学年", value: formData.grade },
    { label: "野球の所属", value: formData.club },
    {
      label: "お悩み・ご状況",
      value: [...formData.concerns, formData.concernOther].filter(Boolean).join("、") || "未入力",
    },
    { label: "志望進路", value: formData.careerDirection || "未入力" },
    { label: "きっかけ", value: formData.source || "未入力" },
    {
      label: "希望日時",
      value: formData.noSlotAvailable
        ? `候補なし: ${formData.scheduleCustom}`
        : formData.scheduleSlots.join(" / "),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">入力内容のご確認</h2>

      <div className="bg-gray-50 rounded-xl p-5 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col sm:flex-row sm:gap-4">
            <span className="text-xs font-bold text-gray-500 sm:w-28 flex-shrink-0">{item.label}</span>
            <span className="text-sm text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-nobilva-accent"
        />
        <span className="text-xs text-gray-700">
          <strong>プライバシーポリシーに同意します</strong>
          <br />
          ご入力いただいた情報は、無料学習診断の実施・運営連絡・サービス改善の目的でのみ使用します。第三者には提供しません。
        </span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-full transition-colors"
        >
          戻る
        </button>
        <button
          onClick={handleSubmit}
          disabled={!agreed || submitting}
          className={`flex-1 font-bold py-3 px-6 rounded-full transition-colors ${
            agreed && !submitting
              ? "bg-nobilva-accent hover:bg-nobilva-accent/90 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "送信中..." : "無料学習診断を申し込む"}
        </button>
      </div>
    </div>
  );
}

function CompletionScreen() {
  return (
    <div className="bg-white min-h-screen">
      <section className="pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            お申込みを受け付けました。
          </h1>
          <p className="text-lg text-gray-900 mb-8">ありがとうございます。</p>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8">
            ご入力いただいた内容を確認し、<strong>24時間以内に面談日時の確定とZoom URLをメール</strong>でお送りします。
          </p>

          <div className="space-y-4 text-left max-w-md mx-auto">
            {[
              {
                icon: "1",
                title: "確認メールが届きます（数分以内）",
                detail: "ご入力内容の控えをお送りします。届かない場合は迷惑メールフォルダもご確認ください。",
              },
              {
                icon: "2",
                title: "日時確定メールが届きます（24時間以内）",
                detail: "ご希望候補から1つを確定し、面談用のZoom URLとともにお送りします。",
              },
              {
                icon: "3",
                title: "当日の面談（30分・Zoom）",
                detail: "リラックスしてご参加ください。事前準備は不要です。保護者の方・生徒ご本人、どちらでもご参加いただけます。",
              },
            ].map((step) => (
              <div key={step.icon} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main text-gray-900 font-bold text-sm flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/ja/services/nobilva"
              className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm"
            >
              Nobilva トップに戻る
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function DiagnosisFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      q: "本当に無料ですか？追加料金や教材販売はありませんか？",
      a: "はい、完全に無料です。30分の面談のみで完結し、教材販売や別商品のご案内も行いません。",
    },
    {
      q: "当日その場で申込みを決めないといけませんか？",
      a: "いいえ。診断後にゆっくりご検討いただけます。後日メールでご返事いただければ十分です。",
    },
    {
      q: "子どもは同席すべきですか？",
      a: "どちらでも構いません。保護者の方だけでも、お子さんとご一緒でも、お子さんお一人でも対応可能です。",
    },
    {
      q: "野球以外のスポーツでも申し込めますか？",
      a: "はい。野球以外のスポーツや部活動と勉強の両立に取り組まれている方も歓迎しています。フォームの「その他のスポーツ」を選択してください。",
    },
    {
      q: "兄弟2人で申し込みたいのですが、可能ですか？",
      a: "可能です。お一人ずつフォームを送信していただくと、ご都合の良い日時をまとめてご提案します。備考欄に「兄弟同時申込み」とご記入いただけるとスムーズです。",
    },
  ];

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span className="text-sm font-black text-nobilva-main flex-shrink-0">Q</span>
              <span className="flex-1 text-sm font-medium text-gray-900">{faq.q}</span>
              <svg
                className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[300px]" : "max-h-0"}`}>
              <div className="px-4 pb-4 pl-10">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function generateDummySlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  for (let d = 1; d <= 14; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() + d);
    const dayOfWeek = date.getDay();
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}（${dayNames[dayOfWeek]}）`;

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const startHour = isWeekend ? 9 : 18;
    const endHour = isWeekend ? 21 : 22;

    for (let h = startHour; h < endHour; h++) {
      slots.push(`${dateStr} ${h}:00-${h}:30`);
      if (h < endHour - 1 || isWeekend) {
        slots.push(`${dateStr} ${h}:30-${h + 1}:00`);
      }
    }
  }

  return slots;
}
