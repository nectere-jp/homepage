"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";
import {
  LuArrowLeft,
  LuMail,
  LuPhone,
  LuBuilding,
  LuClock,
  LuCalendarCheck,
  LuSend,
  LuLoader,
  LuX,
} from "react-icons/lu";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { formatFirestoreDate } from "@/lib/date-utils";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  inquiryType: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface StaffMember {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

interface AvailableSlotData {
  date: string;
  startTime: string;
  endTime: string;
  booked: boolean;
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  translation: "翻訳について",
  webDesign: "ホームページ制作について",
  print: "印刷物制作について",
  nobilva: "Nobilva（学習支援）について",
  "nobilva-diagnosis": "Nobilva 無料学習相談",
  teachit: "Teach It（教育アプリ）について",
  interview: "取材のご依頼",
  other: "その他",
};

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}（${DAY_NAMES[d.getDay()]}）`;
}

function computeEndTime(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function parsePreferredSlots(
  message: string
): { label: string; date?: string; startTime?: string }[] {
  const match = message.match(/【希望日時】(.+?)(?:\n|$)/);
  if (!match) return [];
  const text = match[1].trim();
  if (text.startsWith("候補なし")) return [{ label: text }];
  return text.split(" / ").map((s) => {
    const trimmed = s.trim();
    // Parse "6/05（木）18:00-18:30" → date + startTime
    const m = trimmed.match(
      /(\d{1,2})\/(\d{1,2})(?:（.）|\(..\))?\s*(\d{1,2}:\d{2})/
    );
    if (m) {
      const now = new Date();
      let year = now.getFullYear();
      const month = parseInt(m[1]);
      if (month < now.getMonth() + 1) year++;
      const day = m[2].padStart(2, "0");
      const monthStr = String(month).padStart(2, "0");
      return {
        label: trimmed,
        date: `${year}-${monthStr}-${day}`,
        startTime: m[3],
      };
    }
    return { label: trimmed };
  });
}

export default function ContactDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [params, setParams] = useState<{ id: string } | null>(null);
  const [contact, setContact] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    props.params.then(setParams);
  }, [props.params]);

  useEffect(() => {
    if (params) fetchContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const fetchContact = async () => {
    if (!params) return;
    try {
      const response = await adminFetch(`/api/admin/contacts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
        setSelectedStatus(data.contact.status);
      } else {
        router.push("/admin/contacts");
      }
    } catch (error) {
      console.error("Failed to fetch contact:", error);
      router.push("/admin/contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!contact || !params || selectedStatus === contact.status) return;
    setSaving(true);
    try {
      const response = await adminFetch(`/api/admin/contacts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
        alert("ステータスを更新しました");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("ステータスの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = formatFirestoreDate;

  if (loading) return <LoadingSpinner />;
  if (!contact) return null;

  const isDiagnosis = contact.inquiryType === "nobilva-diagnosis";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/contacts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <LuArrowLeft className="w-4 h-4" />
          一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">お問い合わせ詳細</h1>
        <p className="mt-2 text-gray-600">ID: {contact.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    お名前
                  </label>
                  <p className="text-gray-900 font-medium">{contact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    メールアドレス
                  </label>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    <LuMail className="w-4 h-4" />
                    {contact.email}
                  </a>
                </div>
              </div>
              {(contact.company || contact.phone) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.company && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        会社名
                      </label>
                      <p className="text-gray-900 inline-flex items-center gap-2">
                        <LuBuilding className="w-4 h-4" />
                        {contact.company}
                      </p>
                    </div>
                  )}
                  {contact.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        電話番号
                      </label>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-primary hover:underline inline-flex items-center gap-2"
                      >
                        <LuPhone className="w-4 h-4" />
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  お問い合わせ種別
                </label>
                <p className="text-gray-900 font-medium">
                  {INQUIRY_TYPE_LABELS[contact.inquiryType] ||
                    contact.inquiryType}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              お問い合わせ内容
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {contact.message}
              </p>
            </div>
          </div>

          {/* Schedule Assignment (diagnosis only) */}
          {isDiagnosis && params && (
            <ScheduleAssignment
              contactId={params.id}
              contact={contact}
              onStatusUpdate={(c) => {
                setContact(c);
                setSelectedStatus(c.status);
              }}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ステータス管理
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  現在のステータス
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="new">新規</option>
                  <option value="in_progress">対応中</option>
                  <option value="resolved">完了</option>
                </select>
              </div>
              <button
                onClick={handleStatusChange}
                disabled={saving || selectedStatus === contact.status}
                className="w-full px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? "保存中..." : "ステータスを更新"}
              </button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">日時情報</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  受付日時
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <LuClock className="w-4 h-4" />
                  {formatDate(contact.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  最終更新
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <LuClock className="w-4 h-4" />
                  {formatDate(contact.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              クイックアクション
            </h2>
            <div className="space-y-2">
              <a
                href={`mailto:${contact.email}`}
                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                メールで返信
              </a>
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  電話をかける
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Assignment Component ───

function ScheduleAssignment({
  contactId,
  contact,
  onStatusUpdate,
}: {
  contactId: string;
  contact: ContactInquiry;
  onStatusUpdate: (c: ContactInquiry) => void;
}) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [availableSlots, setAvailableSlots] = useState<
    Map<string, AvailableSlotData[]>
  >(new Map());
  const [processing, setProcessing] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState(
    `ご希望いただいた日時に空きがなく、別の日時をご提案させていただきたく存じます。\n\nお手数ですが、以下のいずれかの方法で改めてご都合をお知らせください。\n\n1. このメールにご返信\n2. お申し込みフォームから再度ご希望日時を選択`
  );
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const preferredSlots = parsePreferredSlots(contact.message);
  const selectedStaff = staff.find((s) => s.id === selectedStaffId);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedStaffId) loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStaffId]);

  async function loadStaff() {
    try {
      const res = await adminFetch(
        "/api/admin/schedule/staff?activeOnly=true"
      );
      if (!res.ok) return;
      const data = await res.json();
      setStaff(data.staff);
      if (data.staff.length > 0) setSelectedStaffId(data.staff[0].id);
    } catch {
      /* ignore */
    }
  }

  async function loadAvailability() {
    if (!selectedStaffId) return;
    // Fetch 30 days of availability
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    try {
      const res = await adminFetch(
        `/api/admin/schedule/slots?staffId=${selectedStaffId}&startDate=${fmt(start)}&endDate=${fmt(end)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const byDate = new Map<string, AvailableSlotData[]>();
      for (const slot of data.slots as AvailableSlotData[]) {
        if (!byDate.has(slot.date)) byDate.set(slot.date, []);
        byDate.get(slot.date)!.push(slot);
      }
      setAvailableSlots(byDate);
    } catch {
      /* ignore */
    }
  }

  function isSlotAvailable(date?: string, startTime?: string): boolean {
    if (!date || !startTime) return false;
    const dateSlots = availableSlots.get(date);
    if (!dateSlots) return false;
    return dateSlots.some((s) => s.startTime === startTime && !s.booked);
  }

  async function handleConfirm(
    date: string,
    startTime: string,
    label: string
  ) {
    if (!selectedStaffId || !selectedStaff) return;
    if (
      !confirm(
        `${label} を ${selectedStaff.name} の担当で確定し、${contact.name}様に通知メールを送信しますか？`
      )
    )
      return;

    setProcessing(true);
    setResult(null);
    try {
      const endTime = computeEndTime(startTime);
      const res = await adminFetch(
        `/api/admin/contacts/${contactId}/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "confirm",
            staffId: selectedStaffId,
            staffName: selectedStaff.name,
            date,
            startTime,
            endTime,
            dateDisplay: formatDateDisplay(date),
            userName: contact.name,
            userEmail: contact.email,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", message: data.message });
        onStatusUpdate({ ...contact, status: "in_progress" } as ContactInquiry);
        loadAvailability();
      } else {
        setResult({ type: "error", message: data.error });
      }
    } catch {
      setResult({ type: "error", message: "通信エラーが発生しました" });
    } finally {
      setProcessing(false);
    }
  }

  async function handleReschedule() {
    if (!rescheduleMsg.trim()) return;
    setProcessing(true);
    setResult(null);
    try {
      const res = await adminFetch(
        `/api/admin/contacts/${contactId}/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reschedule",
            userName: contact.name,
            userEmail: contact.email,
            message: rescheduleMsg,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", message: data.message });
        setShowReschedule(false);
        onStatusUpdate({ ...contact, status: "in_progress" } as ContactInquiry);
      } else {
        setResult({ type: "error", message: data.error });
      }
    } catch {
      setResult({ type: "error", message: "通信エラーが発生しました" });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <LuCalendarCheck className="w-5 h-5 text-orange-500" />
        日程調整
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        希望日時から選択して確定するか、別の日時を提案してください。
      </p>

      {/* Result message */}
      {result && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm font-medium ${
            result.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {result.message}
        </div>
      )}

      {/* Staff selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          担当者
        </label>
        {staff.length === 0 ? (
          <p className="text-sm text-gray-500">
            <Link
              href="/admin/schedule"
              className="text-blue-600 hover:underline"
            >
              日程管理ページ
            </Link>
            で担当者を登録してください。
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {staff.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStaffId(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedStaffId === s.id
                    ? "bg-white shadow"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                style={
                  selectedStaffId === s.id
                    ? { outlineColor: s.color, outlineWidth: "2px", outlineStyle: "solid" as const }
                    : undefined
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preferred slots */}
      {preferredSlots.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ユーザーの希望日時
          </label>
          <div className="space-y-2">
            {preferredSlots.map((slot, i) => {
              const available = isSlotAvailable(slot.date, slot.startTime);
              const canConfirm =
                available && !!selectedStaffId && !processing;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    available
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        available ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm text-gray-900">{slot.label}</span>
                    {!slot.date && (
                      <span className="text-xs text-gray-400">
                        （候補外）
                      </span>
                    )}
                    {slot.date && !available && (
                      <span className="text-xs text-red-400">空きなし</span>
                    )}
                  </div>
                  {canConfirm && slot.date && slot.startTime && (
                    <button
                      onClick={() =>
                        handleConfirm(slot.date!, slot.startTime!, slot.label)
                      }
                      disabled={processing}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <LuCalendarCheck className="w-3.5 h-3.5" />
                      確定
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reschedule */}
      {!showReschedule ? (
        <button
          onClick={() => setShowReschedule(true)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LuSend className="w-4 h-4" />
          別の日時を問い合わせる
        </button>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              日程再調整メール
            </h3>
            <button
              onClick={() => setShowReschedule(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <LuX className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {contact.name}様（{contact.email}）に送信されます。
          </p>
          <textarea
            value={rescheduleMsg}
            onChange={(e) => setRescheduleMsg(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowReschedule(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleReschedule}
              disabled={processing || !rescheduleMsg.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {processing ? (
                <LuLoader className="w-4 h-4 animate-spin" />
              ) : (
                <LuSend className="w-4 h-4" />
              )}
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
