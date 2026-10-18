import { useEffect, useState } from 'react'
import { PiggyBank } from 'lucide-react'
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
    <div dir="rtl" className="min-h-screen bg-slate-100 pb-16">
      {/* Header */}
      <header className="bg-gradient-to-l from-emerald-700 via-teal-700 to-cyan-800 py-10 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <PiggyBank size={26} />
            </span>
            <div>
              <h1 className="text-xl font-black sm:text-2xl">مدیریت مالی شخصی</h1>
              <p className="mt-0.5 text-xs font-bold text-white/70 sm:text-sm">
                درآمدها، مصارف و گزارش ماهانه — همه در یک جا
              </p>
            </div>
          </div>
          <div className="hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur sm:block">
            امروز: {todayLabel}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4">
        <div className="-mt-6 mb-8">
          <Tabs active={active} onChange={setActive} />
        </div>

        {active === 'income' && (
          <IncomeTab incomes={incomes} onAdd={addIncome} onDelete={deleteIncome} />
        )}
        {active === 'expenses' && (
          <ExpensesTab expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} />
        )}
        {active === 'report' && <ReportTab incomes={incomes} expenses={expenses} />}
      </main>
    </div>
  )
}
