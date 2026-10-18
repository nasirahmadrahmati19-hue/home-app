// ---------- Day / Night theme (persisted in localStorage) ----------
import { useEffect, useState } from 'react'

const THEME_KEY = 'finance_app_theme'

export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  // Default: follow the time of day — bright mornings, deep nights ✨
  const hour = new Date().getHours()
  return hour >= 6 && hour < 19 ? 'light' : 'dark'
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.classList.toggle('theme-light', theme === 'light')
  root.classList.toggle('theme-dark', theme !== 'light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f3f6fd' : '#060714')
}

/** React hook: returns [theme, toggleTheme] and keeps <html> + storage in sync. */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return [theme, toggleTheme]
}
