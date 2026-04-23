import { useState, useEffect } from 'react'
import { resourceService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import ResourceModal from '../components/resources/ResourceModal'

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
  const { isAdmin }               = useAuth()
  const [showModal, setShowModal] = useState(false)

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

  const handleCreate = async (data) => {
    try {
      await resourceService.create(data)
      toast.success('Resource created')
      setShowModal(false)
      fetchResources()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resource')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and book campus facilities</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Add Resource
          </button>
        )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(r => (
            <div key={r.id} className="card hover:shadow-lg transition-all flex flex-col h-full overflow-hidden p-0">
              {/* Image Preview */}
              <div className="aspect-video w-full bg-gray-100 relative overflow-hidden group">
                {r.imageUrls?.length > 0 ? (
                  <img 
                    src={r.imageUrls[0]} 
                    alt={r.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`badge shadow-sm ${STATUS_COLORS[r.status]}`}>{r.status?.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{r.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {TYPE_LABELS[r.type] || r.type}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {r.location}{r.building ? `, ${r.building}` : ''}
                  </div>
                  {r.capacity && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Capacity: {r.capacity}
                    </div>
                  )}
                </div>

                {r.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{r.description}</p>
                )}

                <p className='text-blue-600 hover:underline cursor-pointer text-sm' >
                  View More...
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  {r.status === 'ACTIVE' ? (
                    <a
                      href={`/bookings/new?resourceId=${r.id}&resourceName=${encodeURIComponent(r.name)}`}
                      className="btn-primary text-sm w-full text-center block"
                    >
                      Book Now
                    </a>
                  ) : (
                    <button disabled className="btn-secondary text-sm w-full cursor-not-allowed opacity-60">
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResourceModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
      />
    </Layout>
  )
}
