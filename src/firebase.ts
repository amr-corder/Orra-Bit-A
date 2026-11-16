import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const ROOT_ADMIN_EMAIL = 'maro.mahrous67@gmail.com';

export interface FriendlyAuthError {
  message: string;
  isPopupIssue: boolean;
}

export function formatFirebaseAuthError(error: unknown): FriendlyAuthError {
  const raw = error instanceof Error ? error.message : String(error);
  const codeMatch = raw.match(/auth\/[a-z-]+/);
  const code = codeMatch ? codeMatch[0] : '';

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request'
  ) {
    return {
      isPopupIssue: true,
      message:
        'The Google sign-in popup was closed before completing authentication (often due to embedded iframe restrictions). Open the dashboard in a standalone tab or enable popups and try again.'
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      isPopupIssue: true,
      message:
        'The browser blocked the Google sign-in popup. Please allow popups for this site or open it in a standalone tab.'
    };
  }

  if (code === 'auth/unauthorized-domain') {
    return {
      isPopupIssue: false,
      message:
        'The current domain is not listed in Firebase Auth Authorized Domains.'
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      isPopupIssue: false,
      message: 'Unable to reach Google authentication servers. Check your connection and try again.'
    };
  }

  return {
    isPopupIssue: false,
    message: `Sign-in failed: ${raw}`
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'storeSettings', 'main'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration — Firestore client is offline.');
      return false;
    }
    return true;
  }
}

testFirestoreConnection();
