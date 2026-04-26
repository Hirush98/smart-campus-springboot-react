import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { notificationService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

export default function CreateAnnouncementPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'ALL',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // 🔍 Validation function
  const validate = () => {
    const newErrors = {}

    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (form.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (form.title.length > 120) {
      newErrors.title = 'Title cannot exceed 120 characters'
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    } else if (form.message.length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters'
    }

    return newErrors
  }

  // 📝 Handle input change
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))

    // Real-time validation for that field
    setErrors(prev => {
      const updated = { ...prev }

      if (field === 'title') {
        if (!value.trim()) updated.title = 'Title is required'
        else if (value.trim().length < 3)
          updated.title = 'Title must be at least 3 characters'
        else if (value.length > 120)
          updated.title = 'Title cannot exceed 120 characters'
        else delete updated.title
      }

      if (field === 'message') {
        if (!value.trim()) updated.message = 'Message is required'
        else if (value.trim().length < 10)
          updated.message = 'Message must be at least 10 characters'
        else if (value.length > 1000)
          updated.message = 'Message cannot exceed 1000 characters'
        else delete updated.message
      }

      return updated
    })
  }

  // 🚀 Submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fix the errors before submitting')
      return
    }

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
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid =
    form.title.trim().length >= 3 &&
    form.message.trim().length >= 10 &&
    Object.keys(errors).length === 0

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/notifications" className="text-sm text-blue-600 hover:underline">
            Back to Notifications
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Create Announcement
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Choose who should receive this announcement before publishing it.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send To
              </label>
              <select
                className="input"
                value={form.audience}
                onChange={e => handleChange('audience', e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="USER">Users</option>
                <option value="TECHNICIAN">Technicians</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Campus maintenance update"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                maxLength={120}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                className={`input min-h-40 resize-y ${
                  errors.message ? 'border-red-500' : ''
                }`}
                placeholder="Write the announcement that should appear for all users."
                value={form.message}
                onChange={e => handleChange('message', e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.message.length}/1000 characters
              </p>
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link to="/notifications" className="btn-secondary text-sm">
                Cancel
              </Link>

              <button
                type="submit"
                className="btn-primary text-sm"
                disabled={submitting || !isFormValid}
              >
                {submitting ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  )
}