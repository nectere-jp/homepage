import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';

let app: App;
let auth: Auth;
let storage: Storage;
let firestore: Firestore;

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  inquiryType: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// サーバーサイドのFirebase Admin初期化
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  storage = getStorage(app);
  firestore = getFirestore(app);

  return { app, auth, storage, firestore };
}

export function getFirebaseAdmin() {
  if (!app) {
    return initializeFirebaseAdmin();
  }
  return { app, auth, storage, firestore };
}

/**
 * ユーザーが管理者かどうかをチェック
 */
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const { auth } = getFirebaseAdmin();
    const user = await auth.getUser(uid);
    
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return user.email ? adminEmails.includes(user.email) : false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * トークンからユーザーIDを取得
 */
export async function verifyIdToken(token: string): Promise<string | null> {
  try {
    const { auth } = getFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * お問い合わせを作成
 */
export async function createContactInquiry(data: Omit<ContactInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ContactInquiry> {
  const { firestore } = getFirebaseAdmin();
  const contactsRef = firestore.collection('contacts');
  
  const now = Timestamp.now();
  const contactData = {
    ...data,
    status: 'new' as const,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await contactsRef.add(contactData);
  
  return {
    id: docRef.id,
    ...contactData,
  };
}

/**
 * お問い合わせ一覧を取得
 */
export async function getContactInquiries(options?: {
  status?: 'new' | 'in_progress' | 'resolved';
  inquiryType?: string;
  limit?: number;
  offset?: number;
}): Promise<ContactInquiry[]> {
  const { firestore } = getFirebaseAdmin();
  let query = firestore.collection('contacts').orderBy('createdAt', 'desc');
  
  if (options?.status) {
    query = query.where('status', '==', options.status) as any;
  }
  
  if (options?.inquiryType) {
    query = query.where('inquiryType', '==', options.inquiryType) as any;
  }
  
  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }
  
  if (options?.offset) {
    query = query.offset(options.offset) as any;
  }
  
  const snapshot = await query.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ContactInquiry[];
}

/**
 * お問い合わせを1件取得
 */
export async function getContactInquiry(id: string): Promise<ContactInquiry | null> {
  const { firestore } = getFirebaseAdmin();
  const docRef = firestore.collection('contacts').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    id: doc.id,
    ...doc.data(),
  } as ContactInquiry;
}

/**
 * お問い合わせのステータスを更新
 */
export async function updateContactStatus(id: string, status: 'new' | 'in_progress' | 'resolved'): Promise<void> {
  const { firestore } = getFirebaseAdmin();
  const docRef = firestore.collection('contacts').doc(id);
  
  await docRef.update({
    status,
    updatedAt: Timestamp.now(),
  });
}

/**
 * お問い合わせの統計を取得
 */
export async function getContactStats(): Promise<{
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
}> {
  const { firestore } = getFirebaseAdmin();
  const contactsRef = firestore.collection('contacts');
  
  const [allSnapshot, newSnapshot, inProgressSnapshot, resolvedSnapshot] = await Promise.all([
    contactsRef.count().get(),
    contactsRef.where('status', '==', 'new').count().get(),
    contactsRef.where('status', '==', 'in_progress').count().get(),
    contactsRef.where('status', '==', 'resolved').count().get(),
  ]);
  
  return {
    total: allSnapshot.data().count,
    new: newSnapshot.data().count,
    inProgress: inProgressSnapshot.data().count,
    resolved: resolvedSnapshot.data().count,
  };
}
