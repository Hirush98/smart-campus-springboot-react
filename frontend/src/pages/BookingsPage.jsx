import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { bookingService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

export default function BookingsPage() {
  const { isAdmin } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchParams]          = useSearchParams()

  // Pre-fill from resource card
  const [form, setForm] = useState({
    resourceId:       searchParams.get('resourceId') || '',
    resourceName:     searchParams.get('resourceName') || '',
    bookingDate:      '',
    startTime:        '',
    endTime:          '',
    purpose:          '',
    expectedAttendees:'',
  })

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await bookingService.getAll()
      setBookings(res.data)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    if (searchParams.get('resourceId')) setShowForm(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await bookingService.create(form)
      toast.success('Booking request submitted!')
      setShowForm(false)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await bookingService.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'All booking requests' : 'Your booking requests'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Hide form' : '+ New Booking'}
        </button>
      </div>

      {/* New booking form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Request a booking</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Resource ID</label>
              <input className="input" value={form.resourceId}
                onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}
                placeholder="Paste resource ID" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Resource name</label>
              <input className="input" value={form.resourceName}
                onChange={e => setForm(f => ({ ...f, resourceName: e.target.value }))}
                placeholder="e.g. Lab 301" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input type="date" className="input" value={form.bookingDate}
                onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Expected attendees</label>
              <input type="number" className="input" value={form.expectedAttendees}
                onChange={e => setForm(f => ({ ...f, expectedAttendees: e.target.value }))}
                min={1} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start time</label>
              <input type="time" className="input" value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End time</label>
              <input type="time" className="input" value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Purpose</label>
              <textarea className="input resize-none" rows={3} value={form.purpose}
                onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                placeholder="Describe the purpose of this booking" required />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Submit Request</button>
              <button type="button" className="btn-secondary"
                onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No bookings yet.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{b.resourceName}</h3>
                    <span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {b.bookingDate} · {b.startTime} – {b.endTime}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{b.purpose}</p>
                  {b.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">Reason: {b.rejectionReason}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Cancel
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
