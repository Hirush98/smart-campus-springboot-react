import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { bookingService, resourceService, ticketService } from '../services/api'
import Layout from '../components/layout/Layout'
import { ActivityChart, StatusPieChart } from '../components/AnalyticsDashboard'
import { CardSkeleton } from '../components/SkeletonLoader'
import { 
  BuildingOfficeIcon, 
  TicketIcon, 
  CalendarDaysIcon,
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    resources: 0,
    bookings: 0,
    activeTickets: 0,
    pendingBookings: 0,
    ticketDistribution: [],
    activityData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      resourceService.getAll({}),
      bookingService.getAll(),
      ticketService.getAll()
    ]).then(([res, bks, tks]) => {
      const tickets = tks.data._embedded?.ticketList || tks.data._embedded?.tickets || (Array.isArray(tks.data) ? tks.data : [])
      const bookings = bks.data || []
      
      setStats({
        resources: res.data.length,
        bookings: bookings.length,
        activeTickets: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
        ticketDistribution: [
          { name: 'Completed', value: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length },
          { name: 'In Progress', value: tickets.filter(t => t.status === 'IN_PROGRESS').length },
          { name: 'Pending', value: tickets.filter(t => t.status === 'OPEN').length }
        ],
        activityData: [
          { name: 'Mon', value: 4 },
          { name: 'Tue', value: 7 },
          { name: 'Wed', value: 5 },
          { name: 'Thu', value: 8 },
          { name: 'Fri', value: 12 },
          { name: 'Sat', value: 3 },
          { name: 'Sun', value: 2 },
        ]
      })
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Resources', value: stats.resources, icon: BuildingOfficeIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Bookings', value: stats.bookings, icon: CalendarDaysIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Incidents', value: stats.activeTickets, icon: WrenchScrewdriverIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Pending Approvals', value: stats.pendingBookings, icon: TicketIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Real-time overview of campus operations</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {loading ? (
          [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
        ) : (
          cards.map((card, i) => (
            <motion.div key={i} variants={item} className="card flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                  {card.value}
                </h3>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Campus Activity</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Last 7 Days</span>
          </div>
          <ActivityChart data={stats.activityData} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="font-bold text-gray-900 mb-6">Incident Status</h3>
          <StatusPieChart data={stats.ticketDistribution} />
        </motion.div>
      </div>

      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="card border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-dashed"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-1">Administrative Intelligence</h2>
              <p className="text-sm text-blue-700 max-w-lg">
                Your elevated access allows you to oversee all campus modules. 
                Use the command center to optimize resource allocation and resolve issues.
              </p>
            </div>
            <Link to="/admin" className="btn-primary whitespace-nowrap px-8 py-3 shadow-blue-300 shadow-xl">
              Launch Command Center →
            </Link>
          </div>
        </motion.div>
      )}
    </Layout>
  )
}
