import { useState, forwardRef } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

/**
 * PasswordInput — فیلد رمز عبور با آیکون چشم (نمایش/مخفی)
 * - سازگار با تم تاریک/روشن (کلاس field-input و متغیرهای CSS برنامه)
 * - فقط UI است؛ هیچ داده‌ای از فایربیس پاک یا تغییر نمی‌کند.
 */
const PasswordInput = forwardRef(function PasswordInput(
  { value, onChange, placeholder = '••••••', autoComplete = 'current-password', minLength = 6, required = true, dir = 'ltr', id },
  ref
) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Lock size={16} className="t-faint pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
      <input
        ref={ref}
        id={id}
        className="field-input w-full pr-10 pl-11"
        type={show ? 'text' : 'password'}
        dir={dir}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
      />
      {/* دکمه نمایش/مخفی کردن رمز — type=button تا فرم را submit نکند */}
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
        title={show ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-teal-500 transition-all hover:bg-teal-400/10 active:scale-90"
      >
        {show ? <EyeOff size={17} strokeWidth={2.2} /> : <Eye size={17} strokeWidth={2.2} />}
      </button>
    </div>
  )
})

export default PasswordInput
