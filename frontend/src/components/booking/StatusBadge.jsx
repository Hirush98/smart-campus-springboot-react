/**
 * StatusBadge
 * Reusable coloured pill for booking status
 * Module B - Implemented by: Member 1 (team lead)
 */
const STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-green-100  text-green-800',
  REJECTED:  'bg-red-100    text-red-800',
  CANCELLED: 'bg-gray-100   text-gray-500',
}

const LABELS = {
  PENDING:   'Pending',
  APPROVED:  'Approved',
  REJECTED:  'Rejected',
  CANCELLED: 'Cancelled',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-xs font-medium ${STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {LABELS[status] || status}
    </span>
  )
}
