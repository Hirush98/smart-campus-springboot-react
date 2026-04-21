import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { bookingService, resourceService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  PENDING:   { pill: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  APPROVED:  { pill: 'bg-green-100 text-green-800',  label: 'Approved' },
  REJECTED:  { pill: 'bg-red-100 text-red-800',      label: 'Rejected' },
  CANCELLED: { pill: 'bg-gray-100 text-gray-500',    label: 'Cancelled' },
}

const EMPTY_FORM = {
  resourceId: '', resourceName: '', bookingDate: '',
  startTime: '', endTime: '', purpose: '', expectedAttendees: '',
}

export default function BookingsPage() {
  const { user, isAdmin } = useAuth()
  const [searchParams]            = useSearchParams()
  const [bookings, setBookings]   = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [rejectModal, setRejectModal]     = useState(null)
  const [rejectReason, setRejectReason]   = useState('')
  const [submitting, setSubmitting]       = useState(false)

  // Filters
  const [filterStatus, setFilterStatus]     = useState('')
  const [filterResource, setFilterResource] = useState('')

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    resourceId:   searchParams.get('resourceId')   || '',
    resourceName: searchParams.get('resourceName') || '',
  })

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus)   params.status     = filterStatus
      if (filterResource) params.resourceId = filterResource
      const res = await bookingService.getAll(params)
      setBookings(res.data)
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }, [filterStatus, filterResource])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  useEffect(() => {
    resourceService.getAll({}).then(r => setResources(r.data)).catch(() => {})
    if (searchParams.get('resourceId')) setShowModal(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await bookingService.create(form)
      toast.success('Booking request submitted!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    } finally { setSubmitting(false) }
  }

  const handleApprove = async (id) => {
    try {
      await bookingService.approve(id)
      toast.success('Booking approved')
      fetchBookings()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please enter a reason'); return }
    try {
      await bookingService.reject(rejectModal, rejectReason)
      toast.success('Booking rejected')
      setRejectModal(null)
      setRejectReason('')
      fetchBookings()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await bookingService.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const onResourceChange = (e) => {
    const res = resources.find(r => r.id === e.target.value)
    setForm(f => ({ ...f, resourceId: e.target.value, resourceName: res?.name || '' }))
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'All booking requests' : 'Your booking requests'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by status</label>
            <select className="input" value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_STYLES).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter by resource</label>
              <select className="input" value={filterResource}
                onChange={e => setFilterResource(e.target.value)}>
                <option value="">All resources</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
          <button className="btn-secondary text-sm" onClick={() => {
            setFilterStatus(''); setFilterResource('')
          }}>Clear filters</button>
        </div>
      </div>

      {/* Bookings table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No bookings found</p>
          <p className="text-sm mt-1">
            {filterStatus || filterResource ? 'Try clearing your filters' : 'Click "+ New Booking" to get started'}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Resource</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Purpose</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium text-gray-600">Requested by</th>}
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.resourceName}</p>
                      {b.expectedAttendees && (
                        <p className="text-xs text-gray-400">{b.expectedAttendees} attendees</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <p>{b.bookingDate}</p>
                      <p className="text-xs text-gray-400">{b.startTime} – {b.endTime}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <p className="truncate">{b.purpose}</p>
                      {b.rejectionReason && (
                        <p className="text-xs text-red-500 mt-0.5">Reason: {b.rejectionReason}</p>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-gray-600">{b.userName}</td>
                    )}
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_STYLES[b.status]?.pill}`}>
                        {STATUS_STYLES[b.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {isAdmin && b.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(b.id)}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => { setRejectModal(b.id); setRejectReason('') }}
                              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        {(b.status === 'PENDING' || b.status === 'APPROVED') &&
                         (isAdmin || b.userId === user?.id) && (
                          <button onClick={() => handleCancel(b.id)}
                            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Request a booking</h2>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Resource *</label>
                <select className="input" value={form.resourceId} onChange={onResourceChange} required>
                  <option value="">Select a resource</option>
                  {resources.filter(r => r.status === 'ACTIVE').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.type.replace('_', ' ')} (capacity: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
                  <input type="date" className="input" value={form.bookingDate} min={today} required
                    onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Attendees</label>
                  <input type="number" className="input" value={form.expectedAttendees} min={1}
                    placeholder="e.g. 10"
                    onChange={e => setForm(f => ({ ...f, expectedAttendees: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start time *</label>
                  <input type="time" className="input" value={form.startTime} required
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End time *</label>
                  <input type="time" className="input" value={form.endTime} required
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Purpose *</label>
                <textarea className="input resize-none" rows={3} value={form.purpose} required
                  minLength={5} maxLength={500}
                  placeholder="Describe the purpose of this booking (min. 5 characters)"
                  onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">{form.purpose.length}/500</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Reject booking</h2>
              <button onClick={() => setRejectModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Rejection reason * (shown to the user)
                </label>
                <textarea className="input resize-none" rows={4}
                  placeholder="e.g. The room is reserved for an exam on that date"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleReject} className="btn-danger flex-1">
                  Confirm Rejection
                </button>
                <button className="btn-secondary" onClick={() => setRejectModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
