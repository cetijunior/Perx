import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useCurrentUser, useSessionLoading } from '@/lib/store'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Features from '@/pages/marketing/Features'
import About from '@/pages/marketing/About'
import Contact from '@/pages/marketing/Contact'
import Privacy from '@/pages/marketing/Privacy'
import Terms from '@/pages/marketing/Terms'
import { ScrollToTop } from '@/components/site/Site'
import Navbar, { isPublicRoute } from '@/components/site/Navbar'
import { useTheme } from '@/lib/theme'
import EmployeeLayout from '@/pages/employee/EmployeeLayout'
import Dashboard from '@/pages/employee/Dashboard'
import Benefits from '@/pages/employee/Benefits'
import Perky from '@/pages/employee/Perky'
import Budget from '@/pages/employee/Budget'
import Games from '@/pages/employee/Games'
import Card from '@/pages/employee/Card'
import Preferences from '@/pages/employee/Preferences'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import Employees from '@/pages/admin/Employees'
import Statistics from '@/pages/admin/Statistics'
import DealsEngine from '@/pages/admin/DealsEngine'
import Validate from '@/pages/admin/Validate'
import Settings from '@/pages/admin/Settings'

function Protected({ role, children }) {
  const user = useCurrentUser()
  const sessionLoading = useSessionLoading()

  if (sessionLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading session" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />
  return children
}

function ThemeRoot({ children }) {
  useTheme()
  return children
}

export default function App() {
  const { pathname } = useLocation()
  const showNavbar = isPublicRoute(pathname)

  // No top-level AnimatePresence: wrapping a keyed <Routes> in mode="wait"
  // deadlocks against the nested AnimatePresence inside AppShell, so views
  // (admin pages, post-logout login) wouldn't mount until a hard reload.
  // Each page animates itself in on mount; route swaps now happen instantly.
  return (
    <ThemeRoot>
    <>
    <ScrollToTop />
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/employee" element={<Protected role="employee"><EmployeeLayout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="benefits" element={<Benefits />} />
          <Route path="perky" element={<Perky />} />
          <Route path="budget" element={<Budget />} />
          <Route path="games" element={<Games />} />
          <Route path="card" element={<Card />} />
          <Route path="preferences" element={<Preferences />} />
        </Route>

        <Route path="/admin" element={<Protected role="admin"><AdminLayout /></Protected>}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="deals" element={<DealsEngine />} />
          <Route path="validate" element={<Validate />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
    </ThemeRoot>
  )
}
