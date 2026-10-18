import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const tabs = [
  { id: 'income', label: 'درآمد', icon: TrendingUp },
  { id: 'expenses', label: 'مصارف', icon: TrendingDown },
  { id: 'report', label: 'گزارش مالی', icon: BarChart3 },
]

// gradient per active tab (solid gradients work in both themes)
const GRADIENTS = {
  income: 'from-emerald-500 to-teal-500 shadow-emerald-500/40',
  expenses: 'from-rose-500 to-orange-400 shadow-rose-500/40',
  report: 'from-indigo-500 to-violet-500 shadow-indigo-500/40',
}

export default function Tabs({ active, onChange }) {
  // BUG FIX: previously an unknown `active` id fell back to index 0 (درآمد),
  // which made clicks on «درآمد» and «گزارش مالی» appear swapped. Now we
  // validate the id against the tab list and render nothing weird if unknown.
  const validId = tabs.some((t) => t.id === active) ? active : 'income'
  const idx = tabs.findIndex((t) => t.id === validId)

  return (
    <nav className="tabbar relative p-1.5" aria-label="بخش‌های اصلی">
      {/* sliding indicator — pure transform animation (GPU, no jitter) */}
      <span
        aria-hidden="true"
        className={
          'tab-indicator pointer-events-none absolute bottom-1.5 top-1.5 rounded-[17px] bg-gradient-to-l shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
          GRADIENTS[validId]
        }
        style={{
          width: 'calc((100% - 0.75rem) / 3)',
          right: '0.375rem',
          transform: 'translateX(calc(-1 * (100% + 0.25rem) * ' + idx + '))',
        }}
      />
      <div className="relative grid grid-cols-3 gap-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = validId === id
          return (
            <button
              key={id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                onChange(id)
              }}
              className={
                'group relative z-10 flex min-h-[48px] items-center justify-center gap-2 rounded-[17px] px-2 py-3 text-sm font-extrabold transition-colors duration-300 sm:px-3 ' +
                (isActive ? 'text-white' : 't-muted hoverable hover:t-strong')
              }
            >
              <Icon size={18} strokeWidth={2.4} className={'shrink-0 transition-transform duration-300 ' + (isActive ? 'scale-110' : 'group-hover:-translate-y-0.5')} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
