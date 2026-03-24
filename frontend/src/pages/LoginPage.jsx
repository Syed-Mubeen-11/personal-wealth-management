import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, TrendingUp, AlertCircle, ArrowRight, Shield, BarChart3, Target } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex auth-dark-bg">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.06) 100%)', borderRight: '1px solid var(--bg-border)' }}>
        {/* Decorative orbs */}
        <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              WealthApp
            </span>
          </div>

          <h1 className="font-display font-bold text-4xl leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Grow Your Wealth<br />With Confidence
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Smart financial planning, goal tracking, and portfolio management — all in one dark-mode dashboard.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { icon: Target,   title: 'Goal-Based Investing',  desc: 'Set targets and track progress in real time' },
            { icon: BarChart3, title: 'Portfolio Analytics',  desc: 'Deep insights into your investment performance' },
            { icon: Shield,   title: 'Bank-Level Security',   desc: 'Your data protected with 256-bit encryption' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(168,85,247,0.2)' }}>
                <Icon size={15} style={{ color: 'var(--purple)' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 WealthApp. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <TrendingUp size={17} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              WealthApp
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>
          </div>

          {/* Demo hint */}
          <div className="mb-5 p-3 rounded-xl text-xs flex items-start gap-2"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <AlertCircle size={14} style={{ color: 'var(--purple)', marginTop: 1, flexShrink: 0 }} />
            <div style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--purple)' }}>Demo: </span>
              demo@wealthapp.com / Demo@12345
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" className="dark-input" autoComplete="email" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <button type="button" className="text-xs" style={{ color: 'var(--purple)' }}>Forgot password?</button>
              </div>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="Enter your password" className="dark-input pr-10"
                  autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-purple w-full justify-center py-2.5 text-sm font-semibold mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--purple)' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
