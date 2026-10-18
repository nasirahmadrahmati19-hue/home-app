import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const tabs = [
  { id: 'income', label: 'درآمد', icon: TrendingUp, active: 'from-emerald-400 to-teal-500 shadow-emerald-500/40' },
  { id: 'expenses', label: 'مصارف', icon: TrendingDown, active: 'from-rose-400 to-orange-400 shadow-rose-500/40' },
  { id: 'report', label: 'گزارش مالی ماهانه', icon: BarChart3, active: 'from-indigo-400 to-violet-500 shadow-indigo-500/40' },
]

export default function Tabs({ active, onChange }) {
  return (
    <div className="glass p-2">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map(({ id, label, icon: Icon, active: grad }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={
                'group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-3 py-3.5 text-sm font-extrabold transition-all duration-300 ' +
                (isActive
                  ? `bg-gradient-to-l ${grad} text-white shadow-lg ring-1 ring-white/20`
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white')
              }
              aria-pressed={isActive}
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
