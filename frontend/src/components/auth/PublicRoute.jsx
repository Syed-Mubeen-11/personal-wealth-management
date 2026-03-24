import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--purple)', borderTopColor: 'transparent' }} />
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace />
  return children
}
