import { useState } from 'react'
import { Plus, Wallet, Trash2, CalendarDays, Sprout, AlertCircle } from 'lucide-react'
import PersianNumberInput from './PersianNumberInput'
import { parseAmount, formatMoney, toFa, todayISO, formatJalaliDate } from '../utils/persian'
import { incomeMeta } from '../utils/categoryMeta'

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
  const total = incomes.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      {/* ---------- Form ---------- */}
      <form onSubmit={submit} className="glass relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-teal-400/10 text-emerald-300 ring-1 ring-emerald-400/30">
              <Wallet size={21} />
            </span>
            <h2 className="text-lg font-black text-white">ثبت درآمد جدید</h2>
          </div>
          <span className="glass-soft hidden px-3.5 py-1.5 text-xs font-bold text-emerald-300 sm:block">
            مجموع: {formatMoney(total)} تومان
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="income-amount" className="field-label">مبلغ (تومان)</label>
            <PersianNumberInput
              id="income-amount"
              value={amount}
              onChange={setAmount}
              placeholder="۵٬۰۰۰٬۰۰۰"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="income-source" className="field-label">منبع درآمد</label>
            <select
              id="income-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="field-input cursor-pointer"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="income-date" className="field-label">تاریخ</label>
            <input
              id="income-date"
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
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 px-5 py-3.5 font-extrabold text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20 transition-all duration-300 hover:shadow-emerald-500/50 hover:brightness-110 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={19} className="transition-transform duration-300 group-hover:rotate-90" />
          افزودن درآمد
        </button>
      </form>

      {/* ---------- List ---------- */}
      <div className="glass p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-white">درآمدهای ثبت‌شده</h3>
          <span className="rounded-full bg-emerald-400/15 px-3.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/25">
            {toFa(incomes.length)} مورد
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
              <Sprout size={28} />
            </span>
            <p className="text-sm font-bold text-slate-400">
              هنوز درآمدی ثبت نشده است.
              <br />
              اولین درآمد خود را اضافه کنید 🌱
            </p>
          </div>
        ) : (
          <ul className="stagger divide-y divide-white/[0.06]">
            {sorted.map((item) => {
              const meta = incomeMeta(item.source)
              const Icon = meta.icon
              return (
                <li
                  key={item.id}
                  className="group flex items-center justify-between gap-3 rounded-xl px-2 py-4 transition-colors duration-200 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.chip} ${meta.text} ring-1 ${meta.ring} backdrop-blur`}
                    >
                      <Icon size={19} />
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-100">{item.source}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <CalendarDays size={12} />
                        {formatJalaliDate(item.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-xl bg-emerald-400/10 px-3 py-1.5 font-black text-emerald-300 ring-1 ring-emerald-400/20">
                      +{formatMoney(item.amount)}
                      <span className="mr-1.5 text-[11px] font-bold text-emerald-300/60">تومان</span>
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
