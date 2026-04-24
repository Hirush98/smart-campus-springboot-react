import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const TYPE_OPTIONS = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB',          label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT',    label: 'Equipment' },
]

const EMPTY = {
  name: '',
  type: 'LECTURE_HALL',
  location: '',
  building: '',
  floor: '',
  capacity: '',
  description: '',
  availabilityWindows: '',
  serialNumber: '',
  manufacturer: '',
}

export default function ResourceModal({ show, onClose, onSubmit, resource }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (resource) {
      setForm({
        ...resource,
        capacity: resource.capacity || '',
        availabilityWindows: resource.availabilityWindows?.join(', ') || '',
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
    if (!form.name?.trim())     e.name = 'Name is required'
    if (!form.type)             e.type = 'Type is required'
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
        availabilityWindows: form.availabilityWindows
          ? form.availabilityWindows.split(',').map(s => s.trim()).filter(s => s)
          : []
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
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Availability Windows
              </label>
              <input
                className="input"
                value={form.availabilityWindows}
                onChange={e => set('availabilityWindows', e.target.value)}
                placeholder="e.g. 08:00-18:00, 10:00-14:00"
              />
              <p className="text-[10px] text-gray-400 mt-1">Comma separated time ranges</p>
            </div>
          </div>

          {/* Equipment Specific */}
          {form.type === 'EQUIPMENT' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
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
              className="input min-h-[100px]"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Provide some details about the resource..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3"
            >
              {loading ? 'Saving...' : resource ? 'Update Resource' : 'Create Resource'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-8"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
