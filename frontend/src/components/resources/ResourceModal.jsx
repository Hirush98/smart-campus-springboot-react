import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AvailabilityPicker from './AvailabilityPicker'

const TYPE_OPTIONS = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
]

const BUILDING_OPTIONS = [
  { value: 'Main Building', label: 'Main Building' },
  { value: 'New Building', label: 'New Building' },
  { value: 'FoE Building', label: 'FoE Building' },
  { value: 'Computing Faculty Building', label: 'Computing Faculty Building' },
  { value: 'business Faculty Building', label: 'business Faculty Building' },
]

const EMPTY = {
  name: '',
  type: 'LECTURE_HALL',
  location: '',
  building: 'Main Building',
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
    const startHour = parseInt(start)
    const endHour = parseInt(end)

    if (!result[day]) result[day] = []
    result[day].push({ start: startHour, end: endHour })
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

/* ---------------- input sanitizers ---------------- */

const onlyLettersSpaces = (v) => v.replace(/[^A-Za-z\s]/g, '')
const lettersNumbersSpaces = (v) => v.replace(/[^A-Za-z0-9\s]/g, '')
const uppercaseLettersOnly = (v) => v.replace(/[^A-Z]/g, '')
const serialFormat = (v) => v.toUpperCase().replace(/[^A-Z0-9-]/g, '')

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
    if (!form.building) e.building = 'Building is required'
    if (!form.floor?.toString().trim()) e.floor = 'Floor is required'
    if (!form.capacity?.toString().trim()) e.capacity = 'Capacity is required'
    if (!form.description?.trim()) e.description = 'Description is required'

    if (form.capacity && parseInt(form.capacity) < 0) {
      e.capacity = 'Capacity cannot be negative'
    }

    if (form.floor && parseInt(form.floor) < 0) {
      e.floor = 'Floor cannot be negative'
    }

    // extra safety validation
    if (!/^[A-Za-z\s]+$/.test(form.name || '')) {
      e.name = 'Only letters and spaces allowed'
    }

    if (!/^[A-Za-z0-9\s]+$/.test(form.location || '')) {
      e.location = 'Only letters, numbers and spaces allowed'
    }

    if (!/^[A-Za-z0-9\s-]+$/.test(form.floor || '')) {
      e.floor = 'Only letters, numbers and spaces allowed'
    }

    if (form.manufacturer && !/^[A-Z]+$/.test(form.manufacturer)) {
      e.manufacturer = 'Only capital letters allowed'
    }

    if (form.serialNumber && !/^[A-Z0-9-]+$/.test(form.serialNumber)) {
      e.serialNumber = 'Only A-Z, 0-9 and - allowed'
    }

    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        availabilityWindows: formatAvailability(form.availabilityWindows)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-6">

      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[92vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-700">
            &times;
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* NAME */}
            <div className="sm:col-span-2">
              <label className="label">Resource Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={e => set('name', onlyLettersSpaces(e.target.value))}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* TYPE */}
            <div>
              <label className="label">Type *</label>
              <select
                className="input"
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* CAPACITY */}
            <div>
              <label className="label">Capacity *</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.capacity}
                onChange={e => {
                  const val = e.target.value
                  if (val === '' || parseInt(val) >= 0) set('capacity', val)
                }}
              />
              {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
            </div>

            {/* LOCATION */}
            <div>
              <label className="label">Location *</label>
              <input
                className="input"
                value={form.location}
                onChange={e => set('location', lettersNumbersSpaces(e.target.value))}
              />
              {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
            </div>

            {/* FLOOR */}
            <div>
              <label className="label">Floor *</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.floor}
                onChange={e => {
                  const val = e.target.value
                  if (val === '' || parseInt(val) >= 0) set('floor', val)
                }}
              />
              {errors.floor && <p className="text-xs text-red-500">{errors.floor}</p>}
            </div>

            {/* BUILDING */}
            <div>
              <label className="label">Building *</label>
              <select
                className="input"
                value={form.building}
                onChange={e => set('building', e.target.value)}
              >
                <option value="">Select a building</option>
                {BUILDING_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.building && <p className="text-xs text-red-500">{errors.building}</p>}
            </div>
          </div>

          {/* AVAILABILITY */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <p className="label">Availability</p>
              <button
                type="button"
                onClick={() => setShowAvailability(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
              >
                Set Availability
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(form.availabilityWindows || {}).flatMap(([day, slots]) =>
                slots.map((s, i) => (
                  <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {day} {s.start}:00-{s.end}:00
                  </span>
                ))
              )}
            </div>
          </div>

          {/* EQUIPMENT */}
          {form.type === 'EQUIPMENT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">

              <div>
                <label className="label">Serial Number</label>
                <input
                  className="input"
                  value={form.serialNumber}
                  onChange={e => set('serialNumber', serialFormat(e.target.value))}
                />
              </div>

              <div>
                <label className="label">Manufacturer</label>
                <input
                  className="input"
                  value={form.manufacturer}
                  onChange={e => set('manufacturer', uppercaseLettersOnly(e.target.value))}
                />
              </div>

            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <label className="label">Description *</label>
            <textarea
              className="input min-h-[90px]"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg"
          >
            {loading ? 'Saving...' : resource ? 'Update' : 'Create'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 border rounded-lg"
          >
            Cancel
          </button>
        </div>

      </div>

      {/* AVAILABILITY MODAL */}
      {showAvailability && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-4xl rounded-xl p-4">

            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Set Availability</h3>
              <button onClick={() => setShowAvailability(false)}>✕</button>
            </div>

            <AvailabilityPicker
              value={form.availabilityWindows}
              onChange={(val) => set('availabilityWindows', val)}
            />

            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setShowAvailability(false)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}