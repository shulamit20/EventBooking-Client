import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './auth.jsx'
import AppLayout from './components/AppLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SlotsPage from './pages/SlotsPage.jsx'
import BookPage from './pages/BookPage.jsx'
import MyBookingsPage from './pages/MyBookingsPage.jsx'
import ManagerPage from './pages/ManagerPage.jsx'

function RequireAuth({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const location = useLocation()

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/slots" element={<SlotsPage />} />
          <Route path="/book/:slotId" element={<RequireAuth role="Customer"><BookPage /></RequireAuth>} />
          <Route path="/my-bookings" element={<RequireAuth role="Customer"><MyBookingsPage /></RequireAuth>} />
          <Route path="/manage" element={<RequireAuth role="Manager"><ManagerPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </AppLayout>
  )
}
