import { useState, useEffect } from 'react'
import { resourceService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  ACTIVE:            'bg-green-100 text-green-800',
  OUT_OF_SERVICE:    'bg-red-100 text-red-800',
  UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
}

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB:          'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT:    'Equipment',
}

export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filters, setFilters]     = useState({ type: '', location: '', minCapacity: '' })

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.type)        params.type = filters.type
      if (filters.location)    params.location = filters.location
      if (filters.minCapacity) params.minCapacity = filters.minCapacity
      const res = await resourceService.getAll(params)
      setResources(res.data)
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResources() }, [])

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and book campus facilities</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              className="input"
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            >
              <option value="">All types</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
            <input
              className="input"
              placeholder="e.g. Block A"
              value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Min capacity</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 30"
              value={filters.minCapacity}
              onChange={e => setFilters(f => ({ ...f, minCapacity: e.target.value }))}
            />
          </div>
        </div>
        <button onClick={fetchResources} className="btn-primary mt-4 text-sm">
          Search
        </button>
      </div>

      {/* Resource grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No resources found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <div key={r.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TYPE_LABELS[r.type]} · {r.location}
                  </p>
                </div>
                <span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span>
              </div>
              {r.capacity && (
                <p className="text-sm text-gray-600">Capacity: {r.capacity}</p>
              )}
              {r.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>
              )}
              {r.availabilityWindows?.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Available: {r.availabilityWindows.join(', ')}
                </p>
              )}
              {r.status === 'ACTIVE' && (
                <a
                  href={`/bookings/new?resourceId=${r.id}&resourceName=${encodeURIComponent(r.name)}`}
                  className="btn-primary text-sm mt-4 inline-block"
                >
                  Book this resource
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
