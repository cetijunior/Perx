import { LayoutDashboard, Users, BarChart3, Radar, Settings } from 'lucide-react'
import AppShell from '@/components/AppShell'

const ITEMS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'tabs.dashboard' },
  { to: '/admin/employees', icon: Users, label: 'tabs.employees' },
  { to: '/admin/statistics', icon: BarChart3, label: 'tabs.statistics' },
  { to: '/admin/deals', icon: Radar, label: 'tabs.deals', center: true },
  { to: '/admin/settings', icon: Settings, label: 'tabs.settings' },
]

export default function AdminLayout() {
  return <AppShell items={ITEMS} basePath="/admin" />
}
