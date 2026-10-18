import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const tabs = [
  { id: 'income', label: 'درآمد', icon: TrendingUp },
  { id: 'expenses', label: 'مصارف', icon: TrendingDown },
  { id: 'report', label: 'گزارش مالی ماهانه', icon: BarChart3 },
]

export default function Tabs({ active, onChange }) {
  return (
    <div className="rounded-2xl bg-white p-1.5 card-shadow">
      <div className="grid grid-cols-3 gap-1.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={
                'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-200 ' +
                (isActive
                  ? 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')
              }
              aria-pressed={isActive}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
