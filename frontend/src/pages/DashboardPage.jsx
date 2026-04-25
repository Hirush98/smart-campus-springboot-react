import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import { notificationService } from '../services/api'
import { BellAlertIcon } from '@heroicons/react/24/outline'

const cards = [
  { title: 'Resources',  desc: 'Browse halls, labs & equipment',  href: '/resources',      color: 'bg-blue-500' },
  { title: 'Bookings',   desc: 'Request & manage bookings',        href: '/bookings',       color: 'bg-emerald-500' },
  { title: 'Tickets',    desc: 'Report incidents & maintenance',   href: '/tickets',        color: 'bg-amber-500' },
  { title: 'Notifications', desc: 'View updates & alerts',        href: '/notifications',  color: 'bg-purple-500' },
]

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true)

  useEffect(() => {
    notificationService.getAll()
      .then(res => {
        const recentAnnouncements = res.data
          .filter(notification => notification.type === 'ANNOUNCEMENT')
          .slice(0, 3)
        setAnnouncements(recentAnnouncements)
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoadingAnnouncements(false))
  }, [])

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link
            key={card.href}
            to={card.href}
            className="card hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg mb-3 
                            group-hover:scale-110 transition-transform`} />
            <h3 className="font-semibold text-gray-900">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="card mb-8 border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <BellAlertIcon className="h-4 w-4" />
              Recent Announcements
            </div>
            <h2 className="mt-3 text-xl font-semibold text-gray-900">Latest campus updates</h2>
            <p className="text-sm text-gray-500 mt-1">
              Important announcements shared with your role appear here.
            </p>
          </div>
          <Link to="/notifications" className="text-sm font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {loadingAnnouncements ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-600">No recent announcements</p>
            <p className="text-xs text-slate-400 mt-1">
              New announcements for your role will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(announcement => (
              <div
                key={announcement.id}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge bg-indigo-100 text-indigo-700">Announcement</span>
                  {!announcement.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(announcement.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card border-blue-100 bg-blue-50">
          <h2 className="font-semibold text-blue-900 mb-1">Admin panel</h2>
          <p className="text-sm text-blue-700 mb-3">
            Manage resources, review bookings, and assign tickets.
          </p>
          <Link to="/admin" className="btn-primary text-sm inline-block">
            Go to Admin →
          </Link>
        </div>
      )}
    </Layout>
  )
}
