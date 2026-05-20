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

const placeholderKeys = [
  "your-firebase-api-key",
  "your-project.firebaseapp.com",
  "your-project-id",
  "your-measurement-id",
];

if (Object.values(firebaseConfig).some((value) => !value || placeholderKeys.some((placeholder) => value?.includes(placeholder)))) {
  throw new Error(
    "Firebase environment variables are not configured correctly. " +
      "Verify NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, " +
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID, " +
      "and NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID in your environment settings."
  );
}

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
