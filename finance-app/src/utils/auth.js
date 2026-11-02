// ---------- Firebase Auth — the entry gate of the app ----------
// Login is passwordless: the user only enters their Gmail address and a
// magic sign-in link is sent to that inbox via Firebase Email Link
// (sendSignInLinkToEmail + signInWithEmailLink). There is NO password field
// and NO localStorage-based sessions: auth state is kept by Firebase itself.

import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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

const EMAIL_KEY = 'authEmailForLink'

// Human-readable Persian messages for Firebase error codes.
function friendlyError(err) {
  const code = err && (err.code || '')
  switch (code) {
    case 'auth/invalid-email':
      return 'نشانی ایمیل معتبر نیست.'
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'لینک ورود نامعتبر یا منقضی شده است — دوباره درخواست لینک جدید بدهید.'
    case 'auth/too-many-requests':
      return 'چند بار تلاش کردید — کمی صبر کنید و دوباره امتحان کنید.'
    case 'auth/network-request-failed':
      return 'اتصال اینترنتی برقرار نیست — برای ورود به سرور نیاز به اینترنت دارید.'
    case 'auth/configuration-not-found':
      return 'ورود با لینک ایمیلی در کنسول Firebase فعال نیست — بخش Authentication → Sign-in method → Email link را روشن کنید.'
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

// The action URL settings for the magic sign-in link.
function emailLinkSettings() {
  return {
    url: typeof window !== 'undefined' ? window.location.origin : '',
    handleCodeInApp: true,
  }
}

// ---------- send the magic sign-in link (passwordless) ----------
export async function sendLoginLink({ name, email }) {
  const cleanName = (name || '').trim()
  const cleanEmail = normalizeEmail(email)

  if (!cleanName) throw new Error('نام خود را وارد کنید.')
  if (!isGmail(cleanEmail))
    throw new Error('برای ورود باید نشانی جیمیل (…@gmail.com) داشته باشید.')

  try {
    await sendSignInLinkToEmail(auth, cleanEmail, emailLinkSettings())
    // Remember which address the link was requested for, so that when the
    // user clicks the link (possibly in another tab) we can complete sign-in.
    try {
      window.localStorage.setItem(EMAIL_KEY, cleanEmail)
    } catch {
      /* storage may be unavailable; sign-in still works if same tab */
    }
    console.log('[auth] ✉️ sign-in link sent to:', cleanEmail)
    return { ok: true, sent: true, email: cleanEmail }
  } catch (err) {
    console.error('🔥 FIREBASE AUTH ERROR CODE:', err && err.code)
    console.error('🔥 FIREBASE AUTH ERROR MESSAGE:', err && err.message)
    throw new Error(friendlyError(err))
  }
}

// ---------- complete sign-in when the URL contains the email link ----------
export async function completeSignInFromLink(name) {
  if (typeof window === 'undefined' || !auth) return null
  if (!isSignInWithEmailLink(auth, window.location.href)) return null

  let email = ''
  try {
    email = window.localStorage.getItem(EMAIL_KEY) || ''
  } catch {
    /* ignore */
  }
  if (!email) return null // user must re-enter their gmail and request a link

  const cred = await signInWithEmailLink(auth, email, window.location.href)
  try {
    window.localStorage.removeItem(EMAIL_KEY)
  } catch {
    /* ignore */
  }
  const cleanEmail = normalizeEmail(email)
  const user = await finalizeUser(cred.user, (name || '').trim(), cleanEmail)
  // Clean the magic-link query params out of the address bar.
  try {
    window.history.replaceState({}, '', window.location.origin + window.location.pathname)
  } catch {
    /* ignore */
  }
  console.log('[auth] ✅ signed in via email link:', cleanEmail)
  return { ok: true, user }
}

// Kept for API compatibility with older call-sites (no password anymore).
export async function registerOrSignIn({ name, email }) {
  return sendLoginLink({ name, email })
}

export async function loginUser({ name, email }) {
  return sendLoginLink({ name, email })
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
