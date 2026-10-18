import { useState } from 'react'
import { Plus, Wallet, Trash2, CalendarDays } from 'lucide-react'
import PersianNumberInput from './PersianNumberInput'
import { parseAmount, formatMoney, toFa, todayISO, formatJalaliDate } from '../utils/persian'

const SOURCES = ['حقوق', 'فروش', 'هدیه', 'سرمایه‌گذاری', 'فریلنسری', 'سایر']

export default function IncomeTab({ incomes, onAdd, onDelete }) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState(SOURCES[0])
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('لطفاً مبلغ معتبر وارد کنید (مثلاً ۵٬۰۰۰٬۰۰۰)')
      return
    }
    if (!date) {
      setError('تاریخ را انتخاب کنید')
      return
    }
    onAdd({ amount: value, source, date })
    setAmount('')
    setError('')
  }

  const sorted = [...incomes].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="space-y-6">
      {/* ---------- Form ---------- */}
      <form
        onSubmit={submit}
        className="rounded-2xl bg-white p-6 card-shadow space-y-4"
      >
        <div className="flex items-center gap-2 text-emerald-700">
          <Wallet size={20} />
          <h2 className="text-lg font-extrabold">ثبت درآمد جدید</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="income-amount" className="text-sm font-bold text-slate-600">
              مبلغ (تومان)
            </label>
            <PersianNumberInput
              id="income-amount"
              value={amount}
              onChange={setAmount}
              placeholder="۵٬۰۰۰٬۰۰۰"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="income-source" className="text-sm font-bold text-slate-600">
              منبع درآمد
            </label>
            <select
              id="income-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-vazir focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="income-date" className="text-sm font-bold text-slate-600">
              تاریخ
            </label>
            <input
              id="income-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-vazir focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.99] sm:w-auto"
        >
          <Plus size={18} />
          افزودن درآمد
        </button>
      </form>

      {/* ---------- List ---------- */}
      <div className="rounded-2xl bg-white p-6 card-shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-700">درآمدهای ثبت‌شده</h3>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {toFa(incomes.length)} مورد
          </span>
        </div>

        {sorted.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            هنوز درآمدی ثبت نشده است. اولین درآمد خود را اضافه کنید 🌱
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sorted.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Wallet size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">{item.source}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays size={12} />
                      {formatJalaliDate(item.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-600">
                    +{formatMoney(item.amount)}
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

