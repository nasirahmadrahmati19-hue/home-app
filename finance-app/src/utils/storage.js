const INCOME_KEY = 'finance_app_incomes'
const EXPENSE_KEY = 'finance_app_expenses'

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const loadIncomes = () => read(INCOME_KEY)
export const saveIncomes = (list) => write(INCOME_KEY, list)
export const loadExpenses = () => read(EXPENSE_KEY)
export const saveExpenses = (list) => write(EXPENSE_KEY, list)

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
