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
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
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

// Build the returned user object and best-effort sync the Firestore profile.
async function finalizeUser(user, cleanName, cleanEmail) {
  try {
    if (cleanName && user.displayName !== cleanName) {
      await updateProfile(user, { displayName: cleanName })
    }
  } catch {
    /* non-fatal */
  }
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      { name: cleanName || user.displayName || cleanEmail.split('@')[0], email: cleanEmail },
      { merge: true },
    )
  } catch {
    /* non-fatal: rules may not allow it yet; session still valid */
  }
  return { uid: user.uid, name: cleanName || user.displayName || cleanEmail.split('@')[0], email: cleanEmail }
}

// ---------- one-click register OR sign in (name + gmail + password) ----------
// This is what the AuthGate submit button calls. It NEVER produces the old
// dead-loop ("already registered" → "you are not signed in"): if the email
// exists, we sign in with the given password right here; if it doesn't, we
// create the account and the user is signed in immediately either way.
export async function registerOrSignIn({ name, email, password }) {
  const cleanName = (name || '').trim()
  const cleanEmail = normalizeEmail(email)

  if (!cleanName) throw new Error('نام خود را وارد کنید.')
  if (!isGmail(cleanEmail))
    throw new Error('برای ثبت‌نام باید نشانی جیمیل (…@gmail.com) داشته باشید.')
  if ((password || '').length < 6)
    throw new Error('رمز عبور باید حداقل ۶ رقم باشد.')

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
    const user = await finalizeUser(cred.user, cleanName, cleanEmail)
    return { ok: true, created: true, user }
  } catch (err) {
    const code = err && err.code
    if (code === 'auth/email-already-in-use') {
      // Account exists — try to sign in with the SAME password now.
      try {
        const lcred = await signInWithEmailAndPassword(auth, cleanEmail, password)
        const user = await finalizeUser(lcred.user, cleanName, cleanEmail)
        return { ok: true, alreadyRegistered: true, user }
      } catch (err2) {
        const code2 = err2 && err2.code
        if (code2 === 'auth/wrong-password' || code2 === 'auth/invalid-credential') {
          throw new Error(
            'این جیمیل قبلاً ثبت شده است، اما این رمز عبور برای آن درست نیست. رمز صحیح را وارد کنید یا از «بازیابی رمز عبور» استفاده نمایید.',
          )
        }
        if (code2 === 'auth/too-many-requests') {
          throw new Error('چند بار تلاش کردید — کمی صبر کنید و دوباره امتحان کنید.')
        }
        throw new Error(friendlyError(err2))
      }
    }
    if (code === 'auth/weak-password') {
      throw new Error('رمز عبور باید حداقل ۶ رقم باشد.')
    }
    throw new Error(friendlyError(err))
  }
}

// ---------- register (kept for API compatibility) ----------
export async function registerUser(params) {
  return registerOrSignIn(params)
}

// ---------- login via Firebase Auth ----------
export async function loginUser({ name, email, password }) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail || !password) throw new Error('جیمیل و رمز عبور را وارد کنید.')

  let cred
  try {
    cred = await signInWithEmailAndPassword(auth, cleanEmail, password)
  } catch (err) {
    const code = err && err.code
    // If this project has no such account yet, create it on the spot so the
    // user is never stuck between "not registered" and "not signed in".
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      try {
        const ncred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
        const user = await finalizeUser(ncred.user, (name || '').trim(), cleanEmail)
        return { ok: true, created: true, user }
      } catch (err2) {
        if (err2 && err2.code === 'auth/email-already-in-use') {
          throw new Error(
            'این جیمیل ثبت شده است اما رمز عبور درست نیست. رمز صحیح را وارد کنید یا از «بازیابی رمز عبور» استفاده نمایید.',
          )
        }
        throw new Error(friendlyError(err2))
      }
    }
    throw new Error(friendlyError(err))
  }

  const user = await finalizeUser(cred.user, (name || '').trim(), cleanEmail)
  return { ok: true, user }
}

// ---------- password reset ----------

export async function resetPassword(email) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) throw new Error('ابتدا جیمیل خود را وارد کنید.')
  try {
    await sendPasswordResetEmail(auth, cleanEmail)
  } catch (err) {
    if (err && err.code === 'auth/user-not-found') {
      throw new Error('این جیمیل در برنامه ثبت نشده است — اول «ثبت‌نام» کنید.')
    }
    throw new Error(friendlyError(err))
  }
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
