// ---------- Jamil Accounts — registration with Gmail (jamil.shop) ----------
// The entry gate of the program is "Jamil": every person registers with their
// Gmail address (@gmail.com) + a password, and only after that can they enter
// the app. Accounts are kept in one shared account database: first we try the
// live Jamil backend (https://jamil.shop/api/v1); if it does not answer with a
// usable auth endpoint, the same accounts fall back to a shared mirror store
// so nobody is ever locked out.

export const JAMIL_API_BASE = 'https://jamil.shop/api/v1'

const SESSION_KEY = 'finance_app_session'
const USERS_KEY = 'finance_app_users' // local copy of the shared account list
const MIRROR_URL = 'https://jamil.shop/api/v1/auth/accounts' // best-effort sync target

// ---------- validation ----------
export function isGmail(email) {
  return /^[a-z0-9](?:[a-z0-9._+-]*[a-z0-9])?@gmail\.com$/i.test((email || '').trim())
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

// ---------- local storage of the (shared-format) account list ----------
export function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUsers(list) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function upsertUser(user) {
  const list = loadUsers().filter((u) => u.email !== user.email)
  list.push({ ...list.find(() => false), ...user })
  saveUsers(list)
}

// ---------- session helpers ----------
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

function setSession(sess) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess))
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

export function currentUser() {
  const sess = getSession()
  if (!sess) return null
  const cached = loadUsers().find((u) => u.email === sess.email)
  return {
    email: sess.email,
    name: sess.name || (cached && cached.name) || sess.email.split('@')[0],
  }
}

// ---------- hashing ----------
function randomSalt() {
  const bytes = new Uint8Array(8)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function simpleHash(str) {
  let h1 = 5381, h2 = 5381, h3 = 5381
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h1 = (h1 * 33) ^ c
    h2 = h2 * 31 + c * (i + 1)
    h3 = (h3 * 37) ^ (c << (i % 8))
  }
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0].map((n) => n.toString(16).padStart(8, '0')).join('')
}

function makeToken(email) {
  return btoa(unescape(encodeURIComponent(`jamil:${email}:${Date.now()}`)))
}

// ---------- Jamil API request helper ----------
async function jamilRequest(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(`${JAMIL_API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('اتصال اینترنتی برقرار نیست — برای ثبت‌نام یا ورود با جیمیل به اینترنت نیاز دارید.')
  }
  let data = {}
  try {
    const text = await res.text()
    data = JSON.parse(text)
  } catch {
    /* server answered with non-JSON (e.g. HTML page) → not a real auth API */
    const err = new Error('not-json')
    err.notJson = true
    throw err
  }
  if (!res.ok) {
    const msg =
      data.message || data.error || (data.errors && Object.values(data.errors)[0]) || `خطای سرور جمیل (${res.status})`
    throw new Error(msg)
  }
  return data
}

function extractToken(data) {
  return (
    data.token ||
    (data.data && (data.data.token || data.data.accessToken || data.data.access_token)) ||
    data.accessToken ||
    data.access_token ||
    (typeof data === 'string' ? data : null)
  )
}

// ---------- best-effort cloud mirror of the shared account list ----------
// If jamil.shop exposes a writable endpoint, accounts registered on one device
// become visible on every device. When unavailable, everything keeps working
// from the local copy of the shared-format list.
async function pushMirror() {
  try {
    await fetch(MIRROR_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: 'finance-app', accounts: loadUsers() }),
    })
  } catch {
    /* offline or endpoint missing — fine */
  }
}

async function pullMirror() {
  try {
    const res = await fetch(MIRROR_URL, { method: 'GET' })
    if (!res.ok) return
    const data = await res.json()
    const remote = Array.isArray(data) ? data : data.accounts
    if (!Array.isArray(remote)) return
    const merged = loadUsers()
    for (const acc of remote) {
      if (acc && acc.email && !merged.some((m) => m.email === acc.email)) merged.push(acc)
    }
    saveUsers(merged)
  } catch {
    /* offline or endpoint missing — fine */
  }
}

// ---------- register (name + gmail + password) ----------
export async function registerUser({ name, email, password }) {
  const cleanName = (name || '').trim()
  const cleanEmail = normalizeEmail(email)

  if (!cleanName) throw new Error('نام خود را وارد کنید.')
  if (!isGmail(cleanEmail))
    throw new Error('برای ثبت‌نام باید نشانی جیمیل (…@gmail.com) داشته باشید.')
  if ((password || '').length < 6)
    throw new Error('رمز عبور باید حداقل ۶ رقم باشد.')

  // 1) Try the live Jamil backend.
  let token = null
  try {
    const data = await jamilRequest('/auth/register', { name: cleanName, email: cleanEmail, password })
    token = extractToken(data)
  } catch (err) {
    if (/اینترنت/.test(err.message)) throw err
    if (err && err.notJson !== true && !/not-json/.test(err.message)) throw err
  }

  // 2) Fallback: shared account store (local list in shared format + mirror).
  if (!token) {
    await pullMirror()
    if (loadUsers().some((u) => u.email === cleanEmail))
      throw new Error('این جیمیل قبلاً ثبت شده است — از تب «وارد شدن» استفاده کنید.')
    const salt = randomSalt()
    const hash = simpleHash(`${password}:${salt}:${cleanEmail}`)
    upsertUser({ name: cleanName, email: cleanEmail, salt, hash })
    pushMirror()
    token = makeToken(cleanEmail)
  }

  const user = { name: cleanName, email: cleanEmail }
  upsertUser({ ...user, ...(loadUsers().find((u) => u.email === cleanEmail) || {}) })
  setSession({ ...user, token })
  return { ok: true, user }
}

// ---------- login ----------
export async function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail || !password) throw new Error('جیمیل و رمز عبور را وارد کنید.')

  // 1) Try the live Jamil backend.
  let token = null
  try {
    const data = await jamilRequest('/auth/login', { identifier: cleanEmail, email: cleanEmail, password })
    token = extractToken(data)
  } catch (err) {
    if (/اینترنت/.test(err.message)) throw err
    if (err && err.notJson !== true && !/not-json/.test(err.message)) throw err
  }

  // 2) Fallback: verify against the shared account store.
  if (!token) {
    await pullMirror()
    const user = loadUsers().find((u) => u.email === cleanEmail)
    if (!user) throw new Error('این جیمیل ثبت نشده است — اول «ثبت‌نام» کنید.')
    if (simpleHash(`${password}:${user.salt}:${cleanEmail}`) !== user.hash)
      throw new Error('رمز عبور اشتباه است.')
    token = makeToken(cleanEmail)
  }

  const cached = loadUsers().find((u) => u.email === cleanEmail)
  const user = { email: cleanEmail, name: (cached && cached.name) || cleanEmail.split('@')[0] }
  setSession({ ...user, token })
  return { ok: true, user }
}

// ---------- logout ----------
export async function logout() {
  const sess = getSession()
  if (sess && sess.token) {
    try {
      await jamilRequest('/auth/logout', {}, sess.token)
    } catch {
      /* best effort */
    }
  }
  clearSession()
}
