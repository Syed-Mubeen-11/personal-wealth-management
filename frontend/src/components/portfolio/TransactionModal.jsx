import { useState, useEffect } from 'react'
import { X, Save, DollarSign } from 'lucide-react'

const TXN_TYPES = [
  { value: 'buy',          label: 'Buy',          color: '#10b981' },
  { value: 'sell',         label: 'Sell',         color: '#f43f5e' },
  { value: 'dividend',     label: 'Dividend',     color: '#a855f7' },
  { value: 'contribution', label: 'Contribution', color: '#06b6d4' },
  { value: 'withdrawal',   label: 'Withdrawal',   color: '#f59e0b' },
]

const ASSET_TYPES = [
  { value: 'stock',       label: 'Stock'       },
  { value: 'etf',         label: 'ETF'         },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'bond',        label: 'Bond'        },
  { value: 'cash',        label: 'Cash'        },
]

const labelStyle = { color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:500, display:'block', marginBottom:'0.3rem' }

export default function TransactionModal({ open, onClose, onSubmit, prefillSymbol = '' }) {
  const [form, setForm] = useState({
    type: 'buy', symbol: '', company_name: '', asset_type: 'stock',
    quantity: '', price: '', fees: '', notes: '', executed_at: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (open) {
      setForm({
        type: 'buy', symbol: prefillSymbol || '', company_name: '',
        asset_type: 'stock', quantity: '', price: '', fees: '', notes: '',
        executed_at: new Date().toISOString().slice(0, 16),
      })
      setError('')
    }
  }, [open, prefillSymbol])

  if (!open) return null

  const handle = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const isBuySell  = ['buy', 'sell'].includes(form.type)
  const needSymbol = ['buy', 'sell', 'dividend'].includes(form.type)
  const selectedT  = TXN_TYPES.find(t => t.value === form.type)
  const total      = (parseFloat(form.quantity || 0) * parseFloat(form.price || 0)) + parseFloat(form.fees || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (needSymbol && !form.symbol.trim()) { 
      setError('Symbol is required for this transaction type')
      return 
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        symbol:       needSymbol ? form.symbol.toUpperCase() : 'CASH',
        type:         form.type,
        asset_type:   form.asset_type,
        company_name: form.company_name || null,
        quantity:     parseFloat(form.quantity || '0'),
        price:        parseFloat(form.price    || '0'),
        fees:         parseFloat(form.fees     || '0'),
        notes:        form.notes || null,
        executed_at:  form.executed_at ? new Date(form.executed_at).toISOString() : null,
      })
      // Success — close modal, do NOT set error
      onClose()
    } catch (err) {
      // Only show error if the API actually failed
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '))
      } else {
        setError(typeof detail === 'string' ? detail : 'Failed to record transaction')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl fade-up"
        style={{ background:'var(--bg-card)', border:'1px solid var(--bg-border)' }}>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid var(--bg-border)' }}>
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color:'var(--text-primary)' }}>Add Transaction</h2>
            <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
              Transactions are the source of truth — your portfolio updates automatically
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color:'var(--text-muted)' }}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-sm"
              style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185' }}>
              {error}
            </div>
          )}

          {/* Transaction type */}
          <div>
            <label style={labelStyle}>Transaction Type</label>
            <div className="flex flex-wrap gap-2">
              {TXN_TYPES.map(t => (
                <label key={t.value} className="px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all"
                  style={form.type === t.value
                    ? { background:`${t.color}20`, border:`1px solid ${t.color}50`, color:t.color }
                    : { background:'var(--bg-surface)', border:'1px solid var(--bg-border)', color:'var(--text-secondary)' }}>
                  <input type="radio" name="type" value={t.value} checked={form.type === t.value} onChange={handle} className="sr-only"/>
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          {/* Symbol + Company (for buy/sell/dividend) */}
          {needSymbol && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Symbol *</label>
                <input name="symbol" value={form.symbol} onChange={handle}
                  placeholder="AAPL" className="dark-input font-mono uppercase text-sm" required/>
              </div>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input name="company_name" value={form.company_name} onChange={handle}
                  placeholder="Apple Inc." className="dark-input text-sm"/>
              </div>
            </div>
          )}

          {/* Asset type (for buy) */}
          {form.type === 'buy' && (
            <div>
              <label style={labelStyle}>Asset Type</label>
              <div className="flex flex-wrap gap-2">
                {ASSET_TYPES.map(a => (
                  <label key={a.value} className="px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all"
                    style={form.asset_type === a.value
                      ? { background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.4)', color:'var(--purple)' }
                      : { background:'var(--bg-surface)', border:'1px solid var(--bg-border)', color:'var(--text-secondary)' }}>
                    <input type="radio" name="asset_type" value={a.value} checked={form.asset_type === a.value} onChange={handle} className="sr-only"/>
                    {a.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Price */}
          {isBuySell && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Quantity / Shares *</label>
                <input name="quantity" type="number" min="0.000001" step="0.000001"
                  value={form.quantity} onChange={handle} placeholder="10" className="dark-input text-sm" required/>
              </div>
              <div>
                <label style={labelStyle}>Price per Unit ($) *</label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
                  <input name="price" type="number" min="0" step="0.0001"
                    value={form.price} onChange={handle} placeholder="150.00" className="dark-input pl-7 text-sm" required/>
                </div>
              </div>
            </div>
          )}

          {/* Amount for dividend/contribution/withdrawal */}
          {!isBuySell && form.type !== 'buy' && (
            <div>
              <label style={labelStyle}>Amount ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
                <input name="price" type="number" min="0" step="0.01"
                  value={form.price} onChange={handle} placeholder="500.00" className="dark-input pl-7 text-sm"/>
              </div>
            </div>
          )}

          {/* Fees + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Fees / Brokerage ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
                <input name="fees" type="number" min="0" step="0.01"
                  value={form.fees} onChange={handle} placeholder="0.00" className="dark-input pl-7 text-sm"/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Date & Time</label>
              <input name="executed_at" type="datetime-local"
                value={form.executed_at} onChange={handle} className="dark-input text-sm"/>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
            <input name="notes" value={form.notes} onChange={handle}
              placeholder="Optional note" className="dark-input text-sm"/>
          </div>

          {/* Total preview */}
          {total > 0 && (
            <div className="p-3 rounded-xl flex items-center justify-between"
              style={{ background:'var(--bg-surface)', border:'1px solid var(--bg-border)' }}>
              <span className="text-xs" style={{ color:'var(--text-muted)' }}>Total Amount</span>
              <span className="font-num font-bold text-sm" style={{ color: selectedT?.color || 'var(--purple)' }}>
                ${total.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center text-sm py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="btn-purple flex-1 justify-center text-sm py-2.5">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Save size={14}/>}
              {loading ? 'Recording…' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
