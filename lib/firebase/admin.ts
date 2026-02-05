import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App;
let auth: Auth;
let storage: Storage;

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

  return { app, auth, storage };
}

export function getFirebaseAdmin() {
  if (!app) {
    return initializeFirebaseAdmin();
  }
  return { app, auth, storage };
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
