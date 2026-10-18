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
  const idx = Math.max(0, tabs.findIndex((t) => t.id === active))
  return (
    <div className="glass relative p-2">
      {/* sliding pill behind the active tab — GPU transform only, no jitter */}
      <span
        aria-hidden="true"
        className={
          'pointer-events-none absolute bottom-2 top-2 hidden rounded-2xl bg-gradient-to-l text-white shadow-lg ring-1 ring-white/20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:block ' +
          GRADIENTS[active]
        }
        style={{
          width: 'calc((100% - 1rem) / 3)',
          left: 'calc(0.5rem + (100% - 1rem) / 3 * ' + idx + ')',
        }}
      />
      <div className="relative grid grid-cols-3 gap-2" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={
                'group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-2 py-3.5 text-sm font-extrabold transition-colors duration-300 sm:px-3 ' +
                (isActive
                  ? 'text-white drop-shadow-sm sm:bg-transparent'
                  : 't-muted hoverable hover:t-strong')
              }
            >
              {/* mobile: active tab gets its own solid background (pill is desktop-only) */}
              {isActive && (
                <span className={'absolute inset-0 rounded-2xl bg-gradient-to-l shadow-lg ring-1 ring-white/20 sm:hidden ' + GRADIENTS[id]} />
              )}
              <Icon size={18} strokeWidth={2.4} className={'relative z-10 shrink-0 ' + (isActive ? '' : 'transition-transform duration-300 group-hover:-translate-y-0.5')} />
              <span className="relative z-10 whitespace-nowrap">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
