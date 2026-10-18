import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const tabs = [
  { id: 'income', label: 'درآمد', icon: TrendingUp },
  { id: 'expenses', label: 'مصارف', icon: TrendingDown },
  { id: 'report', label: 'گزارش مالی ماهانه', icon: BarChart3 },
]

// gradient per active tab (solid gradients work in both themes)
const GRADIENTS = {
  income: 'from-emerald-500 to-teal-500 shadow-emerald-500/40',
  expenses: 'from-rose-500 to-orange-400 shadow-rose-500/40',
  report: 'from-indigo-500 to-violet-500 shadow-indigo-500/40',
}

export default function Tabs({ active, onChange }) {
  return (
    <div className="glass p-2">
      <div className="grid grid-cols-3 gap-2" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={
                'group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-3 py-3.5 text-sm font-extrabold transition-all duration-300 ' +
                (isActive
                  ? `bg-gradient-to-l ${GRADIENTS[id]} text-white shadow-lg ring-1 ring-white/20`
                  : 't-muted hoverable hover:t-strong')
              }
            >
              {/* top sheen on active tab */}
              {isActive && (
                <span className="pointer-events-none absolute inset-x-6 -top-px h-px bg-white/50" />
              )}
              <Icon
                size={18}
                strokeWidth={2.4}
                className={isActive ? '' : 'transition-transform duration-300 group-hover:-translate-y-0.5'}
              />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
