import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, marketApi } from '../services/marketApi'
import {
  TrendingUp, TrendingDown, Plus, Briefcase,
  ArrowUpRight, Target, RefreshCw, AlertCircle,
  Loader2, BarChart3, Activity, Wifi, WifiOff, Clock
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt    = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(n ?? 0)
const fmtK   = (n) => {
  const v = n ?? 0; const abs = Math.abs(v)
  return abs >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : abs >= 1e3 ? `$${(v/1e3).toFixed(1)}K` : fmt(v)
}
const fmtPct = (n) => `${Number(n??0) >= 0 ? '+' : ''}${Number(n??0).toFixed(2)}%`

const GOAL_ICONS = { retirement:'🏦', home:'🏠', education:'🎓', custom:'🎯' }

const TXN_COLORS = {
  buy:'#10b981', sell:'#f43f5e', dividend:'#a855f7',
  contribution:'#06b6d4', withdrawal:'#f59e0b',
}

export default function DashboardPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  // ── State ──────────────────────────────────────────────────────────────────
  const [summary,     setSummary]     = useState(null)
  const [indices,     setIndices]     = useState([])
  const [loadingMain, setLoadingMain] = useState(true)
  const [loadingIdx,  setLoadingIdx]  = useState(true)
  const [error,       setError]       = useState('')
  const [refreshing,  setRefreshing]  = useState(false)
  const [refreshMsg,  setRefreshMsg]  = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [idxError,    setIdxError]    = useState('')

  const today = new Date().toLocaleDateString('en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  })

  // ── Load dashboard summary (portfolio + goals + transactions in one call) ──
  const loadSummary = useCallback(async () => {
    setError('')
    try {
      const res = await dashboardApi.summary()
      setSummary(res.data)
    } catch {
      setError('Failed to load dashboard. Check the backend is running.')
    } finally {
      setLoadingMain(false)
    }
  }, [])

  // ── Load live market indices ───────────────────────────────────────────────
  const loadIndices = useCallback(async () => {
    setIdxError('')
    try {
      const res = await marketApi.getIndices()
      setIndices(res.data.indices || [])
    } catch {
      setIdxError('Market data unavailable')
    } finally {
      setLoadingIdx(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
    loadIndices()
  }, [loadSummary, loadIndices])

  // ── Bulk refresh all portfolio prices ─────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMsg('Fetching live prices (bulk)…')
    try {
      const res = await marketApi.bulkRefresh()
      const { updated, failed, total } = res.data
      setLastUpdated(new Date())
      setRefreshMsg(`Updated ${updated}/${total} positions${failed > 0 ? ` (${failed} failed)` : ''}`)
      await loadSummary()    // reload portfolio with fresh prices
      await loadIndices()    // also refresh index widget
      setTimeout(() => setRefreshMsg(''), 5000)
    } catch {
      setRefreshMsg('Refresh failed — showing stored values')
      setTimeout(() => setRefreshMsg(''), 4000)
    } finally {
      setRefreshing(false)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const portfolio    = summary?.portfolio     || {}
  const goals        = summary?.goals         || {}
  const recentTxns   = summary?.recent_transactions || []
  const profileUser  = summary?.user          || {}
  const investments  = portfolio.investments  || []
  const allocation   = portfolio.allocation   || []
  const activeGoals  = goals.active_list      || []
  const hasLive      = investments.some(i => i.last_price_at)
  const riskProfile  = (profileUser.risk_profile || user?.risk_profile || 'moderate')
  const riskLabel    = riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)

  if (loadingMain) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin" style={{ color:'var(--purple)' }}/>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>Loading your dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="p-5 lg:p-6 space-y-6 fade-up">

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185' }}>
          <AlertCircle size={14}/> {error}
          <button onClick={loadSummary} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* ── Welcome + Net Worth ── */}
      <div className="dark-card p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h1 className="font-display font-bold text-xl" style={{ color:'var(--text-primary)' }}>
              Welcome back, {summary?.user?.name?.split(' ')[0] || user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{today}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Live status */}
            {hasLive
              ? <span className="flex items-center gap-1 text-xs" style={{ color:'#10b981' }}><Wifi size={11}/> Live prices</span>
              : <span className="flex items-center gap-1 text-xs" style={{ color:'var(--text-muted)' }}><WifiOff size={11}/> Cost basis only</span>
            }
            {lastUpdated && (
              <span className="flex items-center gap-1 text-xs" style={{ color:'var(--text-muted)' }}>
                <Clock size={10}/> {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {refreshMsg && <span className="text-xs" style={{ color:'#06b6d4' }}>{refreshMsg}</span>}
            <button onClick={handleRefresh} disabled={refreshing}
              className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-50">
              <RefreshCw size={13} className={refreshing?'animate-spin':''}/>
              {refreshing ? 'Refreshing…' : 'Bulk Refresh Prices'}
            </button>
          </div>
        </div>

        {/* Net worth stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
          style={{ borderTop:'1px solid var(--bg-border)' }}>
          {[
            {
              label: 'Total Portfolio Value',
              value: fmtK(portfolio.total_value),
              style: { background:'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
              sub:   `${portfolio.num_positions || 0} position${(portfolio.num_positions||0)!==1?'s':''}`,
            },
            {
              label: 'Total Cost Basis',
              value: fmtK(portfolio.total_cost),
              style: { color:'var(--text-primary)' },
              sub:   'Amount invested',
            },
            {
              label: 'Investment Gain / Loss',
              value: `${(portfolio.total_gain_loss||0)>=0?'+':''}${fmtK(portfolio.total_gain_loss)}`,
              style: { color:(portfolio.total_gain_loss||0)>=0?'#10b981':'#f43f5e' },
              sub:   fmtPct(portfolio.gain_loss_pct),
            },
          ].map(card => (
            <div key={card.label}>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color:'var(--text-muted)' }}>{card.label}</p>
              <p className="font-num font-bold text-2xl" style={card.style}>{card.value}</p>
              <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat cards (dynamic counts) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label:      'Active Goals',
            value:      String(goals.active ?? 0),
            sub:        goals.total > 0 ? `${goals.total} total (${goals.active} active)` : 'No goals yet',
            valueColor: '#ec4899',
            icon:       Target,
            iconColor:  '#ec4899',
            action:     () => navigate('/goals'),
            actionLabel:'View goals →',
          },
          {
            label:      'Portfolio Positions',
            value:      String(portfolio.num_positions ?? 0),
            sub:        portfolio.num_positions > 0
                          ? `${fmtK(portfolio.total_value)} total value`
                          : 'No investments yet',
            valueColor: 'var(--purple)',
            icon:       Briefcase,
            iconColor:  'var(--purple)',
            action:     () => navigate('/portfolio'),
            actionLabel:'View portfolio →',
          },
          {
            label:      'Risk Profile',
            value:      riskLabel,
            sub:        profileUser.kyc_status === 'verified' ? '✓ KYC Verified' : 'KYC Pending',
            valueColor: 'var(--purple)',
            icon:       Activity,
            iconColor:  'var(--purple)',
            action:     () => navigate('/profile'),
            actionLabel:'Update profile →',
          },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="dark-card p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>{card.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background:`${card.iconColor}18` }}>
                  <Icon size={15} style={{ color:card.iconColor }}/>
                </div>
              </div>
              <p className="font-display font-bold text-3xl font-num mb-1" style={{ color:card.valueColor }}>
                {card.value}
              </p>
              <p className="text-xs" style={{ color:'var(--text-muted)' }}>{card.sub}</p>
              <button onClick={card.action}
                className="text-xs mt-3 flex items-center gap-1"
                style={{ color:'var(--purple)' }}>
                {card.actionLabel} <ArrowUpRight size={11}/>
              </button>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left: Goals + Portfolio ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Goals */}
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeGoals.map(goal => {
                const pct = Math.min(Math.round(goal.progress_percent || 0), 100)
                return (
                  <div key={goal.id} onClick={() => navigate(`/goals/${goal.id}`)}
                    className="dark-card-hover p-4 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{GOAL_ICONS[goal.goal_type] || '🎯'}</span>
                      <p className="text-xs font-semibold truncate" style={{ color:'var(--text-secondary)' }}>{goal.name}</p>
                    </div>
                    <p className="font-num font-bold text-xl mb-0.5" style={{ color:'var(--text-primary)' }}>
                      {fmtK(goal.current_amount)}
                    </p>
                    <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>Target: {fmtK(goal.target_amount)}</p>
                    <div className="progress-dark mb-2">
                      <div className="progress-dark-fill" style={{ width:`${pct}%` }}/>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color:'var(--purple)' }}>{pct}% complete</span>
                      {goal.months_remaining != null && (
                        <span className="text-xs" style={{ color:'var(--text-muted)' }}>{goal.months_remaining} mo left</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="dark-card p-8 flex flex-col items-center text-center">
              <Target size={28} className="mb-3" style={{ color:'var(--purple)', opacity:0.4 }}/>
              <p className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>No active goals</p>
              <p className="text-sm mb-4" style={{ color:'var(--text-secondary)' }}>Create a financial goal to track progress</p>
              <button onClick={() => navigate('/goals')} className="btn-purple text-sm py-2">
                <Plus size={14}/> Add Your First Goal
              </button>
            </div>
          )}

          {/* Portfolio table */}
          <div className="dark-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom:'1px solid var(--bg-border)' }}>
              <h2 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>
                Portfolio Summary
              </h2>
              <button onClick={() => navigate('/portfolio')}
                className="flex items-center gap-1 text-xs" style={{ color:'var(--purple)' }}>
                View Full Portfolio <ArrowUpRight size={12}/>
              </button>
            </div>

            {investments.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Briefcase size={28} className="mb-3" style={{ color:'var(--purple)', opacity:0.4 }}/>
                <p className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>No investments yet</p>
                <p className="text-sm mb-4" style={{ color:'var(--text-secondary)' }}>Add a buy transaction to start</p>
                <button onClick={() => navigate('/portfolio')} className="btn-purple text-sm py-2">
                  <Plus size={14}/> Add Investment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:'var(--bg-surface)' }}>
                      {['Asset','Symbol','Units','Avg Buy','Market Value','Gain %'].map(h => (
                        <th key={h} className={`px-4 py-3 text-xs font-medium uppercase tracking-wide ${h==='Asset'?'text-left':'text-right'}`}
                          style={{ color:'var(--text-muted)', borderBottom:'1px solid var(--bg-border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map(inv => (
                      <tr key={inv.id} className="dark-tr" style={{ borderBottom:'1px solid rgba(37,47,71,0.5)' }}>
                        <td className="px-4 py-3.5" style={{ color:'var(--text-primary)' }}>
                          <div className="flex items-center gap-1.5">
                            {inv.company_name || inv.symbol}
                            {inv.last_price_at && (
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'#10b981' }}/>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs" style={{ color:'var(--purple)' }}>{inv.symbol}</td>
                        <td className="px-4 py-3.5 text-right font-num" style={{ color:'var(--text-secondary)' }}>
                          {Number(inv.units).toLocaleString(undefined, {maximumFractionDigits:4})}
                        </td>
                        <td className="px-4 py-3.5 text-right font-num" style={{ color:'var(--text-secondary)' }}>
                          {fmt(inv.avg_buy_price)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-num font-semibold" style={{ color:'var(--text-primary)' }}>
                          {fmtK(inv.current_value)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="flex items-center justify-end gap-1 font-num text-xs font-semibold"
                            style={{ color:inv.gain_loss_pct>=0?'#10b981':'#f43f5e' }}>
                            {inv.gain_loss_pct>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                            {fmtPct(inv.gain_loss_pct)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          {recentTxns.length > 0 && (
            <div className="dark-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom:'1px solid var(--bg-border)' }}>
                <h2 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>Recent Transactions</h2>
                <button onClick={() => navigate('/portfolio')}
                  className="flex items-center gap-1 text-xs" style={{ color:'var(--purple)' }}>
                  View All <ArrowUpRight size={12}/>
                </button>
              </div>
              <div>
                {recentTxns.map(txn => {
                  const color = TXN_COLORS[txn.type] || '#94a3b8'
                  return (
                    <div key={txn.id} className="flex items-center justify-between px-5 py-3 dark-tr"
                      style={{ borderBottom:'1px solid rgba(37,47,71,0.4)' }}>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={{ background:`${color}18`, color }}>
                          {txn.type}
                        </span>
                        <span className="font-mono font-bold text-sm" style={{ color:'var(--text-secondary)' }}>
                          {txn.symbol || '—'}
                        </span>
                        {txn.quantity > 0 && (
                          <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                            × {Number(txn.quantity).toLocaleString(undefined,{maximumFractionDigits:4})}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-num font-semibold text-sm" style={{ color }}>
                          {fmt(txn.total_amount)}
                        </p>
                        <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                          {txn.executed_at
                            ? new Date(txn.executed_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})
                            : '—'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Live Market Indices */}
          <div className="dark-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>
                Market Overview
              </h2>
              <button onClick={loadIndices} disabled={loadingIdx}
                className="p-1.5 rounded-lg transition-colors" style={{ color:'var(--text-muted)' }}>
                <RefreshCw size={13} className={loadingIdx?'animate-spin':''}/>
              </button>
            </div>

            {idxError ? (
              <p className="text-xs" style={{ color:'var(--text-muted)' }}>{idxError}</p>
            ) : loadingIdx ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between py-1.5">
                    <div className="h-3 w-20 rounded animate-pulse" style={{ background:'var(--bg-border)' }}/>
                    <div className="h-3 w-16 rounded animate-pulse" style={{ background:'var(--bg-border)' }}/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {indices.map(m => (
                  <div key={m.symbol} className="flex items-center justify-between py-2"
                    style={{ borderBottom:'1px solid rgba(37,47,71,0.4)' }}>
                    <span className="text-sm font-medium" style={{ color:'var(--text-secondary)' }}>{m.name}</span>
                    <div className="text-right">
                      {m.price ? (
                        <>
                          <p className="font-num text-sm font-semibold" style={{ color:'var(--text-primary)' }}>
                            {m.price >= 1000
                              ? m.price.toLocaleString('en-US',{maximumFractionDigits:2})
                              : m.price.toFixed(2)}
                          </p>
                          <p className="font-num text-xs" style={{ color:m.change_pct>=0?'#10b981':'#f43f5e' }}>
                            {m.change>=0?'+':''}{m.change?.toFixed(2)} ({m.change_pct>=0?'+':''}{m.change_pct?.toFixed(2)}%)
                          </p>
                        </>
                      ) : (
                        <p className="text-xs" style={{ color:'var(--text-muted)' }}>—</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs mt-3" style={{ color:'var(--text-muted)' }}>
              Live via yfinance · {indices[0]?.fetched_at
                ? new Date(indices[0].fetched_at).toLocaleTimeString()
                : '—'}
            </p>
          </div>

          {/* Allocation */}
          {allocation.length > 0 && (
            <div className="dark-card p-5">
              <h2 className="font-display font-semibold mb-3" style={{ color:'var(--text-primary)' }}>Allocation</h2>
              <div className="space-y-2.5">
                {allocation.map(a => (
                  <div key={a.asset_type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize" style={{ color:'var(--text-secondary)' }}>
                        {a.asset_type.replace('_',' ')}
                      </span>
                      <span className="font-num font-medium" style={{ color:'var(--text-primary)' }}>
                        {a.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'var(--bg-border)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width:`${a.percentage}%`, background:a.color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="dark-card p-5">
            <h2 className="font-display font-semibold mb-3" style={{ color:'var(--text-primary)' }}>Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/goals')} className="btn-purple w-full justify-center text-sm py-2.5">
                <Plus size={15}/> Add New Goal
              </button>
              <button onClick={() => navigate('/portfolio')} className="btn-ghost w-full justify-center text-sm py-2.5">
                <Briefcase size={15}/> Add Investment
              </button>
              <button onClick={() => navigate('/reports')} className="btn-ghost w-full justify-center text-sm py-2.5">
                <BarChart3 size={15}/> View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs pb-2" style={{ color:'var(--text-muted)' }}>
        © 2026 WealthApp. All rights reserved.
      </p>
    </div>
  )
}
