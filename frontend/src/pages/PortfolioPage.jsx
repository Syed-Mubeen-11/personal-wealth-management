import { useState, useEffect, useCallback } from 'react'
import { portfolioApi } from '../services/portfolioApi'
import TransactionModal from '../components/portfolio/TransactionModal'
import RebalanceDrawer from '../components/rebalance/RebalanceDrawer'
import {
  Plus, TrendingUp, TrendingDown, Trash2,
  Search, Download, ChevronLeft, ChevronRight,
  AlertCircle, RefreshCw, Briefcase, Wifi, WifiOff,
  Clock, Info
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const fmt    = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(n ?? 0)
const fmtK   = (n) => Math.abs(n) >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : Math.abs(n) >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : fmt(n)
const fmtPct = (n) => `${Number(n) >= 0 ? '+' : ''}${Number(n ?? 0).toFixed(2)}%`

const TXN_COLORS = {
  buy:          { color:'#10b981', bg:'rgba(16,185,129,0.12)' },
  sell:         { color:'#f43f5e', bg:'rgba(244,63,94,0.12)'  },
  dividend:     { color:'#a855f7', bg:'rgba(168,85,247,0.12)' },
  contribution: { color:'#06b6d4', bg:'rgba(6,182,212,0.12)'  },
  withdrawal:   { color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
}

const DarkPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background:'var(--bg-card)', border:'1px solid var(--bg-border)' }}>
      <p className="font-semibold capitalize" style={{ color:payload[0].payload.color }}>
        {payload[0].name?.replace('_', ' ')}
      </p>
      <p style={{ color:'var(--text-primary)' }}>{fmt(payload[0].value)}</p>
      <p style={{ color:'var(--text-muted)' }}>{payload[0].payload.percentage?.toFixed(1)}%</p>
    </div>
  )
}

export default function PortfolioPage() {
  const [summary,    setSummary]    = useState(null)
  const [txns,       setTxns]       = useState([])
  const [txnTotal,   setTxnTotal]   = useState(0)
  const [txnPages,   setTxnPages]   = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [txnLoading, setTxnLoading] = useState(false)
  const [error,      setError]      = useState('')
  const [activeTab,  setActiveTab]  = useState('positions')

  const [refreshing,  setRefreshing]  = useState(false)
  const [refreshMsg,  setRefreshMsg]  = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const [txnPage,       setTxnPage]       = useState(1)
  const [txnSearch,     setTxnSearch]     = useState('')
  const [txnTypeFilter, setTxnTypeFilter] = useState('')

  const [txnModal,       setTxnModal]       = useState(false)
  const [rebalanceOpen,  setRebalanceOpen]  = useState(false)
  const [prefillSym,  setPrefillSym]  = useState('')
  const [delLoading,  setDelLoading]  = useState(null)

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadSummary = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await portfolioApi.summary()
      setSummary(res.data)
    } catch {
      setError('Failed to load portfolio. Check that the backend is running.')
    } finally { setLoading(false) }
  }, [])

  const loadTxns = useCallback(async () => {
    setTxnLoading(true)
    try {
      const params = { page: txnPage, page_size: 10 }
      if (txnSearch)     params.symbol = txnSearch
      if (txnTypeFilter) params.type   = txnTypeFilter
      const res = await portfolioApi.listTransactions(params)
      setTxns(res.data.transactions)
      setTxnTotal(res.data.total)
      setTxnPages(res.data.total_pages)
    } catch {} finally { setTxnLoading(false) }
  }, [txnPage, txnSearch, txnTypeFilter])

  useEffect(() => { loadSummary() }, [loadSummary])
  useEffect(() => { loadTxns() },   [loadTxns])
  useEffect(() => { setTxnPage(1) }, [txnSearch, txnTypeFilter])

  // ── Live price refresh ────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMsg('Fetching live prices from Yahoo Finance…')
    try {
      const res = await portfolioApi.refreshPrices()
      setLastUpdated(new Date())
      setRefreshMsg(`Updated ${res.data.updated} positions`)
      await loadSummary()
      setTimeout(() => setRefreshMsg(''), 4000)
    } catch {
      setRefreshMsg('Live prices unavailable — showing cost basis values')
      setTimeout(() => setRefreshMsg(''), 4000)
    } finally { setRefreshing(false) }
  }

  // ── Transaction create/delete ─────────────────────────────────────────────
  const handleCreateTxn = async (data) => {
    // This is called by the modal — if it throws, modal shows the error
    // If it succeeds, modal closes, then we reload data
    await portfolioApi.createTransaction(data)
    // Reload silently — don't let these errors affect anything
    loadSummary().catch(() => {})
    loadTxns().catch(() => {})
  }

  const handleDeleteTxn = async (id) => {
    if (!window.confirm('Delete this transaction? The investment position will be recalculated.')) return
    setDelLoading(id)
    try {
      await portfolioApi.deleteTransaction(id)
      await loadSummary()
      await loadTxns()
    } finally { setDelLoading(null) }
  }

  const openBuyModal = (symbol = '') => {
    setPrefillSym(symbol)
    setTxnModal(true)
  }

  const exportCSV = () => {
    if (!txns.length) return
    const header = 'Date,Type,Symbol,Quantity,Price,Fees,Total,Notes'
    const rows = txns.map(t => [
      t.executed_at?.slice(0,10), t.type, t.symbol||'-',
      t.quantity, t.price, t.fees, t.total_amount, t.notes||''
    ].join(','))
    const blob = new Blob([[header,...rows].join('\n')], { type:'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'transactions.csv'; a.click()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor:'var(--purple)', borderTopColor:'transparent' }}/>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>Loading portfolio…</p>
      </div>
    </div>
  )

  const investments = summary?.investments || []
  const allocation  = summary?.allocation  || []
  const hasLive     = investments.some(i => i.last_price_at)

  return (
    <div className="p-5 lg:p-6 max-w-6xl mx-auto fade-up space-y-6">

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185' }}>
          <AlertCircle size={14}/> {error}
        </div>
      )}

      {/* Architecture note */}
      <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
        style={{ background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)' }}>
        <Info size={13} style={{ color:'var(--purple)', marginTop:1, flexShrink:0 }}/>
        <span style={{ color:'var(--text-secondary)' }}>
          <strong style={{ color:'var(--purple)' }}>How this works:</strong> Add a <em>transaction</em> (buy/sell) → your portfolio holdings update automatically. 
          Investments are derived from your transaction history — transactions are the source of truth.
        </span>
      </div>

      {/* ── Overview ── */}
      <div className="dark-card p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display font-semibold text-lg mb-1" style={{ color:'var(--text-primary)' }}>
              Portfolio Overview
            </h2>
            <div className="flex items-center gap-3 flex-wrap text-xs">
              {hasLive ? (
                <span className="flex items-center gap-1" style={{ color:'#10b981' }}><Wifi size={11}/> Live prices active</span>
              ) : (
                <span className="flex items-center gap-1" style={{ color:'var(--text-muted)' }}><WifiOff size={11}/> Showing cost basis — click Refresh for live prices</span>
              )}
              {lastUpdated && (
                <span className="flex items-center gap-1" style={{ color:'var(--text-muted)' }}>
                  <Clock size={10}/> {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              {refreshMsg && <span style={{ color:'#06b6d4' }}>{refreshMsg}</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleRefresh} disabled={refreshing} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-50">
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''}/>
              {refreshing ? 'Refreshing…' : 'Refresh Live Prices'}
            </button>
            <button onClick={() => setRebalanceOpen(true)} className="btn-ghost text-xs py-1.5 px-3">
              ⚖️ Rebalance Portfolio
            </button>
            <button onClick={() => openBuyModal()} className="btn-purple text-xs py-1.5 px-3">
              <Plus size={13}/> Add Transaction
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label:'Total Portfolio Value',  val:fmtK(summary?.total_value||0),      color:'var(--text-primary)', big:true },
            { label:'Overall Gain / Loss',    val:`${fmtK(summary?.total_gain_loss||0)} (${fmtPct(summary?.gain_loss_pct||0)})`, color:(summary?.total_gain_loss||0)>=0?'#10b981':'#f43f5e' },
            { label:'Total Cost Basis',       val:fmtK(summary?.total_cost_basis||0), color:'var(--text-secondary)' },
            { label:'Open Positions',         val:String(summary?.num_positions||0),  color:'var(--purple)' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs mb-1" style={{ color:'var(--text-muted)' }}>{item.label}</p>
              <p className={`font-num font-bold ${item.big?'text-2xl':'text-xl'}`} style={{ color:item.color }}>{item.val}</p>
            </div>
          ))}
        </div>

        {/* Donut + allocation */}
        {allocation.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-5"
            style={{ borderTop:'1px solid var(--bg-border)' }}>
            <div className="w-full sm:w-44 h-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                    dataKey="value" nameKey="asset_type" paddingAngle={3}>
                    {allocation.map((e,i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip content={<DarkPieTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color:'var(--text-muted)' }}>Asset Allocation</p>
              {allocation.map(a => (
                <div key={a.asset_type} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:a.color }}/>
                  <span className="text-sm capitalize flex-1" style={{ color:'var(--text-secondary)' }}>{a.asset_type.replace('_',' ')}</span>
                  <span className="font-num text-sm font-medium" style={{ color:'var(--text-primary)' }}>{fmt(a.value)}</span>
                  <span className="font-num text-xs w-12 text-right" style={{ color:'var(--text-muted)' }}>{a.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background:'var(--bg-surface)' }}>
        {[
          { key:'positions',    label:'Holdings' },
          { key:'transactions', label:`Transactions${txnTotal > 0 ? ` (${txnTotal})` : ''}` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={activeTab === tab.key
              ? { background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--bg-border)' }
              : { color:'var(--text-muted)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Holdings (derived from transactions) ── */}
      {activeTab === 'positions' && (
        <div className="dark-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom:'1px solid var(--bg-border)' }}>
            <div>
              <h3 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>
                Holdings ({investments.length})
              </h3>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                Automatically updated when you add buy/sell transactions
              </p>
            </div>
            <button onClick={() => openBuyModal()} className="btn-ghost text-xs py-1.5 px-3">
              <Plus size={13}/> Add Position
            </button>
          </div>

          {investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background:'rgba(168,85,247,0.1)' }}>
                <Briefcase size={24} style={{ color:'var(--purple)' }}/>
              </div>
              <p className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>No holdings yet</p>
              <p className="text-sm mb-4" style={{ color:'var(--text-secondary)' }}>
                Add a BUY transaction to create your first position
              </p>
              <button onClick={() => openBuyModal()} className="btn-purple text-sm py-2">
                <Plus size={14}/> Record First Trade
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:'var(--bg-surface)' }}>
                    {['Symbol','Company','Units','Avg Buy','Current Price','Market Value','Gain / Loss','Price From',''].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-medium uppercase tracking-wide ${['Symbol','Company','Price From'].includes(h)?'text-left':'text-right'}`}
                        style={{ color:'var(--text-muted)', borderBottom:'1px solid var(--bg-border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => {
                    const gl    = Number(inv.gain_loss    ?? 0)
                    const glPct = Number(inv.gain_loss_pct ?? 0)
                    const val   = Number(inv.current_value ?? 0)
                    const units = Number(inv.units ?? 0)
                    const curP  = units > 0 ? val / units : Number(inv.avg_buy_price ?? 0)
                    const isLive = !!inv.last_price_at

                    return (
                      <tr key={inv.id} className="dark-tr"
                        style={{ borderBottom:'1px solid rgba(37,47,71,0.5)' }}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold" style={{ color:'var(--purple)' }}>{inv.symbol}</span>
                            {isLive && <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#10b981' }}/>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-28 truncate text-sm" style={{ color:'var(--text-secondary)' }}>
                          {inv.company_name || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-num" style={{ color:'var(--text-secondary)' }}>
                          {units.toLocaleString(undefined, {maximumFractionDigits:4})}
                        </td>
                        <td className="px-4 py-3.5 text-right font-num" style={{ color:'var(--text-secondary)' }}>
                          {fmt(inv.avg_buy_price)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-num" style={{ color:'var(--text-primary)' }}>
                          {fmt(curP)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-num font-bold" style={{ color:'var(--text-primary)' }}>
                          {fmt(val)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-num text-sm font-semibold"
                              style={{ color:gl>=0?'#10b981':'#f43f5e' }}>
                              {gl>=0?'+':''}{fmt(gl)}
                            </span>
                            <span className="font-num text-xs flex items-center gap-0.5"
                              style={{ color:gl>=0?'#10b981':'#f43f5e' }}>
                              {gl>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                              {fmtPct(glPct)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {isLive
                            ? <span className="badge-green text-xs">Live</span>
                            : <span className="badge-yellow text-xs">Cost basis</span>}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => openBuyModal(inv.symbol)}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ color:'var(--purple)', background:'rgba(168,85,247,0.1)' }}
                            title="Add transaction for this symbol"
                          >
                            + txn
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Transactions (source of truth) ── */}
      {activeTab === 'transactions' && (
        <div className="dark-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            style={{ borderBottom:'1px solid var(--bg-border)' }}>
            <div>
              <h3 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>
                Transaction History
              </h3>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                Every buy/sell here recalculates your portfolio holdings automatically
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="btn-ghost text-xs py-1.5 px-3"><Download size={13}/> CSV</button>
              <button onClick={() => openBuyModal()} className="btn-purple text-xs py-1.5 px-3">
                <Plus size={13}/> Add Transaction
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 px-5 py-3" style={{ borderBottom:'1px solid var(--bg-border)' }}>
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
              <input value={txnSearch} onChange={e => setTxnSearch(e.target.value)}
                placeholder="Filter by symbol…" className="dark-input pl-8 text-sm py-2"/>
            </div>
            <select value={txnTypeFilter} onChange={e => setTxnTypeFilter(e.target.value)}
              className="dark-input text-sm py-2 w-36">
              <option value="">All Types</option>
              {Object.keys(TXN_COLORS).map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>

          {txnLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor:'var(--purple)', borderTopColor:'transparent' }}/>
            </div>
          ) : txns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>No transactions yet</p>
              <p className="text-sm mb-4" style={{ color:'var(--text-secondary)' }}>Add your first buy or sell transaction</p>
              <button onClick={() => openBuyModal()} className="btn-purple text-sm py-2">
                <Plus size={14}/> Record First Trade
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:'var(--bg-surface)' }}>
                      {['Date','Type','Symbol','Qty','Price','Fees','Total','Notes',''].map(h => (
                        <th key={h} className={`px-4 py-3 text-xs font-medium uppercase tracking-wide ${['Date','Type','Symbol','Notes'].includes(h)?'text-left':'text-right'}`}
                          style={{ color:'var(--text-muted)', borderBottom:'1px solid var(--bg-border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map(txn => {
                      const ts = TXN_COLORS[txn.type] || { color:'#94a3b8', bg:'rgba(148,163,184,0.1)' }
                      return (
                        <tr key={txn.id} className="dark-tr" style={{ borderBottom:'1px solid rgba(37,47,71,0.5)' }}>
                          <td className="px-4 py-3 font-num text-xs" style={{ color:'var(--text-muted)' }}>
                            {txn.executed_at ? new Date(txn.executed_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold capitalize"
                              style={{ background:ts.bg, color:ts.color }}>{txn.type}</span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-sm" style={{ color:'var(--text-secondary)' }}>
                            {txn.symbol || '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-num" style={{ color:'var(--text-secondary)' }}>
                            {Number(txn.quantity)>0 ? Number(txn.quantity).toLocaleString(undefined,{maximumFractionDigits:4}) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-num" style={{ color:'var(--text-secondary)' }}>
                            {Number(txn.price)>0 ? fmt(txn.price) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-num" style={{ color:'var(--text-muted)' }}>
                            {Number(txn.fees)>0 ? fmt(txn.fees) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-num font-semibold" style={{ color:ts.color }}>
                            {fmt(txn.total_amount)}
                          </td>
                          <td className="px-4 py-3 text-xs max-w-24 truncate" style={{ color:'var(--text-muted)' }}>
                            {txn.notes || '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteTxn(txn.id)} disabled={delLoading===txn.id}
                              className="p-1.5 rounded-lg" style={{ color:'#f43f5e' }}>
                              {delLoading===txn.id
                                ? <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor:'#f43f5e', borderTopColor:'transparent' }}/>
                                : <Trash2 size={13}/>}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {txnPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-5 py-4"
                  style={{ borderTop:'1px solid var(--bg-border)' }}>
                  <button onClick={() => setTxnPage(p=>Math.max(1,p-1))} disabled={txnPage===1}
                    className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-40"><ChevronLeft size={14}/></button>
                  {Array.from({length:txnPages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={() => setTxnPage(p)}
                      className="text-sm w-8 h-8 rounded-lg font-medium"
                      style={txnPage===p?{background:'var(--purple)',color:'white'}:{color:'var(--text-secondary)'}}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setTxnPage(p=>Math.min(txnPages,p+1))} disabled={txnPage===txnPages}
                    className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-40"><ChevronRight size={14}/></button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p className="text-center text-xs pb-2" style={{ color:'var(--text-muted)' }}>
        © 2026 WealthApp. All rights reserved.
      </p>

      <TransactionModal
        open={txnModal}
        onClose={() => { setTxnModal(false); setPrefillSym('') }}
        onSubmit={handleCreateTxn}
        prefillSymbol={prefillSym}
      />

      <RebalanceDrawer
        open={rebalanceOpen}
        onClose={() => setRebalanceOpen(false)}
      />
    </div>
  )
}