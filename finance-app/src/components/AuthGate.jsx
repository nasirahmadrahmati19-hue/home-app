import { useEffect, useState } from 'react'
import { Wallet2, Send, Loader2, ShieldCheck, AtSign } from 'lucide-react'
import { sendLoginLink, completeSignInFromLink } from '../utils/auth'

export default function AuthGate({ onAuthed }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [linkBusy, setLinkBusy] = useState(true) // check the URL on first paint

  // If the user arrived by clicking the email sign-in link, finish login.
  useEffect(() => {
    let alive = true
    completeSignInFromLink(name)
      .then((res) => {
        if (alive && res && res.user) onAuthed(res.user)
      })
      .catch((err) => {
        if (alive) setError(err.message || 'ورود با لینک ممکن نشد — دوباره تلاش کنید.')
      })
      .finally(() => {
        if (alive) setLinkBusy(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ONE form: enter your name + gmail, we email you a sign-in link.
  // There is NO password field anymore — login is only via Gmail.
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await sendLoginLink({ name, email })
      setInfo('✉️ لینک ورود برای شما ایمیل شد — صندوق جیمیل خود را باز کنید و روی «Sign in» کلیک کنید.')
    } catch (err) {
      setError(err.message || 'مشکلی پیش آمد — دوباره تلاش کنید.')
    } finally {
      setBusy(false)
    }
  }

  if (linkBusy) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center px-4 py-10">
        <Loader2 size={28} className="animate-spin text-teal-400" />
      </div>
    )
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
          <p className="t-muted text-[13px] font-bold">ورود فقط با جیمیل — بدون رمز عبور ✉️</p>
        </div>

        {/* ---------- Card ---------- */}
        <div className="card-raised animate-fade-up px-6 py-7 sm:px-8" style={{ animationDelay: '0.1s' }}>
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-[13px] font-bold text-teal-500">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            نام و جیمیل خود را وارد کنید؛ یک لینک امن به ایمیل شما می‌فرستیم. با کلیک روی لینک، مستقیم وارد برنامه می‌شوید. رمز عبوری وجود ندارد!
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="t-body mb-1.5 block text-[13px] font-black">نام شما</label>
              <input
                className="field-input w-full"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً احمد رضا"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="t-body mb-1.5 block text-[13px] font-black">جیمیل (Gmail)</label>
              <div className="relative">
                <AtSign size={16} className="t-faint absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  className="field-input w-full pr-10"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>
              <p className="t-faint mt-1.5 text-[11px] font-bold">فقط نشانی‌های @gmail.com پذیرفته می‌شوند</p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-[13px] font-black text-rose-400 animate-fade-up">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-black text-emerald-400 animate-fade-up">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} /> ارسال لینک ورود به جیمیل
                </>
              )}
            </button>
          </form>

          <p className="t-faint mt-5 text-center text-[11px] font-bold">
            ☁️ حساب‌ها روی Firebase نگهداری می‌شوند — هر کس با جیمیل خود از هر دستگاهی وارد شود
          </p>
        </div>
      </div>
    </div>
  )
}
