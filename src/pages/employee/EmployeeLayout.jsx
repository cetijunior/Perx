import { LayoutDashboard, Store, Sparkles, Wallet, Gamepad2, SlidersHorizontal, CreditCard } from 'lucide-react'
import AppShell from '@/components/AppShell'

const ITEMS = [
  { to: '/employee', end: true, icon: LayoutDashboard, label: 'tabs.dashboard' },
  { to: '/employee/benefits', icon: Store, label: 'tabs.benefits' },
  { to: '/employee/card', icon: CreditCard, label: 'tabs.card' },
  { to: '/employee/perky', icon: Sparkles, label: 'tabs.perky', center: true },
  { to: '/employee/budget', icon: Wallet, label: 'tabs.budget' },
  { to: '/employee/games', icon: Gamepad2, label: 'tabs.games' },
  { to: '/employee/preferences', icon: SlidersHorizontal, label: 'tabs.preferences' },
]

export default function EmployeeLayout() {
  return <AppShell items={ITEMS} basePath="/employee" />
}
