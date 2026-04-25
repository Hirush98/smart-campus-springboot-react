import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { notificationService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

export default function CreateAnnouncementPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', message: '', audience: 'ALL' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await notificationService.createAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
      })
      toast.success('Announcement published')
      navigate('/notifications')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create announcement')
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
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Announcement</h1>
          <p className="text-gray-500 text-sm mt-1">
            Choose who should receive this announcement before publishing it.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
              <select
                className="input"
                value={form.audience}
                onChange={e => setForm(current => ({ ...current, audience: e.target.value }))}
              >
                <option value="ALL">All</option>
                <option value="USER">Users</option>
                <option value="TECHNICIAN">Technicians</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="input"
                placeholder="Campus maintenance update"
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
                placeholder="Write the announcement that should appear for all users."
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
                {submitting ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
