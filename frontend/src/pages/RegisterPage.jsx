import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  // Validation logic
  const validateField = (name, value) => {
    let error = ''
    if (name === 'name') {
      if (!value) error = 'Full name is required'
      else if (value.length < 2) error = 'Name must be at least 2 characters'
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) error = 'Email address is required'
      else if (!emailRegex.test(value)) error = 'Please enter a valid email address'
    }
    if (name === 'password') {
      if (!value) error = 'Password is required'
      else if (value.length < 8) error = 'Password must be at least 8 characters'
      else if (!/\d/.test(value)) error = 'Password must contain at least one number'
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
    
    // Check all fields for errors before submitting
    const finalErrors = {}
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key])
      if (error) finalErrors[key] = error
    })

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors)
      setTouched({ name: true, email: true, password: true })
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    try {
      await authService.register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to Smart Campus.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-50">
      <div className="w-full max-w-[440px] animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-bold text-xl tracking-tight">SC</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h1>
          <p className="text-slate-500 font-medium mt-2">Join the future of campus management</p>
        </div>

        <div className="card border-white/40 shadow-2xl shadow-blue-900/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Full name</label>
              <input
                name="name"
                type="text"
                className={`input ${touched.name && errors.name ? 'input-error' : ''}`}
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
              />
              {touched.name && errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
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
              {!errors.password && <p className="text-[11px] text-slate-400 mt-1.5 ml-1">Min. 8 characters with at least one number</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-4">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : 'Start your journey'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/90 px-3 text-slate-400 font-medium">Already have an account?</span>
            </div>
          </div>

          <Link to="/login" className="btn-secondary w-full flex items-center justify-center py-3">
            Sign in to your account
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          &copy; 2026 Smart Campus Operations Hub. All rights reserved.
        </p>
      </div>
    </div>
  )
}

