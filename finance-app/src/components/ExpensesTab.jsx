import { useState } from 'react'
import { Plus, Receipt, Trash2, CalendarDays } from 'lucide-react'
import PersianNumberInput from './PersianNumberInput'
import { parseAmount, formatMoney, toFa, todayISO, formatJalaliDate } from '../utils/persian'

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

  return (
    <div className="space-y-6">
      {/* ---------- Form ---------- */}
      <form onSubmit={submit} className="rounded-2xl bg-white p-6 card-shadow space-y-4">
        <div className="flex items-center gap-2 text-rose-700">
          <Receipt size={20} />
          <h2 className="text-lg font-extrabold">ثبت هزینه جدید</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label htmlFor="expense-amount" className="text-sm font-bold text-slate-600">
              مبلغ (تومان)
            </label>
            <PersianNumberInput
              id="expense-amount"
              value={amount}
              onChange={setAmount}
              placeholder="۲٬۵۰۰٬۰۰۰"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="expense-category" className="text-sm font-bold text-slate-600">
              دسته‌بندی
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-vazir focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="expense-desc" className="text-sm font-bold text-slate-600">
              توضیح (اختیاری)
            </label>
            <input
              id="expense-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً خرید هفتگی"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-vazir placeholder:text-slate-300 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="expense-date" className="text-sm font-bold text-slate-600">
              تاریخ
            </label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-vazir focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-rose-600 to-orange-500 px-4 py-3 font-bold text-white shadow-lg shadow-rose-600/25 transition hover:brightness-110 active:scale-[0.99] sm:w-auto"
        >
          <Plus size={18} />
          افزودن هزینه
        </button>
      </form>

      {/* ---------- List ---------- */}
      <div className="rounded-2xl bg-white p-6 card-shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-700">مصارف ثبت‌شده</h3>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
            {toFa(expenses.length)} مورد
          </span>
        </div>

        {sorted.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            هنوز هزینه‌ای ثبت نشده است 🧾
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sorted.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Receipt size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">
                      {item.category}
                      {item.description && (
                        <span className="mr-2 text-sm font-normal text-slate-400">
                          — {item.description}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays size={12} />
                      {formatJalaliDate(item.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-rose-600">
                    −{formatMoney(item.amount)}
                    <span className="mr-1 text-xs font-normal text-slate-400">تومان</span>
                  </span>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="حذف"
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
