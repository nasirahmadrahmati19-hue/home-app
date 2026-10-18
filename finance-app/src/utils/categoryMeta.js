// Icon + color metadata for income sources & expense categories (RTL glass UI)
import {
  Briefcase,
  ShoppingBag,
  Gift,
  LineChart,
  Laptop,
  Sparkles,
  Home,
  UtensilsCrossed,
  Bus,
  Zap,
  ShoppingCart,
  Stethoscope,
  Gamepad2,
  MoreHorizontal,
} from 'lucide-react'

export const INCOME_META = {
  حقوق: { icon: Briefcase, chip: 'from-emerald-400/20 to-teal-400/10', text: 'text-emerald-300', ring: 'ring-emerald-400/30' },
  فروش: { icon: ShoppingBag, chip: 'from-green-400/20 to-emerald-400/10', text: 'text-green-300', ring: 'ring-green-400/30' },
  هدیه: { icon: Gift, chip: 'from-pink-400/20 to-rose-400/10', text: 'text-pink-300', ring: 'ring-pink-400/30' },
  'سرمایه‌گذاری': { icon: LineChart, chip: 'from-cyan-400/20 to-sky-400/10', text: 'text-cyan-300', ring: 'ring-cyan-400/30' },
  فریلنسری: { icon: Laptop, chip: 'from-violet-400/20 to-purple-400/10', text: 'text-violet-300', ring: 'ring-violet-400/30' },
  سایر: { icon: Sparkles, chip: 'from-slate-400/20 to-zinc-400/10', text: 'text-slate-300', ring: 'ring-slate-400/30' },
}

export const EXPENSE_META = {
  اجاره: { icon: Home, chip: 'from-rose-400/20 to-red-400/10', text: 'text-rose-300', ring: 'ring-rose-400/30' },
  غذا: { icon: UtensilsCrossed, chip: 'from-orange-400/20 to-amber-400/10', text: 'text-orange-300', ring: 'ring-orange-400/30' },
  'حمل‌ونقل': { icon: Bus, chip: 'from-sky-400/20 to-blue-400/10', text: 'text-sky-300', ring: 'ring-sky-400/30' },
  قبوض: { icon: Zap, chip: 'from-yellow-400/20 to-amber-400/10', text: 'text-yellow-300', ring: 'ring-yellow-400/30' },
  خرید: { icon: ShoppingCart, chip: 'from-fuchsia-400/20 to-pink-400/10', text: 'text-fuchsia-300', ring: 'ring-fuchsia-400/30' },
  پزشکی: { icon: Stethoscope, chip: 'from-teal-400/20 to-cyan-400/10', text: 'text-teal-300', ring: 'ring-teal-400/30' },
  سرگرمی: { icon: Gamepad2, chip: 'from-violet-400/20 to-indigo-400/10', text: 'text-violet-300', ring: 'ring-violet-400/30' },
  سایر: { icon: MoreHorizontal, chip: 'from-slate-400/20 to-zinc-400/10', text: 'text-slate-300', ring: 'ring-slate-400/30' },
}

export const incomeMeta = (name) => INCOME_META[name] || INCOME_META['سایر']
export const expenseMeta = (name) => EXPENSE_META[name] || EXPENSE_META['سایر']
