import StatusBadge from './StatusBadge'

/**
 * BookingTable
 * Main table — adapts columns based on isAdmin flag.
 * Action buttons are only shown for valid workflow transitions.
 * Module B - Implemented by: Member 1 (team lead)
 */
export default function BookingTable({ bookings, isAdmin, userId, onApprove, onReject, onCancel }) {

  if (bookings.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-400 text-base">No bookings found</p>
        <p className="text-gray-300 text-sm mt-1">Try adjusting your filters or create a new booking</p>
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                  style={{ width: '20%' }}>Resource</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                  style={{ width: '18%' }}>Date & time</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                  style={{ width: isAdmin ? '22%' : '30%' }}>Purpose</th>
              {isAdmin && (
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                    style={{ width: '14%' }}>Requested by</th>
              )}
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                  style={{ width: '13%' }}>Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                  style={{ width: isAdmin ? '13%' : '19%' }}>Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {bookings.map(b => (
              <BookingRow
                key={b.id}
                booking={b}
                isAdmin={isAdmin}
                isOwner={b.userId === userId}
                onApprove={onApprove}
                onReject={onReject}
                onCancel={onCancel}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BookingRow({ booking: b, isAdmin, isOwner, onApprove, onReject, onCancel }) {
  const canCancel = (b.status === 'PENDING' || b.status === 'APPROVED') && (isAdmin || isOwner)
  const canApprove = isAdmin && b.status === 'PENDING'
  const canReject  = isAdmin && b.status === 'PENDING'

  return (
    <tr className="hover:bg-gray-50 transition-colors align-middle">

      {/* Resource */}
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900 truncate">{b.resourceName}</p>
        {b.expectedAttendees && (
          <p className="text-xs text-gray-400 mt-0.5">{b.expectedAttendees} attendees</p>
        )}
      </td>

      {/* Date & time */}
      <td className="px-4 py-3 text-gray-600">
        <p>{b.bookingDate}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {b.startTime} – {b.endTime}
        </p>
      </td>

      {/* Purpose + rejection reason */}
      <td className="px-4 py-3 text-gray-600">
        <p className="truncate">{b.purpose}</p>
        {b.rejectionReason && (
          <p className="text-xs text-red-500 mt-0.5 truncate">
            Reason: {b.rejectionReason}
          </p>
        )}
      </td>

      {/* Requested by (admin only) */}
      {isAdmin && (
        <td className="px-4 py-3 text-gray-600 truncate">
          {b.userName}
        </td>
      )}

      {/* Status badge */}
      <td className="px-4 py-3">
        <StatusBadge status={b.status} />
      </td>

      {/* Actions — only valid transitions shown */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {canApprove && (
            <button
              onClick={() => onApprove(b.id)}
              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg
                         hover:bg-green-700 transition-colors font-medium"
            >
              Approve
            </button>
          )}
          {canReject && (
            <button
              onClick={() => onReject(b.id)}
              className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-lg
                         hover:bg-red-700 transition-colors font-medium"
            >
              Reject
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(b.id)}
              className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg
                         hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          {!canApprove && !canReject && !canCancel && (
            <span className="text-xs text-gray-300">—</span>
          )}
        </div>
      </td>
    </tr>
  )
}
