import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'

import LoginPage        from './pages/LoginPage'
import OAuth2CallbackPage from './pages/OAuth2CallbackPage'
import RegisterPage     from './pages/RegisterPage'
import DashboardPage    from './pages/DashboardPage'
import ResourcesPage    from './pages/ResourcesPage'
import BookingsPage     from './pages/BookingsPage'
import TicketsPage      from './pages/TicketsPage'
import NotificationsPage from './pages/NotificationsPage'
import AdminPage        from './pages/AdminPage'
import CreateAnnouncementPage from './pages/CreateAnnouncementPage'
import EditAnnouncementPage from './pages/EditAnnouncementPage'
import ResourceDetailsPage from './pages/ResourceDetailsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />

        <Route path="/resources/:id" element={
          <ProtectedRoute><ResourceDetailsPage /></ProtectedRoute>
        } />

        <Route path="/resources" element={
          <ProtectedRoute><ResourcesPage /></ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute><BookingsPage /></ProtectedRoute>
        } />
        <Route path="/tickets" element={
          <ProtectedRoute><TicketsPage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />
        <Route path="/admin/announcements/new" element={
          <ProtectedRoute adminOnly><CreateAnnouncementPage /></ProtectedRoute>
        } />
        <Route path="/admin/announcements/:id/edit" element={
          <ProtectedRoute adminOnly><EditAnnouncementPage /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
