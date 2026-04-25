import { useState, useEffect } from 'react'
import { bookingService, ticketService, resourceService, authService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'
import ResourceModal from '../components/resources/ResourceModal'
import QRModal from '../components/resources/QRModal'
import ImageUploadManager from '../components/resources/ImageUploadManager'

export default function AdminPage() {
  const [tab, setTab]           = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets]   = useState([])
  const [resources, setResources] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [assigningTicketId, setAssigningTicketId] = useState(null)
  const [selectedTechId, setSelectedTechId] = useState('')
  const [loading, setLoading]   = useState(true)

  // Modals state
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [showQRModal, setShowQRModal]             = useState(false)
  const [selectedResource, setSelectedResource]   = useState(null)

  useEffect(() => {
    Promise.all([
      bookingService.getAll(),
      ticketService.getAll(),
      resourceService.getAll({}),
      authService.getTechnicians(),
    ]).then(([b, t, r, techRes]) => {
      setBookings(b.data)
      // Extract tickets from HATEOAS structure
      const ticketData = t.data._embedded?.ticketList || t.data._embedded?.tickets || (Array.isArray(t.data) ? t.data : [])
      setTickets(ticketData)
      setResources(r.data)
      setTechnicians(techRes.data)
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    try {
      await bookingService.approve(id)
      toast.success('Booking approved')
      const res = await bookingService.getAll()
      setBookings(res.data)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await bookingService.reject(id, reason)
      toast.success('Booking rejected')
      const res = await bookingService.getAll()
      setBookings(res.data)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleAssignTicket = async (id) => {
    if (!selectedTechId) {
      toast.error('Please select a technician')
      return
    }
    const tech = technicians.find(t => t.id === selectedTechId)
    if (!tech) return

    try {
      await ticketService.assign(id, tech.id, tech.name)
      toast.success('Technician assigned')
      const res = await ticketService.getAll()
      const ticketData = res.data._embedded?.ticketList || res.data._embedded?.tickets || (Array.isArray(res.data) ? res.data : [])
      setTickets(ticketData)
      setAssigningTicketId(null)
      setSelectedTechId('')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  // ── Resource Handlers ──────────────────────────────────────────────────────

  const fetchResources = async () => {
    const res = await resourceService.getAll({})
    setResources(res.data)
  }

  const handleCreateResource = async (data) => {
    try {
      await resourceService.create(data)
      toast.success('Resource created')
      setShowResourceModal(false)
      fetchResources()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleUpdateResource = async (data) => {
    try {
      await resourceService.update(selectedResource.id, data)
      toast.success('Resource updated')
      setShowResourceModal(false)
      fetchResources()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure? This will delete all bookings and images for this resource.')) return
    try {
      await resourceService.delete(id)
      toast.success('Resource deleted')
      fetchResources()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleSetStatus = async (id, status) => {
    try {
      await resourceService.setStatus(id, status)
      toast.success(`Status updated to ${status}`)
      fetchResources()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const tabs = [
    { id: 'bookings', label: `Bookings (${bookings.filter(b => b.status === 'PENDING').length} pending)` },
    { id: 'tickets',  label: `Tickets (${tickets.filter(t => t.status === 'OPEN').length} open)` },
    { id: 'resources',label: `Resources (${resources.length})` },
  ]

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Manage bookings, tickets, and resources</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Bookings tab */}
          {tab === 'bookings' && (
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No bookings.</p>
              ) : bookings.map(b => (
                <div key={b.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{b.resourceName}</h3>
                        <span className={`badge text-xs
                          ${b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            b.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        By {b.userName} · {b.bookingDate} · {b.startTime}–{b.endTime}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{b.purpose}</p>
                    </div>
                    {b.status === 'PENDING' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApprove(b.id)} className="btn-primary text-sm px-3 py-1.5">
                          Approve
                        </button>
                        <button onClick={() => handleReject(b.id)} className="btn-danger text-sm px-3 py-1.5">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tickets tab */}
          {tab === 'tickets' && (
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No tickets.</p>
              ) : tickets.map(t => (
                <div key={t.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{t.title}</h3>
                        <span className={`badge text-xs
                          ${t.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                            t.priority === 'HIGH'     ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                        <span className="badge bg-blue-100 text-blue-700 text-xs">{t.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {t.location} · Reported by {t.reporterName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.description}</p>
                      {t.assigneeName && (
                        <p className="text-xs text-gray-400 mt-1">Assigned to: {t.assigneeName}</p>
                      )}
                    </div>
                    {!t.assignedTo && t.status === 'OPEN' && (
                      assigningTicketId === t.id ? (
                        <div className="flex gap-2 items-center flex-shrink-0">
                          <select 
                            className="input py-1 text-sm min-w-[150px]"
                            value={selectedTechId}
                            onChange={(e) => setSelectedTechId(e.target.value)}
                          >
                            <option value="" disabled>Select Tech</option>
                            {technicians.map(tech => (
                              <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleAssignTicket(t.id)} className="btn-primary text-sm px-3 py-1">Save</button>
                          <button onClick={() => setAssigningTicketId(null)} className="btn-secondary text-sm px-3 py-1">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningTicketId(t.id)}
                          className="btn-secondary text-sm flex-shrink-0"
                        >
                          Assign
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resources tab */}
          {tab === 'resources' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={() => { setSelectedResource(null); setShowResourceModal(true) }}
                  className="btn-primary text-sm"
                >
                  + Add Resource
                </button>
              </div>

              {resources.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No resources.</p>
              ) : resources.map(r => (
                <div key={r.id} className="card">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{r.name}</h3>
                        <p className="text-sm text-gray-500">{r.type} · {r.location}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{r.id}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <select 
                          className={`badge border-none outline-none cursor-pointer
                            ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              r.status === 'OUT_OF_SERVICE' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                          value={r.status}
                          onChange={(e) => handleSetStatus(r.id, e.target.value)}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                          <option value="UNDER_MAINTENANCE">MAINTENANCE</option>
                        </select>
                        <button 
                          onClick={() => { setSelectedResource(r); setShowQRModal(true) }}
                          className="text-blue-600 text-xs hover:underline"
                        >
                          View QR Code
                        </button>
                      </div>
                    </div>

                    {/* Image manager for existing resource */}
                    <div className="border-t pt-4">
                      <ImageUploadManager 
                        resourceId={r.id} 
                        imageUrls={r.imageUrls} 
                        onUpdate={fetchResources}
                      />
                    </div>

                    <div className="flex gap-2 border-t pt-4">
                      <button 
                        onClick={() => { setSelectedResource(r); setShowResourceModal(true) }}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Edit Details
                      </button>
                      <button 
                        onClick={() => handleDeleteResource(r.id)}
                        className="btn-danger text-xs px-3 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modals */}
          <ResourceModal
            show={showResourceModal}
            resource={selectedResource}
            onClose={() => setShowResourceModal(false)}
            onSubmit={selectedResource ? handleUpdateResource : handleCreateResource}
          />

          <QRModal
            show={showQRModal}
            resourceId={selectedResource?.id}
            resourceName={selectedResource?.name}
            onClose={() => setShowQRModal(false)}
          />
        </>
      )}
    </Layout>
  )
}
