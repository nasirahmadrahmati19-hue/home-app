// ---------- Firebase configuration (Auth + Firestore) ----------
// Project: NewApp-2026  (Firebase console → Project settings → General → Your apps)
// NOTE: values fall back to the previous project config until the real
// NewApp-2026 credentials are supplied via VITE_FIREBASE_* env vars.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const env = import.meta.env || {}
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyB_Ih73FJf6gTh6pQJlMemDD-FrDICY0pE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "myproject-707c8.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "myproject-707c8",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "myproject-707c8.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "922894348479",
  appId: env.VITE_FIREBASE_APP_ID || "1:922894348479:web:ec9d0cef19d6d5a4e7160a"
};

export const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith('[') &&
    !firebaseConfig.apiKey.includes('placeholder'),
)

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
