import { useState, useEffect } from 'react'

/**
 * RejectModal
 * Admin-only modal that requires a rejection reason before submitting.
 * The reason is stored on the booking and shown to the user.
 * Module B - Implemented by: Member 1 (team lead)
 */
export default function RejectModal({ bookingId, onConfirm, onClose }) {
  const [reason, setReason]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!bookingId) { setReason(''); setError('') }
  }, [bookingId])

  const handleConfirm = async () => {
    if (!reason.trim()) { setError('Please enter a rejection reason'); return }
    if (reason.trim().length < 5) { setError('Reason must be at least 5 characters'); return }
    setLoading(true)
    try {
      await onConfirm(bookingId, reason.trim())
      setReason('')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Reject booking</h2>
            <p className="text-xs text-gray-400 mt-0.5">The reason will be shown to the user</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8
                       flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`input resize-none ${error ? 'border-red-300' : ''}`}
              rows={4}
              placeholder="e.g. The room is already reserved for an exam on that date"
              value={reason}
              onChange={e => { setReason(e.target.value); setError('') }}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn-danger flex-1 disabled:opacity-50"
            >
              {loading ? 'Rejecting…' : 'Confirm rejection'}
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
