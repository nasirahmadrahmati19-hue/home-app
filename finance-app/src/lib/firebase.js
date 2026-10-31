// ---------- Firebase configuration (Auth + Firestore) ----------
// Project: myproject-707c8  (Firebase console → Project settings → General → Your apps)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_Ih73FJf6gTh6pQJlMemDD-FrDICY0pE",
  authDomain: "myproject-707c8.firebaseapp.com",
  projectId: "myproject-707c8",
  storageBucket: "myproject-707c8.firebasestorage.app",
  messagingSenderId: "922894348479",
  appId: "1:922894348479:web:ec9d0cef19d6d5a4e7160a"
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
