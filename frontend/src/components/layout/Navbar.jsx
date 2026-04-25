import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import { notificationService } from '../../services/api'
import {
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  Squares2X2Icon,
  TicketIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const { user, logout, isAdmin, isTechnician } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef(null)

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { to: '/resources', label: 'Resources', icon: BuildingOffice2Icon },
    { to: '/bookings', label: 'Bookings', icon: CalendarDaysIcon },
    { to: '/tickets', label: 'Tickets', icon: TicketIcon },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: WrenchScrewdriverIcon }] : []),
  ]

  useEffect(() => {
    if (!user) return

    const refreshNotifications = () => {
      notificationService.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {})

      notificationService.getAll()
        .then(res => setNotifications(res.data.slice(0, 5)))
        .catch(() => {})
    }

    refreshNotifications()

    const interval = setInterval(refreshNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    setMobileOpen(false)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await notificationService.markRead(notification.id)
        setNotifications(current =>
          current.map(item => item.id === notification.id ? { ...item, read: true } : item)
        )
        setUnreadCount(count => Math.max(0, count - 1))
      }
    } catch {}

    setNotificationsOpen(false)
    navigate('/notifications')
  }

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false)
    navigate('/notifications')
  }

  const linkClassName = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  const roleLabel = isAdmin
    ? 'Administrator'
    : isTechnician
      ? 'Maintenance Tech'
      : 'Academic User'

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 shadow-sm">
                <span className="text-sm font-bold tracking-[0.2em] text-white">SC</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Operations Hub
                </p>
                <p className="text-base font-semibold text-slate-900">Smart Campus</p>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 p-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClassName}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(open => !open)}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                  notificationsOpen
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
                aria-label="Open notifications"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-14 z-50 w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                        <p className="text-xs text-slate-500">
                          {unreadCount > 0 ? `${unreadCount} unread updates` : 'You are all caught up'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleViewAllNotifications}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        View all
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <BellIcon className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto py-2">
                      {notifications.map(notification => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                            !notification.read ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-slate-200'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {notification.title}
                              </p>
                              {notification.type && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                  {notification.type.replace(/_/g, ' ')}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {(user?.name || 'U').trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                  {roleLabel}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(open => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 xl:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 py-4 xl:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClassName}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:hidden">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{roleLabel}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600"
              >
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
