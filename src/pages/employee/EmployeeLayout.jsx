import { LayoutDashboard, Store, Sparkles, Gamepad2, SlidersHorizontal } from 'lucide-react'
import AppShell from '@/components/AppShell'

const ITEMS = [
  { to: '/employee', end: true, icon: LayoutDashboard, label: 'tabs.dashboard' },
  { to: '/employee/benefits', icon: Store, label: 'tabs.benefits' },
  { to: '/employee/perky', icon: Sparkles, label: 'tabs.perky', center: true },
  { to: '/employee/budget', icon: Gamepad2, label: 'tabs.budget' },
  { to: '/employee/preferences', icon: SlidersHorizontal, label: 'tabs.preferences' },
]

export default function EmployeeLayout() {
  return <AppShell items={ITEMS} basePath="/employee" />
}
