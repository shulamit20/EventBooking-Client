import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, displayName)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card form-card">
      <div className="tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>כניסה</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>הרשמה</button>
      </div>

      <form onSubmit={submit}>
        {mode === 'register' && (
          <label>שם לתצוגה
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={200} />
          </label>
        )}
        <label>אימייל
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>סיסמה
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={busy}>
          {busy ? '...' : mode === 'login' ? 'כניסה' : 'הרשמה'}
        </button>
      </form>

      <p className="hint">
        משתמשי דמו:<br />
        <code>client@eventbooking.local</code> · <code>manager@eventbooking.local</code><br />
        סיסמה: <code>Passw0rd!</code>
      </p>
    </div>
  )
}
