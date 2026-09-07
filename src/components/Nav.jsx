import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">EventBooking</Link>
      <div className="nav-links">
        <Link to="/">אולמות</Link>
        {user && <Link to="/my-bookings">ההזמנות שלי</Link>}
        {user ? (
          <>
            <span className="nav-user">{user.displayName} · {user.role}</span>
            <button onClick={() => { logout(); navigate('/') }}>יציאה</button>
          </>
        ) : (
          <Link to="/login">כניסה / הרשמה</Link>
        )}
      </div>
    </nav>
  )
}
