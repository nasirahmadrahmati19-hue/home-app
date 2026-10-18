import { useEffect, useState } from 'react'
import { Wallet2, Sparkles, Clock3 } from 'lucide-react'
import Tabs from './components/Tabs'
import IncomeTab from './components/IncomeTab'
import ExpensesTab from './components/ExpensesTab'
import ReportTab from './components/ReportTab'
import ThemeToggle from './components/ThemeToggle'
import CurrencyToggle from './components/CurrencyToggle'
import {
  loadIncomes,
  saveIncomes,
  loadExpenses,
  saveExpenses,
  uid,
} from './utils/storage'
import { todayJalali, jalaliMonthName, toFa, kabulNow, formatKabulTime } from './utils/persian'
import { useTheme } from './utils/theme'
import { useCurrency } from './utils/currency'

export default function App() {
  const [active, setActive] = useState('income')
  const [incomes, setIncomes] = useState(loadIncomes)
  const [expenses, setExpenses] = useState(loadExpenses)
  const [theme, toggleTheme] = useTheme()
  const [currency, setCurrency] = useCurrency()

  // Persist to localStorage on every change
  useEffect(() => saveIncomes(incomes), [incomes])
  useEffect(() => saveExpenses(expenses), [expenses])

  const addIncome = (data) =>
    setIncomes((prev) => [{ id: uid(), ...data }, ...prev])

  const addExpense = (data) =>
    setExpenses((prev) => [{ id: uid(), ...data }, ...prev])

  const deleteIncome = (id) => setIncomes((prev) => prev.filter((i) => i.id !== id))
  const deleteExpense = (id) => setExpenses((prev) => prev.filter((e) => e.id !== id))

  const updateIncome = (patch) =>
    setIncomes((prev) => prev.map((i) => (i.id === patch.id ? { ...i, ...patch } : i)))
  const updateExpense = (patch) =>
    setExpenses((prev) => prev.map((e) => (e.id === patch.id ? { ...e, ...patch } : e)))

  const { jy, jm, jd } = todayJalali()
  const todayLabel = `${toFa(jd)} ${jalaliMonthName(jm)} ${toFa(jy)}`

  // Live Kabul clock (12-hour display, UTC+4:30), ticks every second
  const [kabul, setKabul] = useState(kabulNow)
  useEffect(() => {
    const t = setInterval(() => setKabul(kabulNow()), 1000)
    return () => clearInterval(t)
  }, [])
  const h12 = kabul.h % 12 === 0 ? 12 : kabul.h % 12
  const timeLabel = formatKabulTime({ h: h12, m: kabul.m, s: kabul.s })
  const dayPart = kabul.h < 12 ? 'ق.ظ' : 'ب.ظ'

  return (
    <div dir="rtl" className="min-h-screen pb-16">
      {/* ---------- Header ---------- */}
      <header className="relative mx-auto max-w-4xl px-4 pt-10 sm:pt-14">
        <div className="card-raised animate-fade-up relative overflow-hidden px-6 py-7 sm:px-9 sm:py-8">
          {/* decorative orbs */}

          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="animate-float-slow flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-white/20">
                <Wallet2 size={30} strokeWidth={2.2} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-gradient text-2xl font-black tracking-tight sm:text-3xl">
                    مدیریت مالی شخصی
                  </h1>
                  <Sparkles size={18} className="acc-amber" />
                </div>
                <p className="t-muted mt-1 text-[13px] font-bold sm:text-sm">
                  درآمدها، مصارف و گزارش ماهانه — همه در یک جای زیبا 🇦🇫
                </p>
                {/* live Kabul clock under the app title */}
                <div className="inset-panel mt-3 inline-flex items-center gap-2 px-3.5 py-1.5">
                  <Clock3 size={16} className="acc-cyan" />
                  <span className="font-mono-num text-base font-black tracking-wide tabular-nums">
                    {timeLabel}
                  </span>
                  <span className="t-muted text-[11px] font-black">{dayPart}</span>
                  <span className="t-faint hidden text-[11px] font-bold sm:inline">— وقت کابل (۱۲ ساعته)</span>
                </div>
              </div>
            </div>

            {/* controls: currency + theme + date */}
            <div className="flex flex-wrap items-center gap-3">
              <CurrencyToggle value={currency} onChange={setCurrency} />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <div className="inset-panel flex items-center gap-2 px-4 py-2.5 text-sm font-bold t-body">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                امروز: {todayLabel}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main className="mx-auto max-w-4xl px-4">
        <div className="animate-fade-up mb-8 mt-7" style={{ animationDelay: '0.1s' }}>
          <Tabs active={active} onChange={setActive} />
        </div>

        <div key={active} className="animate-fade-up">
          {active === 'income' && (
            <IncomeTab incomes={incomes} onAdd={addIncome} onDelete={deleteIncome} onUpdate={updateIncome} currency={currency} />
          )}
          {active === 'expenses' && (
            <ExpensesTab expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} onUpdate={updateExpense} currency={currency} />
          )}
          {active === 'report' && (
            <ReportTab incomes={incomes} expenses={expenses} currency={currency} />
          )}
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="t-faint mx-auto mt-14 max-w-4xl px-4 text-center text-xs font-bold">
        ساخته‌شده با ❤️ برای مدیریت هوشمند پول — داده‌ها فقط روی دستگاه شما ذخیره می‌شوند
      </footer>
    </div>
  )
}
