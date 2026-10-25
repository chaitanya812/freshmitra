import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every(
  value => typeof value === "string" && value.length > 0 && !value.startsWith("your_")
);

let app;
export let auth = null;
export let db = null;

if (firebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}

export async function ensureAnonymousSession() {
  if (!firebaseConfigured || !auth) return null;
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}
