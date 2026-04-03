import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Download, Table2, Target, Activity,
  Loader2, AlertCircle, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, CheckCircle2, PauseCircle, Clock
} from 'lucide-react'
import api from '../services/api'
import { reportsApi, simulationsApi } from '../services/recommendationsApi'
import RiskProfileBadge from '../components/common/RiskProfileBadge'
import { useAuth } from '../context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt     = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)
const fmtPct  = n => `${Number(n ?? 0) >= 0 ? '+' : ''}${Number(n ?? 0).toFixed(2)}%`
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function showToast(msg, type = 'success') {
  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${type === 'error' ? '#f43f5e' : '#10b981'};
    color:white;padding:10px 18px;border-radius:10px;
    font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.4);
    animation:fadeUp 0.3s ease;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}

// ── Section wrappers ──────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, children, loading, error }) {
  return (
    <div className="dark-card overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bg-border)' }}>
        <Icon size={16} style={{ color: 'var(--purple)' }} />
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div className="p-5">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={22} className="animate-spin" style={{ color: 'var(--purple)' }} />
          </div>
        )}
        {error && !loading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--red)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {!loading && !error && children}
      </div>
    </div>
  )
}

// ── Portfolio Summary Section ─────────────────────────────────────────────────

function PortfolioSummarySection() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [sortKey, setSortKey] = useState('gain_loss_pct')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    api.get('/portfolio/summary').then(r => setData(r.data)).catch(() => setError('Failed to load portfolio')).finally(() => setLoading(false))
  }, [])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const investments = [...(data?.positions || [])].sort((a, b) => {
    const av = parseFloat(a[sortKey] || 0), bv = parseFloat(b[sortKey] || 0)
    return sortDir === 'desc' ? bv - av : av - bv
  })

  return (
    <SectionCard icon={TrendingUp} title="Portfolio Summary" loading={loading} error={error}>
      {data && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total Value',   value: fmt(data.total_value) },
              { label: 'Cost Basis',    value: fmt(data.total_cost_basis) },
              { label: 'Total Gain',    value: fmt(data.total_gain_loss), pct: fmtPct(data.total_gain_loss_pct), good: data.total_gain_loss >= 0 },
              { label: 'Holdings',      value: investments.length },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="font-bold font-num text-sm" style={{ color: s.good === false ? 'var(--red)' : s.good === true ? 'var(--green)' : 'var(--text-primary)' }}>
                  {s.value}
                </p>
                {s.pct && <p className="text-xs font-num" style={{ color: s.good ? 'var(--green)' : 'var(--red)' }}>{s.pct}</p>}
              </div>
            ))}
          </div>

          {/* Investments table */}
          {investments.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--bg-surface)' }}>
                    {['symbol','asset_type','units','cost_basis','current_value','gain_loss_pct'].map(k => (
                      <th key={k} className="px-3 py-2.5 text-right first:text-left cursor-pointer select-none"
                        style={{ color: sortKey === k ? 'var(--purple)' : 'var(--text-muted)', fontWeight: 600 }}
                        onClick={() => toggleSort(k)}>
                        {k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                        {sortKey === k && (sortDir === 'desc' ? ' ↓' : ' ↑')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv, i) => {
                    const gl = parseFloat(inv.gain_loss_pct || 0)
                    return (
                      <tr key={inv.id} className="dark-tr" style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface)' }}>
                        <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.symbol}</td>
                        <td className="px-3 py-2.5 text-right" style={{ color: 'var(--text-secondary)' }}>{inv.asset_type}</td>
                        <td className="px-3 py-2.5 text-right font-num" style={{ color: 'var(--text-secondary)' }}>{parseFloat(inv.units || 0).toFixed(4)}</td>
                        <td className="px-3 py-2.5 text-right font-num" style={{ color: 'var(--text-secondary)' }}>{fmt(inv.cost_basis)}</td>
                        <td className="px-3 py-2.5 text-right font-num" style={{ color: 'var(--text-primary)' }}>{fmt(inv.current_value)}</td>
                        <td className="px-3 py-2.5 text-right font-num font-semibold" style={{ color: gl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {gl >= 0 ? '+' : ''}{gl.toFixed(2)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </SectionCard>
  )
}

// ── Goals Progress Section ────────────────────────────────────────────────────

function GoalsProgressSection() {
  const [goals, setGoals]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/goals', { params: { page_size: 50 } })
      .then(r => setGoals(r.data.goals || []))
      .catch(() => setError('Failed to load goals'))
      .finally(() => setLoading(false))
  }, [])

  function statusIcon(s) {
    if (s === 'completed') return <CheckCircle2 size={13} style={{ color: 'var(--green)' }} />
    if (s === 'paused')    return <PauseCircle  size={13} style={{ color: 'var(--yellow)' }} />
    return                        <Clock        size={13} style={{ color: 'var(--cyan)' }} />
  }

  return (
    <SectionCard icon={Target} title="Goals Progress" loading={loading} error={error}>
      {goals.length === 0 && !loading && (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No goals found.</p>
      )}
      <div className="space-y-4">
        {goals.map(g => {
          const pct = Math.min(parseFloat(g.progress_percent || 0), 100)
          const status = g.status
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {statusIcon(status)}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.name}</span>
                  {status === 'completed' && <span className="badge-green text-xs">Completed</span>}
                  {status === 'paused'    && <span className="badge-yellow text-xs">Paused</span>}
                </div>
                <span className="text-xs font-num" style={{ color: 'var(--text-secondary)' }}>
                  {fmt(g.current_amount)} / {fmt(g.target_amount)}
                </span>
              </div>
              <div className="progress-dark">
                <div className="progress-dark-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'linear-gradient(90deg,#059669,#10b981)' : undefined }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: {fmtDate(g.target_date)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ── Simulation History Section ────────────────────────────────────────────────

function SimulationHistorySection() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [expanded, setExpanded] = useState({})
  const [page, setPage]       = useState(0)
  const LIMIT = 10

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const r = await api.get('/v1/simulations', { params: { limit: LIMIT, offset: p * LIMIT } })
      setData(r.data)
      setPage(p)
    } catch {
      setError('Failed to load simulations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(0) }, [load])

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const items   = data?.items || []
  const total   = data?.total || 0
  const pages   = Math.ceil(total / LIMIT)

  return (
    <SectionCard icon={Activity} title="Simulation History" loading={loading && !data} error={error}>
      {items.length === 0 && !loading && (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No simulations yet.</p>
      )}

      <div className="space-y-2">
        {items.map(s => (
          <div key={s.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ background: 'var(--bg-surface)' }}
              onClick={() => toggleExpand(s.id)}
              aria-expanded={!!expanded[s.id]}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.scenario_name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {s.goal_name ? `Goal: ${s.goal_name} · ` : ''}{fmtDate(s.created_at)}
                </p>
              </div>
              {expanded[s.id] ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
            </button>

            {expanded[s.id] && (
              <div className="px-4 py-3 space-y-3" style={{ borderTop: '1px solid var(--bg-border)' }}>
                {[['Assumptions', s.assumptions], ['Results', s.results]].map(([label, obj]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
                      {Object.entries(obj || {}).map(([k, v], i) => (
                        <div key={k} className="flex justify-between px-3 py-1.5 text-xs"
                          style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface)', borderBottom: '1px solid var(--bg-border)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                          <span className="font-num font-medium" style={{ color: 'var(--text-primary)' }}>
                            {typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button className="btn-ghost py-1 px-3 text-xs" onClick={() => load(page - 1)} disabled={page === 0 || loading}>Prev</button>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{page + 1} / {pages}</span>
          <button className="btn-ghost py-1 px-3 text-xs" onClick={() => load(page + 1)} disabled={page >= pages - 1 || loading}>Next</button>
        </div>
      )}
    </SectionCard>
  )
}

// ── Reports Page ──────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user } = useAuth()
  const [dlPdf,    setDlPdf]    = useState(false)
  const [dlCsv,    setDlCsv]    = useState(false)
  const [csvType,  setCsvType]  = useState('portfolio')

  async function handleDownloadPdf() {
    setDlPdf(true)
    try {
      const res = await reportsApi.downloadPdf()
      const today = new Date().toISOString().split('T')[0]
      triggerBlobDownload(res.data, `wealth-report-${today}.pdf`)
      showToast('PDF report downloaded!')
    } catch {
      showToast('Failed to generate PDF. Try again.', 'error')
    } finally {
      setDlPdf(false)
    }
  }

  async function handleDownloadCsv() {
    setDlCsv(true)
    try {
      const res = await reportsApi.downloadCsv(csvType)
      const today = new Date().toISOString().split('T')[0]
      triggerBlobDownload(res.data, `${csvType}-${today}.csv`)
      showToast('CSV exported successfully!')
    } catch {
      showToast('Failed to export CSV. Try again.', 'error')
    } finally {
      setDlCsv(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto fade-up">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 pb-4 mb-2"
        style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-border)' }}>
        <div className="flex items-start justify-between flex-wrap gap-3 pt-2">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Portfolio, goals & simulation summaries</p>
              {user?.risk_profile && <RiskProfileBadge riskProfile={user.risk_profile} size="sm" />}
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* CSV scope dropdown + download */}
            <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
              <select
                value={csvType}
                onChange={e => setCsvType(e.target.value)}
                className="text-xs px-2 py-1.5 outline-none"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderRight: '1px solid var(--bg-border)', cursor: 'pointer' }}
                aria-label="CSV export scope"
              >
                <option value="portfolio">Portfolio CSV</option>
                <option value="goals">Goals CSV</option>
                <option value="transactions">Transactions CSV</option>
              </select>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                onClick={handleDownloadCsv}
                disabled={dlCsv}
                aria-label="Export CSV"
              >
                {dlCsv ? <Loader2 size={12} className="animate-spin" /> : <Table2 size={12} />}
                {dlCsv ? 'Exporting…' : 'Export'}
              </button>
            </div>

            <button
              className="btn-purple flex items-center gap-2"
              onClick={handleDownloadPdf}
              disabled={dlPdf}
              aria-label="Download full PDF report"
            >
              {dlPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {dlPdf ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 mt-4">
        <PortfolioSummarySection />
        <GoalsProgressSection />
        <SimulationHistorySection />
      </div>
    </div>
  )
}
