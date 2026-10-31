import { useState } from 'react'
import { Wallet2, UserPlus, LogIn, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { registerUser, loginUser } from '../utils/auth'

export default function AuthGate({ onAuthed }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const hasUsers = typeof window !== 'undefined' &&
    (() => { try { return JSON.parse(localStorage.getItem('finance_app_users') || '[]').length > 0 } catch { return false } })()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res =
        mode === 'register'
          ? await registerUser({ name, username, password })
          : await loginUser({ username, password })
      if (!res.ok) {
        setError(res.error)
      } else {
        onAuthed(res.user)
      }
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
  }

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* ---------- Brand ---------- */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center animate-fade-up">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-white/20">
            <Wallet2 size={30} strokeWidth={2.2} />
          </span>
          <h1 className="text-gradient text-2xl font-black tracking-tight">مدیریت مالی شخصی</h1>
          <p className="t-muted text-[13px] font-bold">برای ورود، ابتدا ثبت‌نام کنید 🔒</p>
        </div>

        {/* ---------- Card ---------- */}
        <div className="card-raised animate-fade-up px-6 py-7 sm:px-8" style={{ animationDelay: '0.1s' }}>
          {/* tabs: login / register */}
          <div className="inset-panel mb-6 grid grid-cols-2 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow-md'
                  : 't-muted hover:text-white'
              }`}
            >
              <LogIn size={16} /> وارد شدن
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow-md'
                  : 't-muted hover:text-white'
              }`}
            >
              <UserPlus size={16} /> ثبت‌نام
            </button>
          </div>

          {/* first-time hint */}
          {mode === 'login' && !hasUsers && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px] font-bold text-amber-500">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              هنوز کاربری ثبت نشده است — اول از سرِ «ثبت‌نام» یک حساب بسازید.
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="t-body mb-1.5 block text-[13px] font-black">نام شما</label>
                <input
                  className="field-input w-full"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً احمد"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="t-body mb-1.5 block text-[13px] font-black">نام کاربری</label>
              <input
                className="field-input w-full"
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ahmad123"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="t-body mb-1.5 block text-[13px] font-black">رمز عبور</label>
              <div className="relative">
                <input
                  className="field-input w-full pl-11"
                  type={showPass ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="t-faint absolute left-2 top-1/2 -translate-y-1/2 p-1.5 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'پنهان کردن رمز' : 'نمایش رمز'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="t-faint mt-1.5 text-[11px] font-bold">حداقل ۴ رقم — فقط روی همین دستگاه ذخیره می‌شود</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-[13px] font-black text-rose-400 animate-fade-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === 'register' ? (
                <>
                  <UserPlus size={18} /> ساخت حساب و ورود
                </>
              ) : (
                <>
                  <LogIn size={18} /> وارد شدن
                </>
              )}
            </button>
          </form>

          <p className="t-faint mt-5 text-center text-[11px] font-bold">
            🇦🇫 نام‌های کاربری و رمزها فقط در حافظه همین دستگاه نگهداری می‌شوند
          </p>
        </div>
      </div>
    </div>
  )
}
