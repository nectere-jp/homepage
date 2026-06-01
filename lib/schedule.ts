import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// ─── Types ───

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  color: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AvailableSlot {
  id: string;
  staffId: string;
  staffName: string;
  date: string;      // "2026-06-05"
  startTime: string;  // "18:00"
  endTime: string;    // "18:30"
  booked: boolean;
  bookedBy?: string;
  bookedMemo?: string;
  createdAt: Timestamp;
}

export interface PublicSlot {
  date: string;
  startTime: string;
  endTime: string;
}

const SLOT_DURATION_MIN = 30;

export const STAFF_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EF4444', // red
];

// ─── Staff CRUD ───

export async function getStaffMembers(activeOnly = false): Promise<StaffMember[]> {
  const { firestore } = getFirebaseAdmin();
  let query: FirebaseFirestore.Query = firestore.collection('staff').orderBy('createdAt', 'asc');
  if (activeOnly) {
    query = query.where('active', '==', true);
  }
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StaffMember[];
}

export async function createStaffMember(data: {
  name: string;
  email: string;
  color: string;
}): Promise<StaffMember> {
  const { firestore } = getFirebaseAdmin();
  const now = Timestamp.now();
  const staffData = {
    ...data,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await firestore.collection('staff').add(staffData);
  return { id: docRef.id, ...staffData };
}

export async function updateStaffMember(
  id: string,
  data: Partial<{ name: string; email: string; color: string; active: boolean }>
): Promise<void> {
  const { firestore } = getFirebaseAdmin();
  await firestore.collection('staff').doc(id).update({
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ─── Slot Management ───

export async function getSlotsForRange(
  staffId: string,
  startDate: string,
  endDate: string
): Promise<AvailableSlot[]> {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection('availableSlots')
    .where('staffId', '==', staffId)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date')
    .orderBy('startTime')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AvailableSlot[];
}

/**
 * 指定日の空き枠を一括設定する。
 * 既存の未予約スロットを削除し、新しいスロットを作成する。
 * 予約済みスロットは保持される。
 */
export async function setSlotsForDate(
  staffId: string,
  staffName: string,
  date: string,
  startTimes: string[]
): Promise<void> {
  const { firestore } = getFirebaseAdmin();
  const batch = firestore.batch();

  // 既存の未予約スロットを削除
  const existing = await firestore
    .collection('availableSlots')
    .where('staffId', '==', staffId)
    .where('date', '==', date)
    .where('booked', '==', false)
    .get();

  existing.docs.forEach(doc => batch.delete(doc.ref));

  // 新しいスロットを追加
  const now = Timestamp.now();
  for (const startTime of startTimes) {
    const endTime = computeEndTime(startTime);
    const ref = firestore.collection('availableSlots').doc();
    batch.set(ref, {
      staffId,
      staffName,
      date,
      startTime,
      endTime,
      booked: false,
      createdAt: now,
    });
  }

  await batch.commit();
}

/**
 * 公開用: 予約可能なスロットを取得（重複排除済み）
 */
export async function getPublicAvailableSlots(days = 14): Promise<PublicSlot[]> {
  const { firestore } = getFirebaseAdmin();

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + 1);
  const end = new Date(today);
  end.setDate(today.getDate() + days);

  const startDate = formatDateISO(start);
  const endDate = formatDateISO(end);

  const snapshot = await firestore
    .collection('availableSlots')
    .where('booked', '==', false)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date')
    .orderBy('startTime')
    .get();

  const seen = new Set<string>();
  const slots: PublicSlot[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const key = `${data.date}-${data.startTime}`;
    if (!seen.has(key)) {
      seen.add(key);
      slots.push({
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      });
    }
  }

  return slots;
}

/**
 * スロットを予約済みにする
 */
export async function bookSlot(
  staffId: string,
  date: string,
  startTime: string,
  bookedBy: string,
  bookedMemo?: string
): Promise<boolean> {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection('availableSlots')
    .where('staffId', '==', staffId)
    .where('date', '==', date)
    .where('startTime', '==', startTime)
    .where('booked', '==', false)
    .limit(1)
    .get();

  if (snapshot.empty) return false;

  await snapshot.docs[0].ref.update({
    booked: true,
    bookedBy,
    bookedMemo: bookedMemo || '',
  });
  return true;
}

/**
 * 予約を解除する
 */
export async function unbookSlot(
  staffId: string,
  date: string,
  startTime: string
): Promise<boolean> {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection('availableSlots')
    .where('staffId', '==', staffId)
    .where('date', '==', date)
    .where('startTime', '==', startTime)
    .where('booked', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) return false;

  await snapshot.docs[0].ref.update({
    booked: false,
    bookedBy: '',
    bookedMemo: '',
  });
  return true;
}

// ─── Helpers ───

function computeEndTime(startTime: string): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMin = h * 60 + m + SLOT_DURATION_MIN;
  const eh = Math.floor(totalMin / 60);
  const em = totalMin % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
