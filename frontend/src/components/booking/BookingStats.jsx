/**
 * BookingStats
 * Shows a summary row: Pending / Approved / Rejected / Total
 * Module B - Implemented by: Member 1 (team lead)
 */
export default function BookingStats({ bookings }) {
  const count = (status) => bookings.filter(b => b.status === status).length

  const stats = [
    { label: 'Pending',   value: count('PENDING'),   dot: 'bg-yellow-400' },
    { label: 'Approved',  value: count('APPROVED'),  dot: 'bg-green-500'  },
    { label: 'Rejected',  value: count('REJECTED'),  dot: 'bg-red-500'    },
    { label: 'Cancelled', value: count('CANCELLED'), dot: 'bg-gray-400'   },
    { label: 'Total',     value: bookings.length,    dot: 'bg-blue-500'   },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${s.dot}`} />
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}
