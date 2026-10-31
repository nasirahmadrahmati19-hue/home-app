// ---------- Simple local (device-only) authentication ----------
// Users are stored in localStorage. Passwords are hashed with SHA-256 + random salt
// via the Web Crypto API when available; a lightweight fallback hash is used for
// non-secure contexts (e.g. plain http previews).

const USERS_KEY = 'finance_app_users'
const SESSION_KEY = 'finance_app_session'

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(list) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list))
  } catch {
    /* storage full / unavailable — ignore */
  }
}

export function getSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || null
  } catch {
    return null
  }
}

export function setSession(username) {
  try {
    localStorage.setItem(SESSION_KEY, username)
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

function randomHex(len) {
  const bytes = new Uint8Array(len / 2)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// Fallback hash (djb2 x3 variants) for environments without SubtleCrypto
function fallbackHash(str) {
  let h1 = 5381, h2 = 5381, h3 = 5381
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h1 = (h1 * 33) ^ c
    h2 = (h2 * 31) + c * (i + 1)
    h3 = (h3 * 37) ^ (c << (i % 8))
  }
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0].map((n) => n.toString(16).padStart(8, '0')).join('')
}

export async function hashPassword(password, salt) {
  const input = `${salt}:${password}`
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
      return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
    } catch {
      /* fall through to fallback */
    }
  }
  return `f$${fallbackHash(input)}$${input.length}`
}

// Returns { ok: true, user } or { ok: false, error }
export async function registerUser({ name, username, password }) {
  const cleanName = (name || '').trim()
  const cleanUser = (username || '').trim().toLowerCase()

  if (!cleanName) return { ok: false, error: 'نام را وارد کنید.' }
  if (cleanUser.length < 3) return { ok: false, error: 'نام کاربری باید حداقل ۳ حرف باشد.' }
  if (!/^[a-z0-9_.@-]+$/.test(cleanUser))
    return { ok: false, error: 'نام کاربری فقط می‌تواند حروف انگلیسی، عدد، _ . @ - باشد.' }
  if ((password || '').length < 4) return { ok: false, error: 'رمز عبور باید حداقل ۴ رقم باشد.' }

  const users = loadUsers()
  if (users.some((u) => u.username === cleanUser))
    return { ok: false, error: 'این نام کاربری قبلاً ثبت شده است.' }

  const salt = randomHex(16)
  const hash = await hashPassword(password, salt)
  const user = {
    name: cleanName,
    username: cleanUser,
    salt,
    hash,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, user])
  setSession(user.username)
  return { ok: true, user }
}

// Returns { ok: true, user } or { ok: false, error }
export async function loginUser({ username, password }) {
  const cleanUser = (username || '').trim().toLowerCase()
  if (!cleanUser || !password) return { ok: false, error: 'نام کاربری و رمز عبور را وارد کنید.' }

  const users = loadUsers()
  const user = users.find((u) => u.username === cleanUser)
  if (!user) return { ok: false, error: 'کاربری با این نام کاربری یافت نشد. اول ثبت‌نام کنید.' }

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.hash) return { ok: false, error: 'رمز عبور اشتباه است.' }

  setSession(user.username)
  return { ok: true, user }
}

export function currentUser() {
  const s = getSession()
  if (!s) return null
  const user = loadUsers().find((u) => u.username === s)
  return user || null
}
