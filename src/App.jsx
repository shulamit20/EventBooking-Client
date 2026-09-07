import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Nav from './components/Nav.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SlotsPage from './pages/SlotsPage.jsx'
import BookPage from './pages/BookPage.jsx'
import MyBookingsPage from './pages/MyBookingsPage.jsx'

function RequireAuth({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Nav />
      <main className="container">
        <Routes>
          {/* 1. login / register */}
          <Route path="/login" element={<LoginPage />} />
          {/* 2. list with real server pagination */}
          <Route path="/" element={<SlotsPage />} />
          {/* 3. action on the limited resource + 4. clear 409 handling */}
          <Route path="/book/:slotId" element={<RequireAuth><BookPage /></RequireAuth>} />
          <Route path="/my-bookings" element={<RequireAuth><MyBookingsPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
