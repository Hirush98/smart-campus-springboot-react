import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const googleAuthUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/oauth2/authorization/google`
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const validateField = (name, value) => {
    let error = ''
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) error = 'Email is required'
      else if (!emailRegex.test(value)) error = 'Invalid email format'
    }
    if (name === 'password') {
      if (!value) error = 'Password is required'
    }
    return error
  }

  useEffect(() => {
    const newErrors = {}
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key])
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
  }, [form])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const finalErrors = {}
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key])
      if (error) finalErrors[key] = error
    })

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors)
      setTouched({ email: true, password: true })
      toast.error('Please check your credentials')
      return
    }

    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back to the Command Center!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-50">
      <div className="w-full max-w-[440px] animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-bold text-xl tracking-tight">SC</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Smart Campus</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to your Command Center</p>
        </div>

        <div className="card border-white/40 shadow-2xl shadow-blue-900/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email address</label>
              <input
                name="email"
                type="email"
                className={`input ${touched.email && errors.email ? 'input-error' : ''}`}
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
              />
              {touched.email && errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot?</a>
              </div>
              <input
                name="password"
                type="password"
                className={`input ${touched.password && errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
              />
              {touched.password && errors.password && <p className="error-message">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-4">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/90 px-3 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <a
              href={googleAuthUrl}
              className="mt-6 flex items-center justify-center gap-3 w-full border border-slate-200
                         rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50
                         transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>University SSO</span>
            </a>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            New to the platform?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-10 font-medium">
          &copy; 2026 Smart Campus Operations Hub. Developed for Academic Excellence.
        </p>
      </div>
    </div>
  )
}
