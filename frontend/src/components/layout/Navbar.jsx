import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/dashboard':   'Dashboard Overview',
  '/profile':     'Profile & Risk Management',
  '/goals':       'Investment Goals',
  '/portfolio':   'Portfolio & Transactions',
  '/reports':     'Recommendations & Reports',
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'WealthApp'

  return (
    <header className="h-14 flex items-center justify-between px-5 flex-shrink-0"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--bg-border)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <Search size={17} />
        </button>
        <button className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--purple)' }} />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ml-1 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="text-sm font-medium hidden sm:block"
          style={{ color: 'var(--text-secondary)' }}
        >
          Profile
        </button>
      </div>
    </header>
  )
}
