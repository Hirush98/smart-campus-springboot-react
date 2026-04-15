import { useState, useEffect } from 'react'
import { ticketService } from '../services/api'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED:    'bg-green-100 text-green-800',
  CLOSED:      'bg-gray-100 text-gray-600',
  REJECTED:    'bg-red-100 text-red-800',
}

const PRIORITY_COLORS = {
  LOW:      'bg-gray-100 text-gray-600',
  MEDIUM:   'bg-blue-100 text-blue-700',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-800',
}

export default function TicketsPage() {
  const [tickets, setTickets]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [selected, setSelected]   = useState(null)
  const [comments, setComments]   = useState([])
  const [newComment, setNewComment] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', category: 'IT_EQUIPMENT',
    priority: 'MEDIUM', location: '', contactDetails: '',
  })

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await ticketService.getAll()
      setTickets(res.data)
    } catch { toast.error('Failed to load tickets') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTickets() }, [])

  const openTicket = async (ticket) => {
    setSelected(ticket)
    try {
      const res = await ticketService.getComments(ticket.id)
      setComments(res.data)
    } catch {}
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await ticketService.create(form)
      toast.success('Ticket submitted!')
      setShowForm(false)
      fetchTickets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await ticketService.addComment(selected.id, newComment)
      setComments(c => [...c, res.data])
      setNewComment('')
    } catch { toast.error('Failed to add comment') }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Report and track maintenance incidents</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Hide form' : '+ New Ticket'}
        </button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Report an incident</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input className="input" value={form.title} required
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Brief summary of the issue" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select className="input" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['ELECTRICAL','PLUMBING','HVAC','IT_EQUIPMENT','FURNITURE','SAFETY','CLEANING','OTHER']
                  .map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select className="input" value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <input className="input" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Block B, Room 204" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contact details</label>
              <input className="input" value={form.contactDetails}
                onChange={e => setForm(f => ({ ...f, contactDetails: e.target.value }))}
                placeholder="Phone / email" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea className="input resize-none" rows={4} value={form.description} required
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Submit Ticket</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No tickets yet.</div>
          ) : tickets.map(t => (
            <div
              key={t.id}
              className={`card cursor-pointer hover:shadow-md transition-shadow
                ${selected?.id === t.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => openTicket(t)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{t.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t.location}</p>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <span className={`badge ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{t.description}</p>
            </div>
          ))}
        </div>

        {/* Ticket detail / comments panel */}
        {selected && (
          <div className="card h-fit sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-1">{selected.title}</h2>
            <div className="flex gap-2 mb-3">
              <span className={`badge ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority}</span>
              <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{selected.description}</p>

            {selected.assigneeName && (
              <p className="text-xs text-gray-500 mb-4">
                Assigned to: <span className="font-medium">{selected.assigneeName}</span>
              </p>
            )}
            {selected.resolutionNotes && (
              <div className="bg-green-50 rounded-lg p-3 mb-4 text-sm text-green-800">
                <strong>Resolution:</strong> {selected.resolutionNotes}
              </div>
            )}

            {/* Comments */}
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Comments ({comments.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {comments.map(c => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-2 text-sm">
                  <span className="font-medium text-gray-700">{c.authorName}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  <p className="text-gray-600 mt-0.5">{c.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="Add a comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn-primary text-sm px-3">Post</button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
