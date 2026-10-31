// ---------- Firebase Auth — the entry gate of the app ----------
// Every person registers with their Gmail address (@gmail.com) + a password
// through Firebase Authentication (createUserWithEmailAndPassword), and only
// after that can they enter the app. There is NO localStorage involved:
// sessions are kept by Firebase itself (browser session persistence).

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function isGmail(email) {
  return /^[a-z0-9](?:[a-z0-9._+-]*[a-z0-9])?@gmail\.com$/i.test((email || '').trim())
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

// Human-readable Persian messages for Firebase error codes.
function friendlyError(err) {
  const code = err && (err.code || '')
  switch (code) {
    case 'auth/invalid-email':
      return 'نشانی ایمیل معتبر نیست.'
    case 'auth/email-already-in-use':
      return 'این جیمیل قبلاً ثبت شده است — از تب «وارد شدن» استفاده کنید.'
    case 'auth/weak-password':
      return 'رمز عبور باید حداقل ۶ رقم باشد.'
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'این جیمیل ثبت نشده است — اول «ثبت‌نام» کنید.'
    case 'auth/wrong-password':
      return 'رمز عبور اشتباه است.'
    case 'auth/too-many-requests':
      return 'چند بار تلاش کردید — کمی صبر کنید و دوباره امتحان کنید.'
    case 'auth/network-request-failed':
      return 'اتصال اینترنتی برقرار نیست — برای ورود به سرور نیاز به اینترنت دارید.'
    case 'auth/configuration-not-found':
      return 'ورود با ایمیل در کنسول Firebase فعال نیست — بخش Authentication → Sign-in method را باز کنید.'
    default:
      if (/network/i.test(err && err.message)) {
        return 'اتصال اینترنتی برقرار نیست — برای ورود به سرور نیاز به اینترنت دارید.'
      }
      return (err && err.message) || 'مشکلی پیش آمد — دوباره تلاش کنید.'
  }
}

// ---------- register (name + gmail + password) via Firebase Auth ----------
export async function registerUser({ name, email, password }) {
  const cleanName = (name || '').trim()
  const cleanEmail = normalizeEmail(email)

  if (!cleanName) throw new Error('نام خود را وارد کنید.')
  if (!isGmail(cleanEmail))
    throw new Error('برای ثبت‌نام باید نشانی جیمیل (…@gmail.com) داشته باشید.')
  if ((password || '').length < 6)
    throw new Error('رمز عبور باید حداقل ۶ رقم باشد.')

  let cred
  try {
    cred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
  } catch (err) {
    throw new Error(friendlyError(err))
  }

  try {
    await updateProfile(cred.user, { displayName: cleanName })
  } catch {
    /* non-fatal */
  }

  // Profile document in Firestore: users/{uid}
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: cleanName,
      email: cleanEmail,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    throw new Error(friendlyError(err))
  }

  return { ok: true, user: { uid: cred.user.uid, name: cleanName, email: cleanEmail } }
}

// ---------- login via Firebase Auth ----------
export async function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail || !password) throw new Error('جیمیل و رمز عبور را وارد کنید.')

  let cred
  try {
    cred = await signInWithEmailAndPassword(auth, cleanEmail, password)
  } catch (err) {
    throw new Error(friendlyError(err))
  }

  const name = cred.user.displayName || cleanEmail.split('@')[0]

  // Best-effort: keep the profile document up to date.
  try {
    await setDoc(
      doc(db, 'users', cred.user.uid),
      { name, email: cleanEmail, lastLoginAt: serverTimestamp() },
      { merge: true },
    )
  } catch {
    /* non-fatal */
  }

  return { ok: true, user: { uid: cred.user.uid, name, email: cleanEmail } }
}

// ---------- logout ----------
export async function logout() {
  await signOut(auth)
}

// ---------- live session listener (replaces getSession/currentUser) ----------
export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, (fu) => {
    callback(
      fu
        ? {
            uid: fu.uid,
            email: (fu.email || '').toLowerCase(),
            name: fu.displayName || (fu.email || '').split('@')[0],
          }
        : null,
    )
  })
}

// Read the stored Firestore profile (name may be missing on old accounts).
export async function fetchProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data() : null
  } catch {
    return null
  }
}
