import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { notificationService } from '../../services/api'
import { BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const { user, logout, isAdmin, isTechnician } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      notificationService.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {})

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
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Smart Campus</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/resources" className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">Resources</Link>
            <Link to="/bookings"  className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">Bookings</Link>
            <Link to="/tickets"   className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">Tickets</Link>
            {isAdmin && (
              <Link to="/admin" className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                Admin Center
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link to="/notifications" className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-rose-500 rounded-full
                                 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* User + logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900">{user?.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {isAdmin ? 'Administrator' : isTechnician ? 'Maintenance Tech' : 'Academic User'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

