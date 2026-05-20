import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let adminApp: ReturnType<typeof initializeApp> | null = null;

export function initAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  if (firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
    adminApp = initializeApp({
      credential: cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey,
      }),
    });
  } else {
    adminApp = initializeApp({ projectId: firebaseAdminConfig.projectId });
  }
  return adminApp;
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}

export { getAuth };
