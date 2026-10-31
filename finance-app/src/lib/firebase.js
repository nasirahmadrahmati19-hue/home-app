// ---------- Firebase configuration (Auth + Firestore) ----------
// Project: home-app-jalali  (Firebase console → Project settings → General → Your apps)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDZK03QzqJnR0eS4gU7Yh1X2V9B8C6D5E4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'home-app-jalali.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'home-app-jalali',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'home-app-jalali.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
}

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('['),
)

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
