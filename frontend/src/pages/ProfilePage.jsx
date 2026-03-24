import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { CheckCircle2, AlertCircle, Save, X, Shield } from 'lucide-react'

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative', desc: 'Prioritizes capital preservation, low risk.', accentColor: '#10b981', detail: 'A conservative investor prioritizes protecting their capital over growth. This portfolio focuses on fixed income, money market instruments, and stable dividend-paying stocks.' },
  { value: 'moderate',     label: 'Moderate',     desc: 'Balances growth with risk, diversified.',   accentColor: '#a855f7', detail: 'A moderate investor seeks a balance between capital preservation and growth. This portfolio includes a diversified mix of equities and bonds, aiming for reasonable returns while managing downside risk.' },
  { value: 'aggressive',   label: 'Aggressive',   desc: 'Seeks high growth, accepts higher risk.',   accentColor: '#ec4899', detail: 'An aggressive investor seeks maximum capital appreciation and accepts high volatility. This portfolio is heavily weighted towards equities and growth stocks. Best for investors with a long time horizon.' },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm]   = useState({ name:'', email:'', phone:'', address:'', date_of_birth:'', risk_profile:'moderate' })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (user) setForm({ name: user.name||'', email: user.email||'', phone: user.phone||'', address: user.address||'', date_of_birth: user.date_of_birth||'', risk_profile: user.risk_profile||'moderate' })
  }, [user])

  const selected = RISK_OPTIONS.find(r => r.value === form.risk_profile) || RISK_OPTIONS[1]

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setSuccess(false); setError('') }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const { email, ...payload } = form
      const res = await api.put('/users/me', payload)
      updateUser(res.data); setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save changes')
    } finally { setSaving(false) }
  }

  const handleCancel = () => {
    if (user) setForm({ name: user.name||'', email: user.email||'', phone: user.phone||'', address: user.address||'', date_of_birth: user.date_of_birth||'', risk_profile: user.risk_profile||'moderate' })
    setError(''); setSuccess(false)
  }

  const inputLabel = (text) => (
    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{text}</label>
  )

  return (
    <div className="p-5 lg:p-6 max-w-6xl mx-auto fade-up">
      {(error || success) && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm`}
          style={success
            ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }
            : { background: 'rgba(244,63,94,0.1)',  border: '1px solid rgba(244,63,94,0.25)',  color: '#fb7185' }}>
          {success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {success ? 'Changes saved successfully!' : error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="space-y-5">
          <div className="dark-card p-5 lg:p-6">
            <div className="mb-5">
              <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>User Profile Details</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>View and update your personal information.</p>
            </div>
            <div className="space-y-4">
              <div>{inputLabel('Full Name')}<input name="name" value={form.name} onChange={handleChange} className="dark-input" placeholder="John Doe" /></div>
              <div>
                {inputLabel('Email Address')}
                <input name="email" value={form.email} className="dark-input cursor-not-allowed" readOnly placeholder="john@example.com" style={{ opacity: 0.5 }} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
              </div>
              <div>{inputLabel('Phone Number')}<input name="phone" value={form.phone} onChange={handleChange} className="dark-input" placeholder="+1 (555) 123-4567" /></div>
              <div>{inputLabel('Residential Address')}<input name="address" value={form.address} onChange={handleChange} className="dark-input" placeholder="123 Main Street, City" /></div>
              <div>{inputLabel('Date of Birth')}<input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="dark-input" /></div>
            </div>
          </div>

          {/* KYC */}
          <div className="dark-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>KYC Status</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {user?.kyc_status === 'verified' ? 'Your KYC verification is completed.' : 'Complete KYC to unlock all features.'}
                </p>
              </div>
              <span className={user?.kyc_status === 'verified' ? 'badge-green' : 'badge-yellow'}>
                {user?.kyc_status === 'verified' ? '✓ Completed' : '⏳ Pending'}
              </span>
            </div>
            <button className="btn-ghost text-sm mt-3">
              {user?.kyc_status === 'verified' ? 'Update KYC →' : 'Complete KYC →'}
            </button>
          </div>
        </div>

        {/* Risk Profile */}
        <div className="space-y-5">
          <div className="dark-card p-5 lg:p-6">
            <div className="mb-5">
              <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Risk Profile Selection</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Choose the investment risk level that suits your financial goals.</p>
            </div>
            <div className="space-y-3">
              {RISK_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
                  style={form.risk_profile === opt.value
                    ? { background: `rgba(${opt.value === 'conservative' ? '16,185,129' : opt.value === 'moderate' ? '168,85,247' : '236,72,153'},0.08)`, border: `1px solid ${opt.accentColor}40` }
                    : { background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                  <input type="radio" name="risk_profile" value={opt.value} checked={form.risk_profile === opt.value} onChange={handleChange} className="mt-0.5" style={{ accentColor: opt.accentColor }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: form.risk_profile === opt.value ? opt.accentColor : 'var(--text-primary)' }}>{opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Risk summary */}
          <div className="dark-card p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: selected.accentColor }} />
              <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Risk Assessment Summary</h2>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Understanding your selected risk profile.</p>
            <div className="p-4 rounded-xl" style={{ background: `rgba(${selected.value === 'conservative' ? '16,185,129' : selected.value === 'moderate' ? '168,85,247' : '236,72,153'},0.07)`, border: `1px solid ${selected.accentColor}30` }}>
              <p className="font-semibold text-sm mb-2" style={{ color: selected.accentColor }}>
                {selected.label} Profile: {selected.value === 'conservative' ? 'Capital Preservation' : selected.value === 'moderate' ? 'Balanced Growth & Risk' : 'Maximum Growth'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.detail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--bg-border)' }}>
        <button onClick={handleCancel} className="btn-ghost flex items-center gap-2 text-sm">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-purple flex items-center gap-2 text-sm py-2.5 px-5">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>© 2026 WealthApp. All rights reserved.</p>
    </div>
  )
}
