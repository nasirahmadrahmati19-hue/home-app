import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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
      <input
        ref={ref}
        id={id}
        className="field-input w-full pr-11 pl-3"
        type={show ? 'text' : 'password'}
        dir={dir}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
      />
      {/* دکمه نمایش/مخفی کردن رمز — سمت راست فیلد (در چیدمان RTL) — type=button تا فرم را submit نکند */}
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
        title={show ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-teal-500 transition-all hover:bg-teal-400/10 active:scale-90"
      >
        {show ? <EyeOff size={17} strokeWidth={2.2} /> : <Eye size={17} strokeWidth={2.2} />}
      </button>
    </div>
  )
})

export default PasswordInput
