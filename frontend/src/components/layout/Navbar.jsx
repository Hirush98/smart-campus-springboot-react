import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { notificationService } from '../../services/api'
import { BellIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      notificationService.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {})

      // Poll every 30 seconds
      const interval = setInterval(() => {
        notificationService.getUnreadCount()
          .then(res => setUnreadCount(res.data.count))
          .catch(() => {})
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-semibold text-gray-900">Smart Campus</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/resources" className="hover:text-blue-600 transition-colors">Resources</Link>
            <Link to="/bookings"  className="hover:text-blue-600 transition-colors">Bookings</Link>
            <Link to="/tickets"   className="hover:text-blue-600 transition-colors">Tickets</Link>
            {isAdmin && (
              <Link to="/admin" className="hover:text-blue-600 transition-colors text-blue-600">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-gray-900">
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full
                                 text-white text-xs flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User + logout */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
