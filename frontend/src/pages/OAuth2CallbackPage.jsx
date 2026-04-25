import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function OAuth2CallbackPage() {
  const { completeOAuthLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      toast.error('Google login failed')
      navigate('/login', { replace: true })
      return
    }

    completeOAuthLogin(token)
      .then(() => {
        toast.success('Signed in with Google')
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        localStorage.removeItem('token')
        toast.error('Unable to complete Google login')
        navigate('/login', { replace: true })
      })
  }, [completeOAuthLogin, navigate, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-900">Finishing Google sign-in</h1>
        <p className="text-sm text-gray-500 mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  )
}
