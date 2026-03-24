import { useState, useEffect } from 'react'
import { X, Target, Home, GraduationCap, Briefcase, Calendar, DollarSign, Save } from 'lucide-react'

const GOAL_TYPES = [
  { value: 'retirement', label: 'Retirement',       icon: Briefcase,     color: '#a855f7' },
  { value: 'home',       label: 'Home Purchase',    icon: Home,          color: '#10b981' },
  { value: 'education',  label: "Child's Education", icon: GraduationCap, color: '#06b6d4' },
  { value: 'custom',     label: 'Custom',           icon: Target,        color: '#f59e0b' },
]

export default function GoalFormModal({ open, onClose, onSubmit, initialData = null }) {
  const isEdit = !!initialData
  const [form, setForm] = useState({ name:'', goal_type:'custom', target_amount:'', current_amount:'', target_date:'', monthly_contribution:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name||'', goal_type: initialData.goal_type||'custom', target_amount: initialData.target_amount?.toString()||'', current_amount: initialData.current_amount?.toString()||'', target_date: initialData.target_date||'', monthly_contribution: initialData.monthly_contribution?.toString()||'', notes: initialData.notes||'' })
    } else {
      setForm({ name:'', goal_type:'custom', target_amount:'', current_amount:'', target_date:'', monthly_contribution:'', notes:'' })
    }
    setError('')
  }, [initialData, open])

  if (!open) return null

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.target_amount || !form.target_date) { setError('Name, target amount and target date are required'); return }
    setLoading(true); setError('')
    try {
      await onSubmit({ name: form.name, goal_type: form.goal_type, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount||'0'), target_date: form.target_date, monthly_contribution: parseFloat(form.monthly_contribution||'0'), notes: form.notes||null })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save goal')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {isEdit ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isEdit ? 'Update your financial goal details' : 'Set a new financial target to work towards'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
              {error}
            </div>
          )}

          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Goal Type</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map(type => {
                const Icon = type.icon
                const active = form.goal_type === type.value
                return (
                  <label key={type.value} className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all"
                    style={active
                      ? { background: `${type.color}15`, border: `1px solid ${type.color}50` }
                      : { background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                    <input type="radio" name="goal_type" value={type.value} checked={active} onChange={handleChange} className="sr-only" />
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${type.color}20` }}>
                      <Icon size={14} style={{ color: type.color }} />
                    </span>
                    <span className="text-sm font-medium" style={{ color: active ? type.color : 'var(--text-secondary)' }}>{type.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Goal Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Retirement Fund" className="dark-input" required />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Amount ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="target_amount" type="number" min="1" step="0.01" value={form.target_amount} onChange={handleChange} placeholder="500,000" className="dark-input pl-7" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Amount ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="current_amount" type="number" min="0" step="0.01" value={form.current_amount} onChange={handleChange} placeholder="0" className="dark-input pl-7" />
              </div>
            </div>
          </div>

          {/* Date + Monthly */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Date</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="target_date" type="date" value={form.target_date} onChange={handleChange} className="dark-input pl-7" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Monthly ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="monthly_contribution" type="number" min="0" step="0.01" value={form.monthly_contribution} onChange={handleChange} placeholder="1,200" className="dark-input pl-7" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes about this goal..." rows={2} className="dark-input resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm py-2.5 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-purple flex-1 justify-center text-sm py-2.5">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
              {loading ? 'Saving…' : isEdit ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
