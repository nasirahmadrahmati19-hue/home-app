import { toLatinDigits } from '../utils/persian'

/**
 * Numeric input that accepts Persian (۰-۹) / Arabic (٠-٩) digits,
 * converts them to Latin digits and formats with thousand separators.
 */
export default function PersianNumberInput({ value, onChange, placeholder, id, className = '' }) {
  const handleChange = (e) => {
    const latin = toLatinDigits(e.target.value).replace(/[^\d]/g, '')
    const formatted = latin ? Number(latin).toLocaleString('en-US').replace(/,/g, '٬') : ''
    onChange(formatted)
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      dir="ltr"
      className={
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left font-vazir ' +
        'placeholder:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ' +
        className
      }
      style={{ textAlign: 'right' }}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
  )
}
