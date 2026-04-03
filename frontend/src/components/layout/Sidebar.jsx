import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, User, Target, Briefcase,
  LogOut, TrendingUp, Sparkles, FileText
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile',         icon: User,            label: 'Profile & Risk' },
  { to: '/goals',           icon: Target,          label: 'Goals' },
  { to: '/portfolio',       icon: Briefcase,       label: 'Portfolio' },
  { to: '/recommendations', icon: Sparkles,        label: 'Recommendations' },
  { to: '/reports',         icon: FileText,        label: 'Reports' },
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full w-64" style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--bg-border)' }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--bg-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <TrendingUp size={17} className="text-white" />
          </div>
          <span className="font-bold text-xl"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WealthApp
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t space-y-1" style={{ borderColor: 'var(--bg-border)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-item w-full" style={{ color: '#f43f5e' }} aria-label="Logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      <p className="text-center text-xs py-3 px-4" style={{ color: 'var(--text-muted)' }}>
        © 2026 WealthApp
      </p>
    </div>
  )
}
