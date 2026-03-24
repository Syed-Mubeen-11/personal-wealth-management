import { useNavigate } from 'react-router-dom'
import { Briefcase, BarChart3 } from 'lucide-react'

function ComingSoon({ icon: Icon, title, milestone, iconColor }) {
  const navigate = useNavigate()
  return (
    <div className="p-5 lg:p-6 max-w-4xl mx-auto fade-up">
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      <div className="dark-card p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `rgba(${iconColor},0.1)` }}>
          <Icon size={28} style={{ color: `rgb(${iconColor})` }} />
        </div>
        <h2 className="font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title} — {milestone}</h2>
        <p className="text-sm mb-5 max-w-sm" style={{ color: 'var(--text-secondary)' }}>This module will be fully implemented in the next milestone.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">← Back to Dashboard</button>
      </div>
    </div>
  )
}

export function PortfolioPage() {
  return <ComingSoon icon={Briefcase} title="Portfolio & Transactions" milestone="Milestone 3" iconColor="168,85,247" />
}

export function ReportsPage() {
  return <ComingSoon icon={BarChart3} title="Recommendations & Reports" milestone="Milestone 4" iconColor="6,182,212" />
}

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <p className="font-display font-bold text-8xl" style={{ color: 'var(--bg-border)' }}>404</p>
        <h1 className="font-display font-bold text-2xl mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-purple text-sm">Go to Dashboard</button>
      </div>
    </div>
  )
}
