// ---------- Firebase Auth — the entry gate of the app ----------
// Stable email/password authentication (reverted from the passwordless
// email-link flow because Gmail blocks Firebase sign-in link emails).
// One form: if the account does not exist yet we create it (sign up),
// otherwise we sign the user in. A "forgot password" link sends a
// password-reset email via sendPasswordResetEmail().

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
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
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'جیمیل یا رمز عبور اشتباه است. اگر رمز را فراموش کرده‌اید، از لینک «رمز عبورم را فراموش کرده‌ام» استفاده کنید.'
    case 'auth/email-already-in-use':
      return 'این جیمیل قبلاً ثبت‌نام کرده است — با همان رمز وارد شوید.'
    case 'auth/weak-password':
      return 'رمز عبور باید حداقل ۶ رقم باشد.'
    case 'auth/too-many-requests':
      return 'چند بار پشت‌سرهم تلاش کردید — برای محافظت از حساب، کمی صبر کنید و دوباره امتحان کنید.'
    case 'auth/network-request-failed':
      return 'اتصال اینترنتی برقرار نیست — برای ورود به سرور نیاز به اینترنت دارید.'
    case 'auth/configuration-not-found':
      return 'ورود با ایمیل و رمز در کنسول Firebase فعال نیست — بخش Authentication → Sign-in method → Email/Password را روشن کنید.'
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

// ---------- main entry: sign up if new, sign in if exists ----------
export async function registerOrSignIn({ name, email, password }) {
  const cleanName = (name || '').trim()
  const cleanEmail = normalizeEmail(email)
  const pass = password || ''

  if (!cleanName) throw new Error('نام خود را وارد کنید.')
  if (!isGmail(cleanEmail))
    throw new Error('برای ورود باید نشانی جیمیل (…@gmail.com) داشته باشید.')
  if (pass.length < 6)
    throw new Error('رمز عبور باید حداقل ۶ رقم باشد.')

  try {
    // Try to create the account first (this is what most visitors need).
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass)
    console.log('[auth] ✅ account created:', cleanEmail)
    return { ok: true, signedIn: true, user: await finalizeUser(cred.user, cleanName, cleanEmail) }
  } catch (err) {
    if (err && err.code === 'auth/email-already-in-use') {
      // Account exists → fall back to plain sign-in with the same password.
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass)
        console.log('[auth] ✅ signed in:', cleanEmail)
        return { ok: true, signedIn: true, user: await finalizeUser(cred.user, cleanName, cleanEmail) }
      } catch (err2) {
        console.error('🔥 FIREBASE AUTH ERROR CODE:', err2 && err2.code)
        console.error('🔥 FIREBASE AUTH ERROR MESSAGE:', err2 && err2.message)
        throw new Error(friendlyError(err2))
      }
    }
    console.error('🔥 FIREBASE AUTH ERROR CODE:', err && err.code)
    console.error('🔥 FIREBASE AUTH ERROR MESSAGE:', err && err.message)
    throw new Error(friendlyError(err))
  }
}

// Kept for API compatibility with older call-sites.
export async function loginUser({ name, email, password }) {
  const cleanEmail = normalizeEmail(email)
  const pass = password || ''
  if (!isGmail(cleanEmail))
    throw new Error('برای ورود باید نشانی جیمیل (…@gmail.com) داشته باشید.')
  if (!pass) throw new Error('رمز عبور خود را وارد کنید.')
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass)
    console.log('[auth] ✅ signed in:', cleanEmail)
    return { ok: true, signedIn: true, user: await finalizeUser(cred.user, (name || '').trim(), cleanEmail) }
  } catch (err) {
    console.error('🔥 FIREBASE AUTH ERROR CODE:', err && err.code)
    console.error('🔥 FIREBASE AUTH ERROR MESSAGE:', err && err.message)
    throw new Error(friendlyError(err))
  }
}

// ---------- password reset (these emails are NOT blocked by Gmail) ----------
export async function resetPassword(email) {
  const cleanEmail = normalizeEmail(email)
  if (!isGmail(cleanEmail))
    throw new Error('ابتدا جیمیل خود را در فیلد بالا وارد کنید.')
  try {
    await sendPasswordResetEmail(auth, cleanEmail)
    console.log('[auth] ✉️ password-reset email sent to:', cleanEmail)
    return { ok: true }
  } catch (err) {
    console.error('🔥 FIREBASE AUTH ERROR CODE:', err && err.code)
    console.error('🔥 FIREBASE AUTH ERROR MESSAGE:', err && err.message)
    if (err && err.code === 'auth/user-not-found') {
      throw new Error('حسابی با این جیمیل پیدا نشد — ابتدا ثبت‌نام کنید.')
    }
    throw new Error(friendlyError(err))
  }
}

// ---------- logout ----------
export async function logout() {
  await signOut(auth)
}

// ---------- live session listener ----------
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
