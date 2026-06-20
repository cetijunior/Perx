import { LayoutDashboard, Store, Sparkles, Wallet, Gamepad2, SlidersHorizontal, CreditCard } from 'lucide-react'
import AppShell from '@/components/AppShell'

const ITEMS = [
  { to: '/employee', end: true, icon: LayoutDashboard, label: 'tabs.dashboard', shortLabel: 'mobileNav.home', mobile: 'bar' },
  { to: '/employee/benefits', icon: Store, label: 'tabs.benefits', mobile: 'bar' },
  { to: '/employee/perky', icon: Sparkles, label: 'tabs.perky', mobile: 'bar' },
  { to: '/employee/card', icon: CreditCard, label: 'tabs.card', mobile: 'bar' },
  { to: '/employee/budget', icon: Wallet, label: 'tabs.budget', mobile: 'menu' },
  { to: '/employee/games', icon: Gamepad2, label: 'tabs.games', mobile: 'menu' },
  { to: '/employee/preferences', icon: SlidersHorizontal, label: 'tabs.preferences', mobile: 'menu' },
]

export default function EmployeeLayout() {
  return <AppShell items={ITEMS} basePath="/employee" />
}
