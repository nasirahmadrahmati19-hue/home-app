import { useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  CalendarRange,
  ArrowRightLeft,
} from 'lucide-react'
import {
  formatMoney,
  jalaliMonthKey,
  jalaliMonthKeyLabel,
  currentJalaliMonthKey,
  toFa,
} from '../utils/persian'

export default function ReportTab({ incomes, expenses }) {
  const currentKey = currentJalaliMonthKey()

  // All available jalali months (from data + current month), newest first
  const months = useMemo(() => {
    const set = new Set([currentKey])
    incomes.forEach((i) => set.add(jalaliMonthKey(i.date)))
    expenses.forEach((e) => set.add(jalaliMonthKey(e.date)))
    return [...set].sort((a, b) => (a < b ? 1 : -1))
  }, [incomes, expenses, currentKey])

  const [selected, setSelected] = useState(currentKey)
  const isCurrent = selected === currentKey

  const stats = useMemo(() => {
    const filterFn = (item) => (isCurrent ? true : jalaliMonthKey(item.date) === selected)
    const fi = incomes.filter(filterFn)
    const fe = expenses.filter(filterFn)
    const totalIncome = fi.reduce((s, i) => s + i.amount, 0)
    const totalExpense = fe.reduce((s, e) => s + e.amount, 0)
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount: fi.length,
      expenseCount: fe.length,
    }
  }, [incomes, expenses, selected, isCurrent])

  const scopeLabel = isCurrent ? 'کل دوره (بدون فیلتر ماهانه)' : jalaliMonthKeyLabel(selected)

  return (
    <div className="space-y-6">
      {/* ---------- Month filter ---------- */}
      <div className="rounded-2xl bg-white p-6 card-shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <CalendarRange size={20} className="text-indigo-600" />
            <h2 className="text-lg font-extrabold">گزارش مالی</h2>
          </div>

          <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
            فیلتر بر اساس ماه:
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-vazir focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={currentKey}>همه ماه‌ها (کل)</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {jalaliMonthKeyLabel(m)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          دامنه گزارش فعلی: <span className="font-bold text-slate-500">{scopeLabel}</span>
        </p>
      </div>

      {/* ---------- Summary cards ---------- */}
      <div className="grid gap-5 sm:grid-cols-3">
        <SummaryCard
          title="مجموع درآمدها"
          value={stats.totalIncome}
          count={stats.incomeCount}
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/30"
        />
        <SummaryCard
          title="مجموع مصارف"
          value={stats.totalExpense}
          count={stats.expenseCount}
          icon={TrendingDown}
          gradient="from-rose-500 to-orange-500"
          shadow="shadow-rose-500/30"
        />
        <div
          className={
            'relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white card-shadow ' +
            (stats.balance >= 0
              ? 'from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30'
              : 'from-red-600 to-rose-700 shadow-lg shadow-red-500/30')
          }
        >
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/80">مانده خالص (سود / زیان)</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Scale size={20} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight">
            {stats.balance >= 0 ? '+' : '−'}{formatMoney(Math.abs(stats.balance))}
          </p>
          <p className="mt-1 text-xs font-bold text-white/70">
            تومان —{' '}
            {stats.balance >= 0 ? '✅ شما در سود هستید' : '⚠️ کسری بودجه دارید'}
          </p>
        </div>
      </div>

      {/* ---------- Simple comparison bar ---------- */}
      <div className="rounded-2xl bg-white p-6 card-shadow">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <ArrowRightLeft size={18} className="text-indigo-600" />
          <h3 className="text-base font-extrabold">مقایسه درآمد و مصرف</h3>
        </div>
        <Bar label="درآمد" value={stats.totalIncome} color="bg-emerald-500" max={Math.max(stats.totalIncome, stats.totalExpense, 1)} />
        <Bar label="مصرف" value={stats.totalExpense} color="bg-rose-500" max={Math.max(stats.totalIncome, stats.totalExpense, 1)} />
      </div>
    </div>
  )
}

function SummaryCard({ title, value, count, icon: Icon, gradient, shadow }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg ${shadow}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white/80">{title}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight">{formatMoney(value)}</p>
      <p className="mt-1 text-xs font-bold text-white/70">تومان — {toFa(count)} تراکنش</p>
    </div>
  )
}

function Bar({ label, value, color, max }) {
  const pct = Math.max(2, Math.round((value / max) * 100))
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-extrabold text-slate-800">{formatMoney(value)} تومان</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
