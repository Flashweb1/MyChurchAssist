import { initializeApp, getApps, getApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with persistent cache settings
let db: Firestore;
if (typeof window !== "undefined") {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache(
        /*settings*/ { tabManager: persistentMultipleTabManager() }
      ),
    });
  } catch (err) {
    // Firestore already initialized
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}

export { db };
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export { analytics };
