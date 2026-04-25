import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { notificationService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

export default function EditAnnouncementPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', message: '' })

  useEffect(() => {
    notificationService.getAnnouncement(id)
      .then(res => setForm({ title: res.data.title || '', message: res.data.message || '' }))
      .catch(() => {
        toast.error('Failed to load announcement')
        navigate('/notifications', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await notificationService.updateAnnouncement(id, {
        title: form.title.trim(),
        message: form.message.trim(),
      })
      toast.success('Announcement updated')
      navigate('/notifications')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update announcement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/notifications" className="text-sm text-blue-600 hover:underline">
            Back to Notifications
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Announcement</h1>
          <p className="text-gray-500 text-sm mt-1">
            Update this announcement for all users.
          </p>
        </div>

        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="input"
                  value={form.title}
                  onChange={e => setForm(current => ({ ...current, title: e.target.value }))}
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  className="input min-h-40 resize-y"
                  value={form.message}
                  onChange={e => setForm(current => ({ ...current, message: e.target.value }))}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {form.message.length}/1000 characters
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Link to="/notifications" className="btn-secondary text-sm">
                  Cancel
                </Link>
                <button type="submit" className="btn-primary text-sm" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
