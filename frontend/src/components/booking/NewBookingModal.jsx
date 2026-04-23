import { useState, useEffect } from 'react'

/**
 * NewBookingModal
 * Slide-in modal with booking form. Validates time range client-side
 * before sending to backend. Pre-fills resource if coming from ResourcesPage.
 * Module B - Implemented by: Member 1 (team lead)
 */
const EMPTY = {
  resourceId: '', resourceName: '', bookingDate: '',
  startTime: '', endTime: '', purpose: '', expectedAttendees: '',
}

export default function NewBookingModal({ show, onClose, onSubmit, resources, prefill }) {
  const [form, setForm]           = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]       = useState({})

  // Pre-fill when arriving from Resources page
  useEffect(() => {
    if (prefill?.resourceId) {
      setForm(f => ({ ...f, resourceId: prefill.resourceId, resourceName: prefill.resourceName || '' }))
    }
  }, [prefill])

  useEffect(() => {
    if (!show) { setForm(EMPTY); setErrors({}) }
  }, [show])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const onResourceChange = (e) => {
    const res = resources.find(r => r.id === e.target.value)
    setForm(f => ({ ...f, resourceId: e.target.value, resourceName: res?.name || '' }))
    setErrors(e2 => ({ ...e2, resourceId: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.resourceId)   e.resourceId   = 'Please select a resource'
    if (!form.bookingDate)  e.bookingDate  = 'Date is required'
    if (!form.startTime)    e.startTime    = 'Start time is required'
    if (!form.endTime)      e.endTime      = 'End time is required'
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      e.endTime = 'End time must be after start time'
    if (!form.purpose || form.purpose.trim().length < 5)
      e.purpose = 'Purpose must be at least 5 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await onSubmit(form)
      setForm(EMPTY)
    } finally {
      setSubmitting(false)
    }
  }

  if (!show) return null

  const today = new Date().toISOString().split('T')[0]
  const activeResources = resources.filter(r => r.status === 'ACTIVE')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Request a booking</h2>
            <p className="text-xs text-gray-400 mt-0.5">All active resources are available below</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8
                       flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Resource */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Resource <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.resourceId ? 'border-red-300' : ''}`}
              value={form.resourceId}
              onChange={onResourceChange}
            >
              <option value="">Select a resource…</option>
              {activeResources.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.type?.replace(/_/g,' ')} · {r.location}
                  {r.capacity ? ` · ${r.capacity} seats` : ''}
                </option>
              ))}
            </select>
            {errors.resourceId && <p className="text-xs text-red-500 mt-1">{errors.resourceId}</p>}
          </div>

          {/* Date + Attendees */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`input ${errors.bookingDate ? 'border-red-300' : ''}`}
                value={form.bookingDate}
                min={today}
                onChange={e => set('bookingDate', e.target.value)}
              />
              {errors.bookingDate && <p className="text-xs text-red-500 mt-1">{errors.bookingDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Expected attendees
              </label>
              <input
                type="number"
                className="input"
                value={form.expectedAttendees}
                min={1}
                max={1000}
                placeholder="e.g. 10"
                onChange={e => set('expectedAttendees', e.target.value)}
              />
            </div>
          </div>

          {/* Start + End time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={`input ${errors.startTime ? 'border-red-300' : ''}`}
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
              />
              {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={`input ${errors.endTime ? 'border-red-300' : ''}`}
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
              />
              {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Purpose <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(min. 5 characters)</span>
            </label>
            <textarea
              className={`input resize-none ${errors.purpose ? 'border-red-300' : ''}`}
              rows={3}
              value={form.purpose}
              maxLength={500}
              placeholder="Describe why you need this resource…"
              onChange={e => set('purpose', e.target.value)}
            />
            <div className="flex justify-between mt-1">
              {errors.purpose
                ? <p className="text-xs text-red-500">{errors.purpose}</p>
                : <span />}
              <p className="text-xs text-gray-400">{form.purpose.length}/500</p>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
            Your request will be reviewed by an admin. You will be notified once it is approved or rejected.
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
