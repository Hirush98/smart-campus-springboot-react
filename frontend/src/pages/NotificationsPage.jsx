import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'
import { BellIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

const TYPE_COLORS = {
  ANNOUNCEMENT:          'bg-indigo-100 text-indigo-700',
  BOOKING_APPROVED:      'bg-green-100 text-green-700',
  BOOKING_REJECTED:      'bg-red-100 text-red-700',
  BOOKING_CANCELLED:     'bg-gray-100 text-gray-600',
  TICKET_STATUS_CHANGED: 'bg-blue-100 text-blue-700',
  TICKET_ASSIGNED:       'bg-purple-100 text-purple-700',
  TICKET_COMMENT_ADDED:  'bg-yellow-100 text-yellow-700',
  TICKET_RESOLVED:       'bg-green-100 text-green-700',
}

export default function NotificationsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationService.getAll()
      setNotifications(res.data)
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(fetchNotifications, 30000)
    const handleFocus = () => fetchNotifications()

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(ns => ns.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed to mark all as read') }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleAddAnnouncement = () => {
    navigate('/admin/announcements/new')
  }

  const handleEditAnnouncement = (announcementId) => {
    navigate(`/admin/announcements/${announcementId}/edit`)
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Delete this announcement for all users?')) return

    try {
      await notificationService.deleteAnnouncement(announcementId)
      setNotifications(ns => ns.filter(n => (n.referenceId || n.id) !== announcementId))
      toast.success('Announcement deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button className="btn-primary text-sm flex items-center gap-2" onClick={handleAddAnnouncement}>
              <PlusIcon className="h-4 w-4" />
              Add Announcement
            </button>
          )}
          {unreadCount > 0 && (
            <button className="btn-secondary text-sm" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BellIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card transition-all ${!n.read ? 'border-blue-200 bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'}`}>
                      {n.type?.replace(/_/g, ' ')}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {isAdmin && n.type === 'ANNOUNCEMENT' && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditAnnouncement(n.referenceId || n.id)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(n.referenceId || n.id)}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
