import { createContext, useContext, useState } from 'react'
import { api } from './api.js'

// Holds the logged-in user + token. Token goes to localStorage so a refresh keeps you signed in;
// api.js reads it from there and adds the Authorization header to every request.

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  function persist(auth) {
    localStorage.setItem('token', auth.token)
    localStorage.setItem('user', JSON.stringify(auth.user))
    setUser(auth.user)
  }

  async function login(email, password) {
    persist(await api.post('/api/auth/login', { email, password }))
  }

  async function register(email, password, displayName) {
    persist(await api.post('/api/auth/register', { email, password, displayName }))
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
