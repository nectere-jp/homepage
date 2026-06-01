"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  LuPlus,
  LuChevronLeft,
  LuChevronRight,
  LuSave,
  LuLoader,
  LuX,
  LuCalendarCheck,
} from "react-icons/lu";

// ─── Types ───

interface StaffMember {
  id: string;
  name: string;
  email: string;
  color: string;
  active: boolean;
}

interface SlotData {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  booked: boolean;
  bookedBy?: string;
  bookedMemo?: string;
}

interface BookingInfo {
  bookedBy: string;
  memo: string;
}

interface BookingModalState {
  date: string;
  time: string;
  endTime: string;
  mode: "book" | "view";
  existing?: BookingInfo;
}

// ─── Constants ───

const HOURS_START = 9;
const HOURS_END = 22;
const TIME_SLOTS: string[] = [];
for (let h = HOURS_START; h < HOURS_END; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const DAY_NAMES = ["月", "火", "水", "木", "金", "土", "日"];
const DAY_NAMES_FULL = ["日", "月", "火", "水", "木", "金", "土"];

const STAFF_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#EF4444",
];

// ─── Helpers ───

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateShort(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}（${DAY_NAMES_FULL[d.getDay()]}）`;
}

function computeEndTime(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isPast(d: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return target < now;
}

// ─── Main Component ───

export default function ScheduleAdminPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  // Available slots (date → Set of startTimes)
  const [slots, setSlots] = useState<Map<string, Set<string>>>(new Map());
  // Booked slots (date-time → BookingInfo)
  const [bookedSlots, setBookedSlots] = useState<Map<string, BookingInfo>>(
    new Map()
  );
  // For change detection
  const [originalSlots, setOriginalSlots] = useState<Map<string, Set<string>>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [bookingModal, setBookingModal] = useState<BookingModalState | null>(
    null
  );

  const selectedStaff = staff.find((s) => s.id === selectedStaffId);
  const weekDates = getWeekDates(weekStart);

  const hasChanges = useCallback(() => {
    for (const [date, times] of slots) {
      const orig = originalSlots.get(date);
      if (!orig) {
        if (times.size > 0) return true;
        continue;
      }
      if (times.size !== orig.size) return true;
      for (const t of times) {
        if (!orig.has(t)) return true;
      }
    }
    for (const [date, orig] of originalSlots) {
      if (!slots.has(date) && orig.size > 0) return true;
    }
    return false;
  }, [slots, originalSlots]);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      // Clear previous staff's data immediately to avoid showing stale slots
      setSlots(new Map());
      setBookedSlots(new Map());
      setOriginalSlots(new Map());
      loadSlots(selectedStaffId, weekStart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStaffId, weekStart]);

  async function loadStaff() {
    try {
      const res = await adminFetch("/api/admin/schedule/staff");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStaff(data.staff);
      if (data.staff.length > 0 && !selectedStaffId) {
        setSelectedStaffId(data.staff[0].id);
      }
    } catch (e) {
      console.error("Failed to load staff:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots(staffId: string, currentWeekStart: Date) {
    const dates = getWeekDates(currentWeekStart);
    const startDate = formatDateISO(dates[0]);
    const endDate = formatDateISO(dates[6]);
    try {
      const res = await adminFetch(
        `/api/admin/schedule/slots?staffId=${staffId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();

      const newSlots = new Map<string, Set<string>>();
      const newBooked = new Map<string, BookingInfo>();

      for (const slot of data.slots as SlotData[]) {
        if (!newSlots.has(slot.date)) newSlots.set(slot.date, new Set());
        newSlots.get(slot.date)!.add(slot.startTime);
        if (slot.booked) {
          newBooked.set(`${slot.date}-${slot.startTime}`, {
            bookedBy: slot.bookedBy || "",
            memo: slot.bookedMemo || "",
          });
        }
      }

      // Only update if this is still the active staff member
      setSelectedStaffId((currentId) => {
        if (currentId === staffId) {
          setSlots(newSlots);
          setBookedSlots(newBooked);
          const origCopy = new Map<string, Set<string>>();
          for (const [k, v] of newSlots) origCopy.set(k, new Set(v));
          setOriginalSlots(origCopy);
        }
        return currentId;
      });
    } catch (e) {
      console.error("Failed to load slots:", e);
    }
  }

  function toggleSlot(date: string, time: string) {
    if (bookedSlots.has(`${date}-${time}`)) return;
    if (isPast(new Date(date))) return;

    setSlots((prev) => {
      const next = new Map(prev);
      const dateSlots = new Set(next.get(date) || []);
      if (dateSlots.has(time)) {
        dateSlots.delete(time);
      } else {
        dateSlots.add(time);
      }
      next.set(date, dateSlots);
      return next;
    });
  }

  function handleCellMouseDown(date: string, time: string) {
    const key = `${date}-${time}`;
    const isBooked = bookedSlots.has(key);
    const isSet = slots.get(date)?.has(time) ?? false;

    // Booked slot → show info modal
    if (isBooked) {
      setBookingModal({
        date,
        time,
        endTime: computeEndTime(time),
        mode: "view",
        existing: bookedSlots.get(key),
      });
      return;
    }

    // Available slot → right-click or ctrl+click opens booking modal
    // Normal click toggles availability
    if (isPast(new Date(date))) return;

    // If the slot is available (set) and not booked, allow booking via double-click
    // For now, use single click to toggle availability
    if (isSet) {
      setDragMode("remove");
    } else {
      setDragMode("add");
    }
    setIsDragging(true);
    toggleSlot(date, time);
  }

  function handleCellMouseEnter(date: string, time: string) {
    if (!isDragging) return;
    if (bookedSlots.has(`${date}-${time}`)) return;
    if (isPast(new Date(date))) return;

    const isSet = slots.get(date)?.has(time) ?? false;
    if (dragMode === "add" && !isSet) toggleSlot(date, time);
    else if (dragMode === "remove" && isSet) toggleSlot(date, time);
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleCellContextMenu(
    e: React.MouseEvent,
    date: string,
    time: string
  ) {
    e.preventDefault();
    const isSet = slots.get(date)?.has(time) ?? false;
    const key = `${date}-${time}`;
    const isBooked = bookedSlots.has(key);

    if (isBooked) {
      setBookingModal({
        date,
        time,
        endTime: computeEndTime(time),
        mode: "view",
        existing: bookedSlots.get(key),
      });
    } else if (isSet) {
      setBookingModal({
        date,
        time,
        endTime: computeEndTime(time),
        mode: "book",
      });
    }
  }

  async function saveChanges() {
    if (!selectedStaffId || !selectedStaff) return;
    setSaving(true);

    try {
      const allDates = new Set([...slots.keys(), ...originalSlots.keys()]);
      const promises: Promise<Response>[] = [];

      for (const date of allDates) {
        const current = slots.get(date) || new Set();
        const original = originalSlots.get(date) || new Set();

        if (current.size === original.size) {
          let same = true;
          for (const t of current) {
            if (!original.has(t)) {
              same = false;
              break;
            }
          }
          if (same) continue;
        }

        promises.push(
          adminFetch("/api/admin/schedule/slots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              staffId: selectedStaffId,
              staffName: selectedStaff.name,
              date,
              startTimes: Array.from(current).sort(),
            }),
          })
        );
      }

      await Promise.all(promises);

      const origCopy = new Map<string, Set<string>>();
      for (const [k, v] of slots) origCopy.set(k, new Set(v));
      setOriginalSlots(origCopy);
    } catch (e) {
      console.error("Failed to save:", e);
      alert("保存に失敗しました。再試行してください。");
    } finally {
      setSaving(false);
    }
  }

  async function handleBookSlot(bookedBy: string, memo: string) {
    if (!selectedStaffId || !bookingModal) return;
    try {
      const res = await adminFetch("/api/admin/schedule/slots/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: selectedStaffId,
          date: bookingModal.date,
          startTime: bookingModal.time,
          bookedBy,
          memo,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "予約に失敗しました");
        return;
      }
      // Update local state
      setBookedSlots((prev) => {
        const next = new Map(prev);
        next.set(`${bookingModal.date}-${bookingModal.time}`, {
          bookedBy,
          memo,
        });
        return next;
      });
      setBookingModal(null);
    } catch {
      alert("予約に失敗しました。");
    }
  }

  async function handleUnbookSlot() {
    if (!selectedStaffId || !bookingModal) return;
    if (!confirm("この予約を解除しますか？")) return;
    try {
      const res = await adminFetch(
        `/api/admin/schedule/slots/book?staffId=${selectedStaffId}&date=${bookingModal.date}&startTime=${bookingModal.time}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        alert("予約解除に失敗しました");
        return;
      }
      setBookedSlots((prev) => {
        const next = new Map(prev);
        next.delete(`${bookingModal.date}-${bookingModal.time}`);
        return next;
      });
      setBookingModal(null);
    } catch {
      alert("予約解除に失敗しました。");
    }
  }

  async function handleAddStaff(name: string, email: string) {
    try {
      const res = await adminFetch("/api/admin/schedule/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStaff((prev) => [...prev, data.staff]);
      setSelectedStaffId(data.staff.id);
      setShowAddStaff(false);
    } catch {
      alert("担当者の追加に失敗しました。");
    }
  }

  async function handleToggleStaffActive(id: string, active: boolean) {
    try {
      const res = await adminFetch(`/api/admin/schedule/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error();
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active } : s))
      );
    } catch {
      alert("更新に失敗しました。");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LuLoader className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className="select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">日程管理</h1>
        {hasChanges() && (
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? (
              <LuLoader className="w-4 h-4 animate-spin" />
            ) : (
              <LuSave className="w-4 h-4" />
            )}
            {saving ? "保存中..." : "変更を保存"}
          </button>
        )}
      </div>

      {/* Staff Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {staff.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStaffId(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedStaffId === s.id
                ? "bg-white shadow-md"
                : s.active
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
            style={
              selectedStaffId === s.id
                ? {
                    outlineColor: s.color,
                    outlineWidth: "2px",
                    outlineStyle: "solid" as const,
                  }
                : undefined
            }
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: s.color,
                opacity: s.active ? 1 : 0.4,
              }}
            />
            <span>{s.name}</span>
            {!s.active && (
              <span className="text-xs text-gray-400">(無効)</span>
            )}
          </button>
        ))}
        <button
          onClick={() => setShowAddStaff(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors border border-dashed border-gray-300"
        >
          <LuPlus className="w-4 h-4" />
          担当者を追加
        </button>

        {selectedStaff && (
          <button
            onClick={() =>
              handleToggleStaffActive(selectedStaff.id, !selectedStaff.active)
            }
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {selectedStaff.active ? "この担当者を無効にする" : "有効にする"}
          </button>
        )}
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">担当者が登録されていません</p>
          <p className="text-sm">
            「担当者を追加」から中村さん・養田さんなどを登録してください。
          </p>
        </div>
      ) : (
        <>
          {/* Week Navigator */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const prev = new Date(weekStart);
                prev.setDate(prev.getDate() - 7);
                setWeekStart(prev);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LuChevronLeft className="w-4 h-4" />
              前の週
            </button>

            <div className="text-center">
              <span className="text-sm font-medium text-gray-900">
                {weekDates[0].getFullYear()}年{" "}
                {formatDateShort(weekDates[0])} 〜{" "}
                {formatDateShort(weekDates[6])}
              </span>
              <button
                onClick={() => setWeekStart(getMonday(new Date()))}
                className="ml-3 text-xs text-blue-600 hover:underline"
              >
                今週
              </button>
            </div>

            <button
              onClick={() => {
                const next = new Date(weekStart);
                next.setDate(next.getDate() + 7);
                setWeekStart(next);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              次の週
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="w-16 p-2 text-xs text-gray-400 font-normal border-b border-r border-gray-100">
                      時間
                    </th>
                    {weekDates.map((date, i) => {
                      const today = isToday(date);
                      const past = isPast(date);
                      return (
                        <th
                          key={i}
                          className={`p-2 text-center border-b border-gray-100 ${
                            today
                              ? "bg-blue-50"
                              : past
                                ? "bg-gray-50"
                                : ""
                          }`}
                        >
                          <div
                            className={`text-xs font-medium ${
                              today
                                ? "text-blue-600"
                                : past
                                  ? "text-gray-400"
                                  : i >= 5
                                    ? "text-blue-500"
                                    : "text-gray-600"
                            }`}
                          >
                            {DAY_NAMES[i]}
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              today
                                ? "text-blue-600"
                                : past
                                  ? "text-gray-400"
                                  : "text-gray-900"
                            }`}
                          >
                            {date.getDate()}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => {
                    const isHour = time.endsWith(":00");
                    return (
                      <tr key={time}>
                        <td
                          className={`px-2 py-0 text-right text-xs text-gray-400 border-r border-gray-100 ${
                            isHour ? "border-t border-gray-200" : ""
                          }`}
                          style={{ height: "28px" }}
                        >
                          {isHour ? time : ""}
                        </td>
                        {weekDates.map((date, i) => {
                          const dateStr = formatDateISO(date);
                          const isSet = slots.get(dateStr)?.has(time) ?? false;
                          const bookKey = `${dateStr}-${time}`;
                          const isBooked = bookedSlots.has(bookKey);
                          const booking = bookedSlots.get(bookKey);
                          const past = isPast(date);
                          const today = isToday(date);

                          return (
                            <td
                              key={i}
                              onMouseDown={() =>
                                handleCellMouseDown(dateStr, time)
                              }
                              onMouseEnter={() =>
                                handleCellMouseEnter(dateStr, time)
                              }
                              onContextMenu={(e) =>
                                handleCellContextMenu(e, dateStr, time)
                              }
                              className={`border-gray-100 ${isHour ? "border-t border-gray-200" : "border-t border-gray-50"} ${
                                past
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : isBooked
                                    ? "cursor-pointer"
                                    : isSet
                                      ? "cursor-pointer"
                                      : "cursor-pointer"
                              } ${today && !isSet && !isBooked ? "bg-blue-50/30" : ""}`}
                              style={{ height: "28px", padding: "1px" }}
                            >
                              {isSet && (
                                <div
                                  className={`w-full h-full rounded-sm relative ${
                                    isBooked
                                      ? ""
                                      : "hover:opacity-80"
                                  }`}
                                  style={{
                                    backgroundColor: isBooked
                                      ? "#EF4444"
                                      : selectedStaff?.color || "#3B82F6",
                                  }}
                                  title={
                                    isBooked
                                      ? `予約済み: ${booking?.bookedBy || ""}${booking?.memo ? ` (${booking.memo})` : ""}`
                                      : `${time} - 対応可能（右クリックで予約を入れる）`
                                  }
                                >
                                  {isBooked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <LuCalendarCheck className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-3 rounded-sm"
                style={{
                  backgroundColor: selectedStaff?.color || "#3B82F6",
                }}
              />
              <span>対応可能</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-sm bg-red-500 flex items-center justify-center">
                <LuCalendarCheck className="w-2.5 h-2.5 text-white" />
              </div>
              <span>予約済み（変更不可）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-sm bg-gray-100 border border-gray-200" />
              <span>未設定</span>
            </div>
            <span className="ml-auto text-gray-400">
              クリック/ドラッグ: 枠切替 ｜ 右クリック: 予約を入れる
            </span>
          </div>
        </>
      )}

      {/* Modals */}
      {showAddStaff && (
        <AddStaffModal
          onClose={() => setShowAddStaff(false)}
          onAdd={handleAddStaff}
          nextColor={STAFF_COLORS[staff.length % STAFF_COLORS.length]}
        />
      )}
      {bookingModal && (
        <BookingModal
          state={bookingModal}
          staffName={selectedStaff?.name || ""}
          onClose={() => setBookingModal(null)}
          onBook={handleBookSlot}
          onUnbook={handleUnbookSlot}
        />
      )}
    </div>
  );
}

// ─── Add Staff Modal ───

function AddStaffModal({
  onClose,
  onAdd,
  nextColor,
}: {
  onClose: () => void;
  onAdd: (name: string, email: string) => Promise<void>;
  nextColor: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onAdd(name, email);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">担当者を追加</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例: 中村"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              placeholder="例: nakamura@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カレンダーカラー
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: nextColor }}
              />
              <span className="text-xs text-gray-400">自動割り当て</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "追加中..." : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Booking Modal ───

function BookingModal({
  state,
  staffName,
  onClose,
  onBook,
  onUnbook,
}: {
  state: BookingModalState;
  staffName: string;
  onClose: () => void;
  onBook: (bookedBy: string, memo: string) => Promise<void>;
  onUnbook: () => Promise<void>;
}) {
  const [bookedBy, setBookedBy] = useState(state.existing?.bookedBy || "");
  const [memo, setMemo] = useState(state.existing?.memo || "");
  const [submitting, setSubmitting] = useState(false);

  const dateDisplay = formatDateDisplay(state.date);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookedBy.trim()) return;
    setSubmitting(true);
    await onBook(bookedBy, memo);
    setSubmitting(false);
  };

  const handleUnbook = async () => {
    setSubmitting(true);
    await onUnbook();
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {state.mode === "book" ? "予約を入れる" : "予約情報"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Slot info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">担当者</span>
              <p className="font-medium text-gray-900">{staffName}</p>
            </div>
            <div>
              <span className="text-gray-500">日時</span>
              <p className="font-medium text-gray-900">
                {dateDisplay} {state.time}-{state.endTime}
              </p>
            </div>
          </div>
        </div>

        {state.mode === "book" ? (
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                予約者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例: 山田花子 様"
                value={bookedBy}
                onChange={(e) => setBookedBy(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <input
                type="text"
                placeholder="例: 中2・シニア所属"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!bookedBy.trim() || submitting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {submitting ? "予約中..." : "予約を確定"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-gray-500">予約者</span>
              <p className="text-sm text-gray-900 mt-0.5">
                {state.existing?.bookedBy || "（未設定）"}
              </p>
            </div>
            {state.existing?.memo && (
              <div>
                <span className="text-xs font-bold text-gray-500">メモ</span>
                <p className="text-sm text-gray-900 mt-0.5">
                  {state.existing.memo}
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                閉じる
              </button>
              <button
                onClick={handleUnbook}
                disabled={submitting}
                className="flex-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {submitting ? "解除中..." : "予約を解除"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
