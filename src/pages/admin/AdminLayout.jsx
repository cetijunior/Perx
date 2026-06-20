import { LayoutDashboard, Users, BarChart3, Radar, Settings, ScanLine } from 'lucide-react'
import AppShell from '@/components/AppShell'

const ITEMS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'tabs.dashboard', shortLabel: 'mobileNav.home', mobile: 'bar' },
  { to: '/admin/employees', icon: Users, label: 'tabs.employees', mobile: 'bar' },
  { to: '/admin/validate', icon: ScanLine, label: 'tabs.validate', mobile: 'bar' },
  { to: '/admin/deals', icon: Radar, label: 'tabs.deals', mobile: 'bar' },
  { to: '/admin/statistics', icon: BarChart3, label: 'tabs.statistics', mobile: 'menu' },
  { to: '/admin/settings', icon: Settings, label: 'tabs.settings', mobile: 'menu' },
]

export default function AdminLayout() {
  return <AppShell items={ITEMS} basePath="/admin" />
}
