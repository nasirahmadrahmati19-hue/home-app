import { useState } from 'react'
import { Plus, Receipt, Trash2, CalendarDays, ClipboardList, AlertCircle } from 'lucide-react'
import PersianNumberInput from './PersianNumberInput'
import { parseAmount, formatMoney, toFa, todayISO, formatJalaliDate } from '../utils/persian'
import { expenseMeta } from '../utils/categoryMeta'

const CATEGORIES = ['اجاره', 'غذا', 'حمل‌ونقل', 'قبوض', 'خرید', 'پزشکی', 'سرگرمی', 'سایر']

export default function ExpensesTab({ expenses, onAdd, onDelete }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('لطفاً مبلغ معتبر وارد کنید (مثلاً ۲٬۵۰۰٬۰۰۰)')
      return
    }
    if (!date) {
      setError('تاریخ را انتخاب کنید')
      return
    }
    onAdd({ amount: value, category, description: description.trim(), date })
    setAmount('')
    setDescription('')
    setError('')
  }

  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1))
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* ---------- Form ---------- */}
      <form onSubmit={submit} className="glass relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-rose-500/15 blur-3xl" />

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400/25 to-orange-400/10 text-rose-300 ring-1 ring-rose-400/30">
              <Receipt size={21} />
            </span>
            <h2 className="text-lg font-black text-white">ثبت هزینه جدید</h2>
          </div>
          <span className="glass-soft hidden px-3.5 py-1.5 text-xs font-bold text-rose-300 sm:block">
            مجموع: {formatMoney(total)} تومان
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="expense-amount" className="field-label">مبلغ (تومان)</label>
            <PersianNumberInput
              id="expense-amount"
              value={amount}
              onChange={setAmount}
              placeholder="۲٬۵۰۰٬۰۰۰"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="expense-category" className="field-label">دسته‌بندی</label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field-input cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="expense-desc" className="field-label">توضیح (اختیاری)</label>
            <input
              id="expense-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً خرید هفتگی"
              className="field-input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="expense-date" className="field-label">تاریخ</label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field-input cursor-pointer"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300">
            <AlertCircle size={16} />
            {error}
          </p>
        )}

        <button
          type="submit"
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-rose-500 to-orange-500 px-5 py-3.5 font-extrabold text-white shadow-lg shadow-rose-500/30 ring-1 ring-white/20 transition-all duration-300 hover:shadow-rose-500/50 hover:brightness-110 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={19} className="transition-transform duration-300 group-hover:rotate-90" />
          افزودن هزینه
        </button>
      </form>

      {/* ---------- List ---------- */}
      <div className="glass p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-white">مصارف ثبت‌شده</h3>
          <span className="rounded-full bg-rose-400/15 px-3.5 py-1 text-xs font-bold text-rose-300 ring-1 ring-rose-400/25">
            {toFa(expenses.length)} مورد
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20">
              <ClipboardList size={28} />
            </span>
            <p className="text-sm font-bold text-slate-400">
              هنوز هزینه‌ای ثبت نشده است 🧾
              <br />
              با افزودن اولین هزینه شروع کنید
            </p>
          </div>
        ) : (
          <ul className="stagger divide-y divide-white/[0.06]">
            {sorted.map((item) => {
              const meta = expenseMeta(item.category)
              const Icon = meta.icon
              return (
                <li
                  key={item.id}
                  className="group flex items-center justify-between gap-3 rounded-xl px-2 py-4 transition-colors duration-200 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.chip} ${meta.text} ring-1 ${meta.ring} backdrop-blur`}
                    >
                      <Icon size={19} />
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-100">
                        {item.category}
                        {item.description && (
                          <span className="mr-2 text-sm font-bold text-slate-400">— {item.description}</span>
                        )}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <CalendarDays size={12} />
                        {formatJalaliDate(item.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-xl bg-rose-400/10 px-3 py-1.5 font-black text-rose-300 ring-1 ring-rose-400/20">
                      −{formatMoney(item.amount)}
                      <span className="mr-1.5 text-[11px] font-bold text-rose-300/60">تومان</span>
                    </span>
                    <button
                      onClick={() => onDelete(item.id)}
                      title="حذف"
                      className="rounded-xl p-2.5 text-slate-600 opacity-0 transition-all duration-200 hover:bg-rose-500/15 hover:text-rose-400 focus:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
