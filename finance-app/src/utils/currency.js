// ---------- Currency support for Afghanistan: Afghani (؋) & US Dollar ($) ----------
import { useEffect, useState } from 'react'

const CURRENCY_KEY = 'finance_app_currency'

export const CURRENCIES = {
  afn: { id: 'afn', label: 'افغانی', symbol: '؋', short: '؋ AFN' },
  usd: { id: 'usd', label: 'دالر', symbol: '$', short: '$ USD' },
}

export const CURRENCY_OPTIONS = [CURRENCIES.afn, CURRENCIES.usd]

export function currencyLabel(id) {
  return (CURRENCIES[id] || CURRENCIES.afn).label
}

export function currencySymbol(id) {
  return (CURRENCIES[id] || CURRENCIES.afn).symbol
}

export function getInitialCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY)
    if (saved === 'afn' || saved === 'usd') return saved
  } catch {
    /* ignore */
  }
  return 'afn' // default for our Afghan users 🇦🇫
}

/** React hook: returns [currencyId, setCurrency], persisted in localStorage. */
export function useCurrency() {
  const [currency, setCurrency] = useState(getInitialCurrency)
  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency)
    } catch {
      /* ignore */
    }
  }, [currency])
  return [currency, setCurrency]
}
