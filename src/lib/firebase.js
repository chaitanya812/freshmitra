import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword, EmailAuthProvider, getAuth, linkWithCredential,
  onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut, updateEmail, updateProfile
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredConfig = [
  config.apiKey,
  config.authDomain,
  config.projectId,
  config.storageBucket,
  config.messagingSenderId,
  config.appId,
];

export const firebaseConfigured = requiredConfig.every(
  value => typeof value === "string" && value.length > 0 && !value.startsWith("your_")
);

export let auth = null;
export let db = null;
export let analytics = null;
export { onAuthStateChanged };

if (firebaseConfigured) {
  const app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);

  if (config.measurementId) {
    isSupported().then(supported => {
      if (supported) analytics = getAnalytics(app);
    }).catch(error => {
      console.error("Freshmitra Analytics could not be initialized:", error);
    });
  }
}

export async function ensureAnonymousSession() {
  if (!firebaseConfigured || !auth) return null;
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function registerAccount({ name, email, password }) {
  if (!auth) throw new Error("Firebase Authentication is not configured.");
  const credential = EmailAuthProvider.credential(email, password);
  const currentUser = auth.currentUser;
  const result = currentUser?.isAnonymous
    ? await linkWithCredential(currentUser, credential)
    : await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  return result.user;
}

export async function signInAccount({ email, password }) {
  if (!auth) throw new Error("Firebase Authentication is not configured.");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOutAccount() {
  if (!auth) throw new Error("Firebase Authentication is not configured.");
  await signOut(auth);
}

export async function updateAccountProfile({ name, email }) {
  const user = auth?.currentUser;
  if (!user || user.isAnonymous) throw new Error("Sign in to update your account profile.");
  if (email !== user.email) await updateEmail(user, email);
  if (name !== user.displayName) await updateProfile(user, { displayName: name });
  return user;
}
