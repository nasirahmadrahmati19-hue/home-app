// ---------- Firebase configuration (Auth + Firestore) ----------
// Put the values from your Firebase console here:
// Project settings → General → Your apps → SDK setup and configuration → Config
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '[API_KEY_خود_را_اینجا_بگذارید]',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '[AUTH_DOMAIN_خود_را_اینجا_بگذارید]',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '[PROJECT_ID_خود_را_اینجا_بگذارید]',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '[STORAGE_BUCKET_خود_را_اینجا_بگذارید]',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '[MESSAGING_SENDER_ID_خود_را_اینجا_بگذارید]',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '[APP_ID_خود_را_اینجا_بگذارید]',
}

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('['),
)

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
