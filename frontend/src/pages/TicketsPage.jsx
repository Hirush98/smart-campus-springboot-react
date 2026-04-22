import { useState, useEffect } from 'react'
import { ticketService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

const STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED:    'bg-green-100 text-green-800',
  CLOSED:      'bg-slate-100 text-slate-600',
  REJECTED:    'bg-rose-100 text-rose-800',
}

const PRIORITY_COLORS = {
  LOW:      'bg-slate-100 text-slate-600',
  MEDIUM:   'bg-blue-100 text-blue-700',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-rose-100 text-rose-800',
}

const CATEGORIES = ['ELECTRICAL','PLUMBING','HVAC','IT_EQUIPMENT','FURNITURE','SAFETY','CLEANING','OTHER']

export default function TicketsPage() {
  const { user, isAdmin, isTechnician } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  
  // Search & Filter state
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  
  const [form, setForm] = useState({
    title: '', description: '', category: 'IT_EQUIPMENT',
    priority: 'MEDIUM', location: '', contactDetails: '',
  })
  const [files, setFiles] = useState([])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await ticketService.getAll()
      // Handle HATEOAS response structure
      const data = res.data._embedded?.ticketList || res.data._embedded?.tickets || (Array.isArray(res.data) ? res.data : [])
      setTickets(data)
    } catch { toast.error('Failed to load tickets') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTickets() }, [])

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const openTicket = async (ticket) => {
    setSelected(ticket)
    try {
      const res = await ticketService.getComments(ticket.id)
      setComments(res.data)
    } catch {}
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    
    // Append ticket data as a JSON blob
    formData.append('ticket', new Blob([JSON.stringify(form)], { type: 'application/json' }))
    
    // Append files
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      await ticketService.create(formData)
      toast.success('Ticket submitted successfully!')
      setShowForm(false)
      setForm({
        title: '', description: '', category: 'IT_EQUIPMENT',
        priority: 'MEDIUM', location: '', contactDetails: '',
      })
      setFiles([])
      fetchTickets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await ticketService.addComment(selected.id, { content: newComment })
      setComments(c => [...c, res.data])
      setNewComment('')
    } catch { toast.error('Failed to add comment') }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await ticketService.deleteComment(selected.id, commentId)
      setComments(c => c.filter(item => item.id !== commentId))
      toast.success('Comment deleted')
    } catch { toast.error('Failed to delete comment') }
  }

  const handleStatusUpdate = async (newStatus) => {
    const notes = window.prompt('Add resolution or status notes (optional):')
    try {
      const res = await ticketService.updateStatus(selected.id, newStatus, notes)
      setSelected(res.data)
      fetchTickets() // Refresh list
      toast.success('Status updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Maintenance Hub</h1>
          <p className="text-slate-500 font-medium mt-1">Report and track campus incidents</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2 group" 
          onClick={() => setShowForm(s => !s)}
        >
          {showForm ? <XMarkIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform" />}
          <span>{showForm ? 'Cancel Report' : 'Report Incident'}</span>
        </button>
      </div>

      {/* New ticket form (Glassmorphism) */}
      {showForm && (
        <div className="card mb-8 animate-fade-in border-blue-100 bg-blue-50/30">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PlusIcon className="h-5 w-5 text-blue-600" />
            New Incident Report
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Title</label>
              <input className="input" value={form.title} required
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Briefly describe the issue (e.g., Leaking pipe in Library)" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Category</label>
              <select className="input" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Priority Level</label>
              <select className="input" value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Specific Location</label>
              <input className="input" value={form.location} required
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g., Block B, 2nd Floor Hallway" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Your Contact Info</label>
              <input className="input" value={form.contactDetails} required
                onChange={e => setForm(f => ({ ...f, contactDetails: e.target.value }))}
                placeholder="Phone or internal extension" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Full Description</label>
              <textarea className="input resize-none" rows={4} value={form.description} required
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Provide as much detail as possible to help the maintenance team..." />
            </div>

            {/* File Upload Section (Innovation Item) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Attach Photos</label>
              <div className="flex flex-wrap gap-3">
                <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all">
                  <PhotoIcon className="h-8 w-8" />
                  <span className="text-[10px] font-bold mt-1 uppercase">Add</span>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
                {files.map((file, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden group shadow-sm">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex gap-4 pt-2">
              <button type="submit" className="btn-primary flex-1 py-4">Submit Report</button>
              <button type="button" className="btn-secondary px-8" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-[280px]">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            className="input pl-11 py-2.5" 
            placeholder="Search tickets..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <FunnelIcon className="h-5 w-5 text-slate-400" />
          <select 
            className="input py-2 text-sm w-40" 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No matching tickets found.</p>
            </div>
          ) : filteredTickets.map(t => (
            <div
              key={t.id}
              className={`card cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300
                ${selected?.id === t.id ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
              onClick={() => openTicket(t)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">#{t.id.slice(-6)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{t.category?.replace('_',' ')}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 truncate text-lg">{t.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-medium">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {t.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`badge ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status?.replace('_',' ')}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-4 line-clamp-2 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="card h-fit sticky top-24 border-blue-50 animate-fade-in shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400">TICKET DETAILS</span>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-slate-100 rounded-full">
                  <XMarkIcon className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">{selected.title}</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Status & Priority</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`badge ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority}</span>
                    <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status.replace('_',' ')}</span>
                    
                    {(isAdmin || isTechnician) && selected.status !== 'CLOSED' && selected.status !== 'CANCELLED' && (
                      <select 
                        className="text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 outline-none hover:bg-slate-50 cursor-pointer"
                        value={selected.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                      >
                        <option value="" disabled>Change Status</option>
                        {selected.status === 'OPEN' && <option value="IN_PROGRESS">Set In Progress</option>}
                        {selected.status === 'OPEN' && <option value="REJECTED">Reject Ticket</option>}
                        {selected.status === 'IN_PROGRESS' && <option value="RESOLVED">Mark Resolved</option>}
                        {selected.status === 'IN_PROGRESS' && <option value="REJECTED">Reject Ticket</option>}
                        {selected.status === 'RESOLVED' && <option value="CLOSED">Final Close</option>}
                      </select>
                    )}

                    {/* Allow reporter to cancel their own ticket if not closed */}
                    {user?.id === selected.reportedBy && !['CLOSED', 'CANCELLED', 'REJECTED'].includes(selected.status) && (
                       <button 
                        onClick={() => handleStatusUpdate('CANCELLED')}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded transition-colors"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>
                </div>

                {/* Images in detail */}
                {selected.attachmentUrls?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Attachments</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selected.attachmentUrls.map((url, i) => (
                        <a key={i} href={`http://localhost:8081${url}`} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                           <img src={`http://localhost:8081${url}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Discussion ({comments.length})
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 scrollbar-hide">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No comments yet.</p>
                  ) : comments.map(c => (
                    <div key={c.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[11px] text-blue-600 uppercase tracking-tight">{c.authorName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                          {(isAdmin || user?.id === c.authorId) && (
                            <button 
                              onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    className="input py-2 text-xs"
                    placeholder="Type your message..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button type="submit" className="btn-primary p-2 flex-shrink-0">
                     <PlusIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
             <div className="hidden lg:flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
               <svg className="h-16 w-16 mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <p className="text-sm font-medium">Select a ticket from the list <br/> to view full details</p>
             </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

