import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDummyKeyForPrerenderEnv",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "campuscart-dummy.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "campuscart-dummy",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "campuscart-dummy.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:dummy",
};

export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);