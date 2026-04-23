/**
 * BookingFilters
 * Status filter chips + admin resource/user dropdowns
 * Module B - Implemented by: Member 1 (team lead)
 */
const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
const STATUS_LABELS  = { PENDING:'Pending', APPROVED:'Approved', REJECTED:'Rejected', CANCELLED:'Cancelled' }

export default function BookingFilters({
  isAdmin, resources,
  filterStatus, setFilterStatus,
  filterResource, setFilterResource,
  onClear,
}) {
  return (
    <div className="card mb-5">
      <div className="flex flex-wrap items-center gap-2">

        {/* Status chips */}
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${!filterStatus
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${filterStatus === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}

        {/* Admin-only resource filter */}
        {isAdmin && (
          <>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <select
              className="input text-sm py-1.5"
              style={{ width: 'auto' }}
              value={filterResource}
              onChange={e => setFilterResource(e.target.value)}
            >
              <option value="">All resources</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </>
        )}

        {/* Clear */}
        {(filterStatus || filterResource) && (
          <button
            onClick={onClear}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
