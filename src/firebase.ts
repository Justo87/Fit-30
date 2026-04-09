import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, onSnapshot, orderBy, limit, getDocFromServer } from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json';

// Error handling for Firestore operations as required by instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "PLACEHOLDER";

// Initialize Firebase
let app: any;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
} else {
  // Use a dummy config that passes initialization but will fail on actual calls
  // This prevents the "api-key-not-valid" error on startup.
  app = initializeApp({
    apiKey: "AIzaSyDummyKeyForInitializationOnly",
    authDomain: "dummy.firebaseapp.com",
    projectId: "dummy-project",
    appId: "1:1:web:1"
  });
  console.warn("Firebase is not configured. Using dummy initialization to prevent crash.");
}

export const auth = getAuth(app);
// Ensure persistence is set to local
setPersistence(auth, browserLocalPersistence).catch(err => console.error("Auth persistence error:", err));

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const googleProvider = new GoogleAuthProvider();

export { isFirebaseConfigured };

export const signIn = () => signInWithPopup(auth, googleProvider);
export const signOut = () => auth.signOut();

// Test connection to Firestore
async function testConnection() {
  if (!isFirebaseConfigured) return;
  try {
    // We use getDocFromServer to force a network request and verify configuration
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified successfully.");
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      // This is actually a good sign! It means we reached the server but rules blocked us.
      console.log("Firebase reached: Permission denied (expected if 'test/connection' doesn't exist or rules are strict).");
      return;
    }
    
    if (error?.message?.includes('the client is offline') || error?.code === 'unavailable') {
      console.error("Firebase Error: The client is offline or the project ID/Database ID is incorrect. Please verify your projectId in firebase-applet-config.json.");
    } else {
      console.error("Firebase Connection Test Failed:", error);
    }
  }
}
testConnection();
