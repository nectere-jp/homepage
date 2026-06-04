"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/nobilva/Icons";
import { SubpageFAQ } from "@/components/nobilva/SubpageFAQ";
import { trackNobilvaEvent } from "@/components/analytics/NobilvaTracker";
import { getAttribution } from "@/lib/analytics/session";

const STORAGE_KEY = "nobilva-diagnosis";

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
  "中学硬式クラブチーム（リトルシニア・ボーイズ等）",
  "中学軟式（部活）",
  "中学軟式（クラブチーム）",
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

const CAREER_OPTIONS_MIDDLE = [
  "スポーツ推薦（私立高校中心）",
  "推薦入試（単願・併願）",
  "一般入試",
  "まだ決まっていない",
];

const CAREER_OPTIONS_HIGH = [
  "スポーツ推薦",
  "指定校推薦・公募推薦",
  "総合型選抜（旧AO入試）",
  "一般入試",
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

const diagnosisFAQs = [
  {
    question: "本当に無料ですか？追加料金や教材販売はありませんか？",
    answer:
      "はい、完全に無料です。30分の面談のみで完結し、教材販売や別商品のご案内も行いません。",
  },
  {
    question: "当日その場で申込みを決めないといけませんか？",
    answer:
      "いいえ。診断後にゆっくりご検討いただけます。後日メールでご返事いただければ十分です。",
  },
  {
    question: "子どもは同席すべきですか？",
    answer:
      "どちらでも構いません。保護者の方だけでも、お子さんとご一緒でも、お子さんお一人でも対応可能です。",
  },
  {
    question: "野球以外のスポーツでも申し込めますか？",
    answer:
      "はい。野球以外のスポーツや部活動と勉強の両立に取り組まれている方も歓迎しています。フォームの「その他のスポーツ」を選択してください。",
  },
  {
    question: "兄弟2人で申し込みたいのですが、可能ですか？",
    answer:
      "可能です。お一人ずつフォームを送信していただくと、ご都合の良い日時をまとめてご提案します。備考欄に「兄弟同時申込み」とご記入いただけるとスムーズです。",
  },
];

const STEPS = [
  "intro",
  "basics",
  "student",
  "concerns",
  "career",
  "source",
  "schedule",
  "confirm",
] as const;
type SlideStep = (typeof STEPS)[number] | "complete";

interface DiagnosisFormData {
  name: string;
  email: string;
  grade: string;
  club: string;
  concerns: string[];
  concernOther: string;
  careerDirections: string[];
  sources: string[];
  scheduleSlots: string[];
  scheduleCustom: string;
  noSlotAvailable: boolean;
}

const initialFormData: DiagnosisFormData = {
  name: "",
  email: "",
  grade: "",
  club: "",
  concerns: [],
  concernOther: "",
  careerDirections: [],
  sources: [],
  scheduleSlots: [],
  scheduleCustom: "",
  noSlotAvailable: false,
};

function isStepValid(step: SlideStep, fd: DiagnosisFormData): boolean {
  switch (step) {
    case "intro":
      return true;
    case "basics":
      return (
        fd.name.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email)
      );
    case "student":
      return fd.grade !== "" && fd.club !== "";
    case "concerns":
      return true;
    case "career":
      return true;
    case "source":
      return true;
    case "schedule":
      return fd.noSlotAvailable
        ? fd.scheduleCustom.trim().length > 0
        : fd.scheduleSlots.length >= 1;
    case "confirm":
      return true;
    default:
      return true;
  }
}

export default function DiagnosisPage() {
  const searchParams = useSearchParams();
  const teamSlug = searchParams.get("team") || "";
  const [step, setStep] = useState<SlideStep>("intro");
  const [formData, setFormData] = useState<DiagnosisFormData>(initialFormData);
  const [loaded, setLoaded] = useState(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData)
          setFormData({ ...initialFormData, ...parsed.formData });
        if (parsed.step && parsed.step !== "complete") setStep(parsed.step);
      }
    } catch {
      /* noop */
    }
    setLoaded(true);
  }, []);

  // Persist to sessionStorage on every change
  useEffect(() => {
    if (!loaded) return;
    if (step === "complete") {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
    } catch {
      /* noop */
    }
  }, [step, formData, loaded]);

  // ステップ遷移トラッキング
  useEffect(() => {
    if (!loaded) return;
    if (step === "intro") {
      trackNobilvaEvent("diagnosis_start");
    } else if (step !== "complete") {
      trackNobilvaEvent("diagnosis_step", { diagnosisStep: step });
    }
  }, [step, loaded]);

  if (!loaded) return <div className="h-[100dvh] bg-white" />;
  if (step === "complete") return <CompletionScreen />;

  const stepIndex = STEPS.indexOf(step as (typeof STEPS)[number]);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white pt-20 md:pt-24">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-6 py-8 md:py-12">
          {step === "intro" && <IntroSlide />}
          {step === "basics" && (
            <BasicsSlide formData={formData} setFormData={setFormData} />
          )}
          {step === "student" && (
            <StudentSlide formData={formData} setFormData={setFormData} />
          )}
          {step === "concerns" && (
            <ConcernsSlide formData={formData} setFormData={setFormData} />
          )}
          {step === "career" && (
            <CareerSlide formData={formData} setFormData={setFormData} />
          )}
          {step === "source" && (
            <SourceSlide formData={formData} setFormData={setFormData} />
          )}
          {step === "schedule" && (
            <ScheduleSlide formData={formData} setFormData={setFormData} />
          )}
          {step === "confirm" && (
            <ConfirmSlide
              formData={formData}
              teamSlug={teamSlug}
              onSubmit={() => setStep("complete")}
              onBack={goBack}
            />
          )}
        </div>
      </div>

      {/* Bottom bar */}
      {step !== "confirm" && (
        <div
          className="flex-shrink-0 border-t border-gray-100 px-6 pt-4 pb-4"
          style={{
            paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
          }}
        >
          <div className="max-w-lg mx-auto w-full flex gap-3">
            {step !== "intro" && (
              <button
                onClick={goBack}
                className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-full transition-colors"
              >
                戻る
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!isStepValid(step, formData)}
              className={`flex-1 font-bold py-3 px-6 rounded-full transition-colors ${
                isStepValid(step, formData)
                  ? "bg-nobilva-accent hover:bg-nobilva-accent/90 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {step === "intro" ? "無料学習相談に申し込む" : "次へ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Slide Components ─── */

interface SlideProps {
  formData: DiagnosisFormData;
  setFormData: React.Dispatch<React.SetStateAction<DiagnosisFormData>>;
}

const inputClass =
  "w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-nobilva-main focus:border-transparent";

function IntroSlide() {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        無料学習相談申し込み
      </h1>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
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

      <div className="bg-gray-50 rounded-xl p-6 text-left w-full mb-8">
        <ul className="space-y-3 text-sm md:text-base text-gray-700">
          {[
            "30分のオンライン面談（Zoom）を行います",
            "学習状況・部活スケジュールをお聞きします",
            "具体的な学習プランをご提案します",
            "「合う／合わない」を率直にお伝えします",
            "ご質問にお答えします",
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-nobilva-accent flex-shrink-0">-</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-200 pt-3 mt-4 space-y-1 text-xs text-gray-500">
          <p>※ その場での申込みは求めません</p>
          <p>※ 後日のしつこい電話・営業は行いません</p>
          <p>※ 教材販売・別商品の案内はありません</p>
        </div>
      </div>

      <div className="w-full text-left">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          よくあるご質問
        </h2>
        <SubpageFAQ
          bare
          items={diagnosisFAQs}
        />
      </div>

      <div className="mt-8 w-full text-center">
        <Link
          href="/ja/contact"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nobilva-accent transition-colors"
        >
          その他のお問い合わせはこちら
          <ChevronRightIcon size="xs" />
        </Link>
      </div>
    </div>
  );
}

function BasicsSlide({ formData, setFormData }: SlideProps) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
        基本情報
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        保護者の方・生徒ご本人、どちらでも構いません。
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="山田 花子"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            面談日時の確定とZoom URLをこちらにお送りします。
          </p>
          <input
            type="email"
            required
            placeholder="example@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

function StudentSlide({ formData, setFormData }: SlideProps) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">
        生徒について
      </h2>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            学年 <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.grade}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, grade: e.target.value }))
            }
            className={inputClass}
          >
            <option value="">選択してください</option>
            {GRADE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            野球の現在の所属 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            「その他のスポーツ」を選んでもサービス対象です。
          </p>
          <select
            required
            value={formData.club}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, club: e.target.value }))
            }
            className={inputClass}
          >
            <option value="">選択してください</option>
            {CLUB_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-1">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-start gap-3 cursor-pointer py-2"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, opt]);
              } else {
                onChange(selected.filter((v) => v !== opt));
              }
            }}
            className="mt-0.5 w-5 h-5 accent-nobilva-accent flex-shrink-0"
          />
          <span className="text-sm md:text-base text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ConcernsSlide({ formData, setFormData }: SlideProps) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
        現在のお悩み・ご状況
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        任意・複数選択可です。事前にお聞かせいただけると、面談がスムーズになります。
      </p>

      <CheckboxGroup
        options={CONCERN_OPTIONS}
        selected={formData.concerns}
        onChange={(next) => setFormData((prev) => ({ ...prev, concerns: next }))}
      />
      <textarea
        placeholder="その他のお悩みがあればご記入ください"
        maxLength={300}
        rows={2}
        value={formData.concernOther}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            concernOther: e.target.value,
          }))
        }
        className={`mt-3 ${inputClass} resize-none`}
      />
    </div>
  );
}

function CareerSlide({ formData, setFormData }: SlideProps) {
  const middle = isMiddleSchool(formData.grade);
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
        {middle
          ? "検討している高校受験のルート"
          : "検討している大学受験のルート"}
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        任意・複数選択可です。現段階での方向性で大丈夫です。
      </p>

      <CheckboxGroup
        options={middle ? CAREER_OPTIONS_MIDDLE : CAREER_OPTIONS_HIGH}
        selected={formData.careerDirections}
        onChange={(next) => setFormData((prev) => ({ ...prev, careerDirections: next }))}
      />
    </div>
  );
}

function SourceSlide({ formData, setFormData }: SlideProps) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
        Nobilva を知ったきっかけ
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        任意・複数選択可です。未選択のまま進めていただいても構いません。
      </p>

      <CheckboxGroup
        options={SOURCE_OPTIONS}
        selected={formData.sources}
        onChange={(next) => setFormData((prev) => ({ ...prev, sources: next }))}
      />
    </div>
  );
}

function ScheduleSlide({ formData, setFormData }: SlideProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsFailed, setSlotsFailed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch available slots from API, fall back to generated slots on error
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/schedule/available");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;

        if (data.slots && data.slots.length > 0) {
          const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
          const labels = data.slots.map(
            (s: { date: string; startTime: string; endTime: string }) => {
              const d = new Date(s.date + "T00:00:00");
              const month = d.getMonth() + 1;
              const day = String(d.getDate()).padStart(2, "0");
              const dow = dayNames[d.getDay()];
              return `${month}/${day}（${dow}）${s.startTime}-${s.endTime}`;
            }
          );
          setSlots(labels);
        } else {
          setSlots(generateSlots());
        }
      } catch {
        if (!cancelled) {
          setSlots(generateSlots());
          setSlotsFailed(true);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Clean up stale selections
  useEffect(() => {
    if (slotsLoading) return;
    const valid = formData.scheduleSlots.filter((s) => slots.includes(s));
    if (valid.length !== formData.scheduleSlots.length) {
      setFormData((prev) => ({ ...prev, scheduleSlots: valid }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsLoading]);

  // Auto-select first date when slots load
  useEffect(() => {
    if (slotsLoading || slots.length === 0) return;
    if (selectedDate === null) {
      const firstDateKey = extractDateKey(slots[0]);
      if (firstDateKey) setSelectedDate(firstDateKey);
    }
  }, [slotsLoading, slots, selectedDate]);

  // Build date-grouped structure: { "6/05（木）": ["18:00-18:30", ...] }
  const dateMap = new Map<string, string[]>();
  for (const slot of slots) {
    const dateKey = extractDateKey(slot);
    const timeRange = extractTimeRange(slot);
    if (!dateKey || !timeRange) continue;
    if (!dateMap.has(dateKey)) dateMap.set(dateKey, []);
    dateMap.get(dateKey)!.push(timeRange);
  }
  const dateKeys = Array.from(dateMap.keys());

  // Slots for the currently selected date
  const currentTimeSlots = selectedDate ? (dateMap.get(selectedDate) || []) : [];

  const toggleSlot = (slot: string) => {
    const isSelected = formData.scheduleSlots.includes(slot);
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        scheduleSlots: prev.scheduleSlots.filter((s) => s !== slot),
      }));
    } else if (formData.scheduleSlots.length < 3) {
      setFormData((prev) => ({
        ...prev,
        scheduleSlots: [...prev.scheduleSlots, slot],
      }));
    }
  };

  const removeSlot = (slot: string) => {
    setFormData((prev) => ({
      ...prev,
      scheduleSlots: prev.scheduleSlots.filter((s) => s !== slot),
    }));
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
        面談の希望日時
      </h2>
      <p className="text-sm text-gray-500 mb-1">3つまでお選びください。</p>
      <p className="text-sm text-gray-500 mb-6">
        24時間以内に、いずれかで日時を確定したメールをお送りします。
      </p>

      {slotsLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          日程を読み込み中...
        </div>
      ) : (
        <>
          {slotsFailed && (
            <p className="text-xs text-amber-600 mb-3">
              ※ 最新の空き状況を取得できなかったため、一般的な候補を表示しています。
            </p>
          )}

          {!formData.noSlotAvailable && (
            <>
              {dateKeys.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">
                  候補日がまだ登録されていません
                </p>
              ) : (
                <>
                  {/* 1. Date pills — horizontal scroll */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                    {dateKeys.map((dateKey) => {
                      const isActive = selectedDate === dateKey;
                      // Extract day number and day-of-week from "6/05（木）"
                      const dayMatch = dateKey.match(/(\d+)\/(\d+)（(.+?)）/);
                      const dayNum = dayMatch ? dayMatch[2].replace(/^0/, "") : dateKey;
                      const dow = dayMatch ? dayMatch[3] : "";
                      // Check if any slot on this date is selected
                      const hasSelection = formData.scheduleSlots.some((s) => s.startsWith(dateKey));
                      return (
                        <button
                          key={dateKey}
                          onClick={() => setSelectedDate(dateKey)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl border text-sm transition-colors relative ${
                            isActive
                              ? "border-nobilva-accent bg-nobilva-accent text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-nobilva-main"
                          }`}
                        >
                          <span className="text-lg font-bold leading-none">{dayNum}</span>
                          <span className={`text-xs mt-0.5 ${isActive ? "text-white/80" : "text-gray-400"}`}>{dow}</span>
                          {hasSelection && (
                            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isActive ? "bg-white" : "bg-nobilva-accent"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected date label */}
                  {selectedDate && (
                    <p className="text-xs text-gray-500 mb-2">{selectedDate}</p>
                  )}

                  {/* 2. Time grid */}
                  {selectedDate && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[35dvh] overflow-y-auto mb-4 -mx-1 px-1">
                      {currentTimeSlots.map((timeRange) => {
                        const fullLabel = `${selectedDate} ${timeRange}`;
                        const isSelected = formData.scheduleSlots.includes(fullLabel);
                        const isMaxed = formData.scheduleSlots.length >= 3 && !isSelected;
                        const [startTime, endTime] = timeRange.split("-");
                        return (
                          <button
                            key={timeRange}
                            onClick={() => toggleSlot(fullLabel)}
                            disabled={isMaxed}
                            className={`flex flex-col items-center justify-center py-3 px-1 rounded-lg border text-center transition-colors ${
                              isSelected
                                ? "border-nobilva-accent bg-nobilva-accent/10 text-gray-900"
                                : isMaxed
                                  ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-nobilva-main"
                            }`}
                          >
                            <span className={`text-base font-bold leading-none ${isSelected ? "text-nobilva-accent" : ""}`}>
                              {startTime}
                            </span>
                            <span className={`text-[10px] mt-1 ${isSelected ? "text-nobilva-accent/70" : "text-gray-400"}`}>
                              {endTime}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* 3. Selected slots summary chips */}
              {formData.scheduleSlots.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">
                    {formData.scheduleSlots.length}/3 枠選択中
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.scheduleSlots.map((slot) => (
                      <span
                        key={slot}
                        className="inline-flex items-center gap-1.5 bg-nobilva-accent/10 text-gray-900 text-xs font-medium pl-3 pr-1.5 py-1.5 rounded-full"
                      >
                        {slot}
                        <button
                          onClick={() => removeSlot(slot)}
                          className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          aria-label={`${slot} を解除`}
                        >
                          <svg className="w-3 h-3 text-gray-600" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3l6 6M9 3l-6 6" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <label className="flex items-start gap-3 cursor-pointer py-2">
            <input
              type="checkbox"
              checked={formData.noSlotAvailable}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  noSlotAvailable: e.target.checked,
                  scheduleSlots: e.target.checked ? [] : prev.scheduleSlots,
                }));
              }}
              className="mt-0.5 w-5 h-5 accent-nobilva-accent flex-shrink-0"
            />
            <span className="text-sm text-gray-700">
              上記の候補に都合の良い日時がない
            </span>
          </label>

          {formData.noSlotAvailable && (
            <textarea
              placeholder="ご希望の時間帯をお知らせください（例：土曜の午前中希望）"
              rows={3}
              value={formData.scheduleCustom}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduleCustom: e.target.value,
                }))
              }
              className={`mt-3 ${inputClass} resize-none`}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Extract date portion from slot label, e.g. "6/05（木）" from "6/05（木）18:00-18:30" */
function extractDateKey(slot: string): string | null {
  const m = slot.match(/^(.+?）)\s*/);
  return m ? m[1] : null;
}

/** Extract time range from slot label, e.g. "18:00-18:30" from "6/05（木）18:00-18:30" */
function extractTimeRange(slot: string): string | null {
  const m = slot.match(/）\s*(.+)$/);
  return m ? m[1] : null;
}

function ConfirmSlide({
  formData,
  teamSlug,
  onSubmit,
  onBack,
}: {
  formData: DiagnosisFormData;
  teamSlug: string;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const summaryItems = [
    { label: "お名前", value: formData.name },
    { label: "メールアドレス", value: formData.email },
    { label: "学年", value: formData.grade },
    { label: "野球の所属", value: formData.club },
    {
      label: "お悩み",
      value:
        [...formData.concerns, formData.concernOther]
          .filter(Boolean)
          .join("、") || "未入力",
    },
    { label: "志望進路", value: formData.careerDirections.join("、") || "未入力" },
    { label: "きっかけ", value: formData.sources.join("、") || "未入力" },
    {
      label: "希望日時",
      value: formData.noSlotAvailable
        ? `候補なし: ${formData.scheduleCustom}`
        : formData.scheduleSlots.join(" / "),
    },
  ];

  const fallbackText = [
    "【無料学習相談のお申込み】",
    "",
    ...summaryItems.map((item) => `${item.label}: ${item.value}`),
  ].join("\n");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const attribution = getAttribution();
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          teamSlug: teamSlug || undefined,
          ...attribution,
        }),
      });
      if (!res.ok) throw new Error();
      trackNobilvaEvent("diagnosis_complete");
      onSubmit();
    } catch {
      setFailed(true);
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fallbackText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  if (failed) {
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          送信に失敗しました
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          申し訳ございません。以下の内容をコピーして、メールでお送りください。
        </p>

        <div className="mb-4">
          <a
            href={`mailto:nobilva@nectere.jp?subject=${encodeURIComponent("無料学習相談のお申込み")}&body=${encodeURIComponent(fallbackText)}`}
            className="inline-flex items-center gap-2 text-nobilva-accent font-bold hover:underline"
          >
            nobilva@nectere.jp にメールを送る
          </a>
        </div>

        <div className="relative">
          <pre className="bg-gray-50 rounded-xl p-5 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
            {fallbackText}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? "コピーしました" : "コピー"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        入力内容のご確認
      </h2>

      <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
        {summaryItems.map((item) => (
          <div key={item.label}>
            <span className="text-xs font-bold text-gray-500">
              {item.label}
            </span>
            <p className="text-sm text-gray-900 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer mb-6">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-5 h-5 accent-nobilva-accent flex-shrink-0"
        />
        <span className="text-xs text-gray-700">
          <strong>
            <Link
              href="/ja/privacy"
              target="_blank"
              className="underline hover:text-nobilva-accent"
            >
              プライバシーポリシー
            </Link>
            に同意します
          </strong>
          <br />
          ご入力いただいた情報は、無料学習相談の実施・運営連絡・サービス改善の目的でのみ使用します。第三者には提供しません。
        </span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-full transition-colors"
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
          {submitting ? "送信中..." : "無料学習相談を申し込む"}
        </button>
      </div>
    </div>
  );
}

function CompletionScreen() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-lg mx-auto w-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              aria-hidden="true"
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
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            お申込みを受け付けました。
          </h1>
          <p className="text-lg text-gray-900 mb-8">ありがとうございます。</p>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8">
            ご入力いただいた内容を確認し、
            <strong>24時間以内に面談日時の確定とZoom URLをメール</strong>
            でお送りします。
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {[
            {
              icon: "1",
              title: "確認メールが届きます（数分以内）",
              detail:
                "ご入力内容の控えをお送りします。届かない場合は迷惑メールフォルダもご確認ください。",
            },
            {
              icon: "2",
              title: "日時確定メールが届きます（24時間以内）",
              detail:
                "ご希望候補から1つを確定し、面談用のZoom URLとともにお送りします。",
            },
            {
              icon: "3",
              title: "当日の面談（30分・Zoom）",
              detail:
                "リラックスしてご参加ください。事前準備は不要です。保護者の方・生徒ご本人、どちらでもご参加いただけます。",
            },
          ].map((s) => (
            <div key={s.icon} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main text-gray-900 font-bold text-sm flex items-center justify-center">
                {s.icon}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/ja/services/nobilva"
            className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm"
          >
            Nobilva トップに戻る
            <ChevronRightIcon size="xs" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function isMiddleSchool(grade: string): boolean {
  return (
    grade.startsWith("小学") ||
    grade.startsWith("中学")
  );
}

function generateSlots(): string[] {
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
