import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { bookingService, resourceService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import BookingStats   from '../components/booking/BookingStats'
import BookingFilters from '../components/booking/BookingFilters'
import BookingTable   from '../components/booking/BookingTable'
import NewBookingModal from '../components/booking/NewBookingModal'
import RejectModal    from '../components/booking/RejectModal'
import toast from 'react-hot-toast'

/**
 * BookingsPage
 * Module B — Booking Management
 * Implemented by: Member 1 (team lead)
 *
 * Features:
 *  - Stats summary bar (pending / approved / rejected / total)
 *  - Status filter chips + resource dropdown (admin only)
 *  - Table with approve / reject / cancel actions per row
 *  - New booking modal with client-side validation
 *  - Reject modal requiring admin to enter a reason
 */
export default function BookingsPage() {
  const { user, isAdmin }         = useAuth()
  const [searchParams]            = useSearchParams()

  const [allBookings, setAllBookings] = useState([])   // full list for stats
  const [bookings, setBookings]       = useState([])   // filtered list for table
  const [resources, setResources]     = useState([])
  const [loading, setLoading]         = useState(true)

  const [filterStatus,   setFilterStatus]   = useState('')
  const [filterResource, setFilterResource] = useState('')

  const [showNewModal, setShowNewModal]   = useState(false)
  const [rejectBookingId, setRejectBookingId] = useState(null)

  // Pre-fill from ResourcesPage "Book this resource" link
  const prefill = {
    resourceId:   searchParams.get('resourceId')   || '',
    resourceName: searchParams.get('resourceName') || '',
  }

  // Load resources for the form dropdown
  useEffect(() => {
    resourceService.getAll({})
      .then(r => setResources(r.data))
      .catch(() => toast.error('Could not load resources'))

    // Auto-open modal if arriving from Resources page
    if (searchParams.get('resourceId')) setShowNewModal(true)
  }, [])

  // Fetch bookings (re-runs when filters change)
  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus)   params.status     = filterStatus
      if (filterResource) params.resourceId = filterResource

      const res = await bookingService.getAll(params)
      setBookings(res.data)

      // Always fetch unfiltered for stats
      const allRes = await bookingService.getAll({})
      setAllBookings(allRes.data)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterResource])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = async (form) => {
    try {
      await bookingService.create(form)
      toast.success('Booking request submitted! Awaiting admin approval.')
      setShowNewModal(false)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking')
      throw err // let modal keep form open
    }
  }

  const handleApprove = async (id) => {
    try {
      await bookingService.approve(id)
      toast.success('Booking approved — user will be notified')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed')
    }
  }

  const handleRejectConfirm = async (id, reason) => {
    try {
      await bookingService.reject(id, reason)
      toast.success('Booking rejected — user will be notified')
      setRejectBookingId(null)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed')
      throw err
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await bookingService.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    }
  }

  const handleClearFilters = () => {
    setFilterStatus('')
    setFilterResource('')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Layout>

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage all booking requests' : 'Your booking requests'}
          </p>
        </div>
        <button
          className="btn-primary sm:self-start"
          onClick={() => setShowNewModal(true)}
        >
          + New booking
        </button>
      </div>

      {/* Stats bar */}
      <BookingStats bookings={allBookings} />

      {/* Filters */}
      <BookingFilters
        isAdmin={isAdmin}
        resources={resources}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterResource={filterResource}
        setFilterResource={setFilterResource}
        onClear={handleClearFilters}
      />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-9 w-9 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <BookingTable
          bookings={bookings}
          isAdmin={isAdmin}
          userId={user?.id}
          onApprove={handleApprove}
          onReject={(id) => setRejectBookingId(id)}
          onCancel={handleCancel}
        />
      )}

      {/* New booking modal */}
      <NewBookingModal
        show={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleCreate}
        resources={resources}
        prefill={prefill}
      />

      {/* Reject reason modal */}
      <RejectModal
        bookingId={rejectBookingId}
        onConfirm={handleRejectConfirm}
        onClose={() => setRejectBookingId(null)}
      />

    </Layout>
  )
}
