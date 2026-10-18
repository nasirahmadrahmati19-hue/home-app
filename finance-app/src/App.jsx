import { useEffect, useState } from 'react'
import { Wallet2, Sparkles } from 'lucide-react'
import Tabs from './components/Tabs'
import IncomeTab from './components/IncomeTab'
import ExpensesTab from './components/ExpensesTab'
import ReportTab from './components/ReportTab'
import {
  loadIncomes,
  saveIncomes,
  loadExpenses,
  saveExpenses,
  uid,
} from './utils/storage'
import { todayJalali, jalaliMonthName, toFa } from './utils/persian'

export default function App() {
  const [active, setActive] = useState('income')
  const [incomes, setIncomes] = useState(loadIncomes)
  const [expenses, setExpenses] = useState(loadExpenses)

  // Persist to localStorage on every change
  useEffect(() => saveIncomes(incomes), [incomes])
  useEffect(() => saveExpenses(expenses), [expenses])

  const addIncome = (data) =>
    setIncomes((prev) => [{ id: uid(), ...data }, ...prev])

  const addExpense = (data) =>
    setExpenses((prev) => [{ id: uid(), ...data }, ...prev])

  const deleteIncome = (id) => setIncomes((prev) => prev.filter((i) => i.id !== id))
  const deleteExpense = (id) => setExpenses((prev) => prev.filter((e) => e.id !== id))

  const { jy, jm, jd } = todayJalali()
  const todayLabel = `${toFa(jd)} ${jalaliMonthName(jm)} ${toFa(jy)}`

  return (
    <div dir="rtl" className="min-h-screen pb-16">
      {/* ---------- Header ---------- */}
      <header className="relative mx-auto max-w-4xl px-4 pt-10 sm:pt-14">
        <div className="glass animate-fade-up relative overflow-hidden px-6 py-7 sm:px-9 sm:py-8">
          {/* decorative orbs */}
          <div className="pointer-events-none absolute -left-10 -top-16 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-12 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl" />

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
                  <Sparkles size={18} className="text-amber-300/90" />
                </div>
                <p className="mt-1 text-[13px] font-bold text-slate-400 sm:text-sm">
                  درآمدها، مصارف و گزارش ماهانه — همه در یک جای زیبا
                </p>
              </div>
            </div>

            <div className="glass-soft flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              امروز: {todayLabel}
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
            <IncomeTab incomes={incomes} onAdd={addIncome} onDelete={deleteIncome} />
          )}
          {active === 'expenses' && (
            <ExpensesTab expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} />
          )}
          {active === 'report' && <ReportTab incomes={incomes} expenses={expenses} />}
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="mx-auto mt-14 max-w-4xl px-4 text-center text-xs font-bold text-slate-600">
        ساخته‌شده با ❤️ برای مدیریت هوشمند پول — داده‌ها فقط روی دستگاه شما ذخیره می‌شوند
      </footer>
    </div>
  )
}
