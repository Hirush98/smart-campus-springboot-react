import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AvailabilityPicker from './AvailabilityPicker'

const TYPE_OPTIONS = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
]

const EMPTY = {
  name: '',
  type: 'LECTURE_HALL',
  location: '',
  building: '',
  floor: '',
  capacity: '',
  description: '',
  availabilityWindows: {},
  serialNumber: '',
  manufacturer: '',
}

/* ---------------- helpers ---------------- */

// backend → UI
const parseAvailability = (arr = []) => {
  const result = {}

  arr.forEach(item => {
    const [day, time] = item.split(' ')
    if (!day || !time) return

    const [start, end] = time.split('-')
    if (!start || !end) return

    const startHour = parseInt(start)
    const endHour = parseInt(end)

    if (!result[day]) result[day] = []

    result[day].push({
      start: startHour,
      end: endHour
    })
  })

  return result
}

// UI → backend
const formatAvailability = (data = {}) => {
  const result = []

  Object.entries(data).forEach(([day, slots]) => {
    slots.forEach(slot => {
      result.push(`${day} ${slot.start}:00-${slot.end}:00`)
    })
  })

  return result
}

/* ---------------- component ---------------- */


export default function ResourceModal({ show, onClose, onSubmit, resource }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)


  useEffect(() => {
    if (resource) {
      setForm({
        ...resource,
        capacity: resource.capacity || '',
        availabilityWindows: parseAvailability(resource.availabilityWindows || []),
        serialNumber: resource.serialNumber || '',
        manufacturer: resource.manufacturer || '',
        building: resource.building || '',
        floor: resource.floor || '',
        description: resource.description || '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [resource, show])

  if (!show) return null

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = 'Name is required'
    if (!form.type) e.type = 'Type is required'
    if (!form.location?.trim()) e.location = 'Location is required'
    if (form.capacity && parseInt(form.capacity) < 1) e.capacity = 'Capacity must be at least 1'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const data = {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        // 🔥 IMPORTANT CONVERSION HERE
        availabilityWindows: formatAvailability(form.availabilityWindows)
      }
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-light"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Resource Name *
              </label>
              <input
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Auditorium A, Cisco Lab"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Type *
              </label>
              <select
                className="input"
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Capacity
              </label>
              <input
                type="number"
                className={`input ${errors.capacity ? 'border-red-500' : ''}`}
                value={form.capacity}
                onChange={e => set('capacity', e.target.value)}
                placeholder="e.g. 50"
              />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Location *
              </label>
              <input
                className={`input ${errors.location ? 'border-red-500' : ''}`}
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Block A, Room 101"
              />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>

            {/* Building */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Building
              </label>
              <input
                className="input"
                value={form.building}
                onChange={e => set('building', e.target.value)}
                placeholder="e.g. Faculty of Engineering"
              />
            </div>

            {/* Floor */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Floor
              </label>
              <input
                className="input"
                value={form.floor}
                onChange={e => set('floor', e.target.value)}
                placeholder="e.g. 3rd Floor"
              />
            </div>

            {/* Availability */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Availability Windows
              </label>

              {/* BUTTON */}
              <button
                type="button"
                onClick={() => setShowAvailability(true)}
                className="btn-secondary w-full"
              >
                Set Availability
              </button>

              {/* SUMMARY */}
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(form.availabilityWindows || {}).map(([day, slots]) =>
                  slots.map((s, i) => (
                    <span
                      key={`${day}-${i}`}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {day} {s.start}:00-{s.end}:00
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Equipment Specific */}
          {form.type === 'EQUIPMENT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Serial Number
                </label>
                <input
                  className="input"
                  value={form.serialNumber}
                  onChange={e => set('serialNumber', e.target.value)}
                  placeholder="e.g. SN-12345"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Manufacturer
                </label>
                <input
                  className="input"
                  value={form.manufacturer}
                  onChange={e => set('manufacturer', e.target.value)}
                  placeholder="e.g. Dell, HP"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Description
            </label>
            <textarea
              className="input min-h-[80px] sm:min-h-[100px]"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Provide some details about the resource..."
            />
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t flex-shrink-0">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 py-3"
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : resource ? 'Update Resource' : 'Create Resource'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-3 px-4 sm:px-8"
          >
            Cancel
          </button>
        </div>

      </div>
      {showAvailability && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-3">
              Select Availability
            </h2>

            <AvailabilityPicker
              value={form.availabilityWindows}
              onChange={(val) => set('availabilityWindows', val)}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                type="button"
                className="btn-secondary py-2 px-4"
                onClick={() => setShowAvailability(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-primary py-2 px-4"
                onClick={() => setShowAvailability(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
