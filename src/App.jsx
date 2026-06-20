import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useCurrentUser } from '@/lib/store'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import EmployeeLayout from '@/pages/employee/EmployeeLayout'
import Dashboard from '@/pages/employee/Dashboard'
import Benefits from '@/pages/employee/Benefits'
import Perky from '@/pages/employee/Perky'
import BudgetGames from '@/pages/employee/BudgetGames'
import Preferences from '@/pages/employee/Preferences'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import Employees from '@/pages/admin/Employees'
import Statistics from '@/pages/admin/Statistics'
import DealsEngine from '@/pages/admin/DealsEngine'
import Settings from '@/pages/admin/Settings'

function Protected({ role, children }) {
  const user = useCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />
  return children
}

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/').slice(0, 2).join('/')}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/employee" element={<Protected role="employee"><EmployeeLayout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="benefits" element={<Benefits />} />
          <Route path="perky" element={<Perky />} />
          <Route path="budget" element={<BudgetGames />} />
          <Route path="preferences" element={<Preferences />} />
        </Route>

        <Route path="/admin" element={<Protected role="admin"><AdminLayout /></Protected>}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="deals" element={<DealsEngine />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
