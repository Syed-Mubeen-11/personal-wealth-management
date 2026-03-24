import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, TrendingUp, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { label: 'One number',            test: (p) => /\d/.test(p) },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }
  const allMet = passwordRules.every(r => r.test(form.password))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (!allMet) { setError('Password does not meet requirements'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 auth-dark-bg">
      <div className="w-full max-w-md fade-up py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <TrendingUp size={19} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WealthApp
          </span>
        </div>

        <div className="mb-6 text-center">
          <h2 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Start managing your wealth smarter today</p>
        </div>

        <div className="dark-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
                <AlertCircle size={15} className="flex-shrink-0" />{error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="dark-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="dark-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="Create a strong password" className="dark-input pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {passwordRules.map(rule => (
                    <div key={rule.label} className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${rule.test(form.password) ? 'bg-green-500' : 'bg-gray-700'}`}>
                        {rule.test(form.password) && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span className={`text-xs ${rule.test(form.password) ? 'text-green-400' : ''}`} style={rule.test(form.password) ? {} : { color: 'var(--text-muted)' }}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <input name="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm}
                  onChange={handleChange} placeholder="Re-enter your password" className="dark-input pr-10" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="mt-1 text-xs" style={{ color: '#fb7185' }}>Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" className="mt-0.5 rounded" required style={{ accentColor: 'var(--purple)' }} />
              <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                I agree to the <span style={{ color: 'var(--purple)' }}>Terms of Service</span> and <span style={{ color: 'var(--purple)' }}>Privacy Policy</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-purple w-full justify-center py-2.5 text-sm font-semibold mt-1">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--purple)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
