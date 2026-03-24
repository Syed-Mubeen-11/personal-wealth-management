import { useState, useEffect } from 'react'
import { X, TrendingUp, Save, DollarSign } from 'lucide-react'

const ASSET_TYPES = [
  { value: 'stock',       label: 'Stock',       color: '#a855f7' },
  { value: 'etf',         label: 'ETF',         color: '#06b6d4' },
  { value: 'mutual_fund', label: 'Mutual Fund', color: '#10b981' },
  { value: 'bond',        label: 'Bond',        color: '#f59e0b' },
  { value: 'cash',        label: 'Cash',        color: '#64748b' },
]

export default function InvestmentModal({ open, onClose, onSubmit, initialData = null }) {
  const isEdit = !!initialData
  const [form, setForm] = useState({ asset_type: 'stock', symbol: '', company_name: '', units: '', avg_buy_price: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({
        asset_type:    initialData.asset_type    || 'stock',
        symbol:        initialData.symbol        || '',
        company_name:  initialData.company_name  || '',
        units:         initialData.units?.toString()         || '',
        avg_buy_price: initialData.avg_buy_price?.toString() || '',
      })
    } else {
      setForm({ asset_type: 'stock', symbol: '', company_name: '', units: '', avg_buy_price: '' })
    }
    setError('')
  }, [initialData, open])

  if (!open) return null

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.symbol || !form.units || !form.avg_buy_price) {
      setError('Symbol, units and average buy price are required')
      return
    }
    setLoading(true); setError('')
    try {
      await onSubmit({
        asset_type:    form.asset_type,
        symbol:        form.symbol.toUpperCase(),
        company_name:  form.company_name || null,
        units:         parseFloat(form.units),
        avg_buy_price: parseFloat(form.avg_buy_price),
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save investment')
    } finally { setLoading(false) }
  }

  const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl fade-up overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {isEdit ? 'Edit Position' : 'Add Investment'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isEdit ? 'Update your position details' : 'Add a stock, ETF, fund or other asset'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
              {error}
            </div>
          )}

          {/* Asset Type */}
          <div>
            <label style={labelStyle}>Asset Type</label>
            <div className="flex flex-wrap gap-2">
              {ASSET_TYPES.map(t => (
                <label key={t.value} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all"
                  style={form.asset_type === t.value
                    ? { background: `${t.color}20`, border: `1px solid ${t.color}50`, color: t.color }
                    : { background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>
                  <input type="radio" name="asset_type" value={t.value} checked={form.asset_type === t.value} onChange={handleChange} className="sr-only" />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          {/* Symbol + Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Symbol *</label>
              <input name="symbol" value={form.symbol} onChange={handleChange}
                placeholder="AAPL" className="dark-input font-mono uppercase text-sm" required />
            </div>
            <div>
              <label style={labelStyle}>Company Name</label>
              <input name="company_name" value={form.company_name} onChange={handleChange}
                placeholder="Apple Inc." className="dark-input text-sm" />
            </div>
          </div>

          {/* Units + Avg Buy Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Units / Shares *</label>
              <input name="units" type="number" min="0.000001" step="0.000001"
                value={form.units} onChange={handleChange}
                placeholder="10" className="dark-input text-sm" required />
            </div>
            <div>
              <label style={labelStyle}>Avg Buy Price ($) *</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="avg_buy_price" type="number" min="0.0001" step="0.0001"
                  value={form.avg_buy_price} onChange={handleChange}
                  placeholder="150.00" className="dark-input pl-7 text-sm" required />
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.units && form.avg_buy_price && (
            <div className="p-3 rounded-xl flex items-center justify-between"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Cost Basis</span>
              <span className="font-num font-bold text-sm" style={{ color: 'var(--purple)' }}>
                ${(parseFloat(form.units || 0) * parseFloat(form.avg_buy_price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center text-sm py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="btn-purple flex-1 justify-center text-sm py-2.5">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Add Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
