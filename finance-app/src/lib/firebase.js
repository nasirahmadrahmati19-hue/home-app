// ---------- Firebase configuration (Auth + Firestore) ----------
// Values come from VITE_FIREBASE_* env vars when present, otherwise from the
// fallback constants below. The app is initialized LAZILY and defensively:
// if anything goes wrong here, firebaseReady becomes false and the UI shows a
// readable notice instead of crashing to a white page.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env || {}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyB_Ih73FJf6gTh6pQJlMemDD-FrDICY0pE',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'myproject-707c8.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'myproject-707c8',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'myproject-707c8.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '922894348479',
  appId: env.VITE_FIREBASE_APP_ID || '1:922894348479:web:ec9d0cef19d6d5a4e7160a',
}

export const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith('[') &&
    !firebaseConfig.apiKey.includes('placeholder'),
)

let app = null
let authInstance = null
let dbInstance = null
let initError = ''

if (firebaseReady) {
  try {
    app = initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
  } catch (err) {
    // Never let an initialization crash blank the entire screen.
    initError = (err && err.message) || 'Firebase init failed'
    console.error('[firebase] init failed:', err)
  }
}

export const auth = authInstance
export const db = dbInstance
export const firebaseInitError = initError
export default app
