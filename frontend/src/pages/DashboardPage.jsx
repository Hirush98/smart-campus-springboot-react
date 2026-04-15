import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'

const cards = [
  { title: 'Resources',  desc: 'Browse halls, labs & equipment',  href: '/resources',      color: 'bg-blue-500' },
  { title: 'Bookings',   desc: 'Request & manage bookings',        href: '/bookings',       color: 'bg-emerald-500' },
  { title: 'Tickets',    desc: 'Report incidents & maintenance',   href: '/tickets',        color: 'bg-amber-500' },
  { title: 'Notifications', desc: 'View updates & alerts',        href: '/notifications',  color: 'bg-purple-500' },
]

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link
            key={card.href}
            to={card.href}
            className="card hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg mb-3 
                            group-hover:scale-110 transition-transform`} />
            <h3 className="font-semibold text-gray-900">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>

      {isAdmin && (
        <div className="card border-blue-100 bg-blue-50">
          <h2 className="font-semibold text-blue-900 mb-1">Admin panel</h2>
          <p className="text-sm text-blue-700 mb-3">
            Manage resources, review bookings, and assign tickets.
          </p>
          <Link to="/admin" className="btn-primary text-sm inline-block">
            Go to Admin →
          </Link>
        </div>
      )}
    </Layout>
  )
}
