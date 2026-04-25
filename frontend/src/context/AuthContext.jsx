import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    // Only call /api/auth/me if a token actually exists in localStorage
    // Without this guard, every page load fires the request unauthenticated
    // and the backend (before our fix) redirected it to Google OAuth
    if (!token) {
      setLoading(false)
      return
    }

    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        // Token is invalid or expired — clear it silently
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    // Fetch full user profile after login
    const meRes = await api.get('/auth/me')
    setUser(meRes.data)
    return res.data
  }

  const completeOAuthLogin = async (token) => {
    localStorage.setItem('token', token)
    const meRes = await api.get('/auth/me')
    setUser(meRes.data)
    return meRes.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin      = user?.roles?.some(r => r.authority === 'ROLE_ADMIN')
  const isTechnician = user?.roles?.some(r => r.authority === 'ROLE_TECHNICIAN')

  return (
    <AuthContext.Provider
      value={{ user, loading, login, completeOAuthLogin, logout, isAdmin, isTechnician }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
