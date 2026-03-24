import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { goalsApi } from '../services/goalsApi'
import GoalFormModal from '../components/goals/GoalFormModal'
import { Plus, Search, MoreVertical, Target, Home, GraduationCap, Briefcase, Edit2, Trash2, PlayCircle, PauseCircle, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_CFG = {
  active:    { label: 'Active',    badge: 'badge-green'  },
  paused:    { label: 'Paused',    badge: 'badge-yellow' },
  completed: { label: 'Completed', badge: 'badge-blue'   },
}
const TYPE_CFG = {
  retirement: { label: 'Retirement',        icon: Briefcase,     color: '#a855f7' },
  home:       { label: 'Home Purchase',     icon: Home,          color: '#10b981' },
  education:  { label: "Child's Education", icon: GraduationCap, color: '#06b6d4' },
  custom:     { label: 'Custom',            icon: Target,        color: '#f59e0b' },
}
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function GoalsPage() {
  const navigate = useNavigate()
  const [goals, setGoals]         = useState([])
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter]     = useState('')
  const [page, setPage]           = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editGoal, setEditGoal]   = useState(null)
  const [openMenuId, setOpenMenuId]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)

  const fetchGoals = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = { page, page_size: 8 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.goal_type = typeFilter
      const res = await goalsApi.list(params)
      setGoals(res.data.goals); setTotal(res.data.total); setTotalPages(res.data.total_pages)
    } catch { setError('Failed to load goals') } finally { setLoading(false) }
  }, [page, search, statusFilter, typeFilter])

  useEffect(() => { fetchGoals() }, [fetchGoals])
  useEffect(() => { setPage(1) }, [search, statusFilter, typeFilter])

  const handleCreate = async (data) => { await goalsApi.create(data); fetchGoals() }
  const handleUpdate = async (data) => { await goalsApi.update(editGoal.id, data); setEditGoal(null); fetchGoals() }
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return
    setDeleteLoading(id)
    try { await goalsApi.delete(id); fetchGoals() } finally { setDeleteLoading(null); setOpenMenuId(null) }
  }
  const handleStatus = async (goal, status) => { await goalsApi.update(goal.id, { status }); fetchGoals(); setOpenMenuId(null) }

  const labelStyle = { color: 'var(--text-secondary)' }

  return (
    <div className="p-5 lg:p-6 max-w-6xl mx-auto fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Investment Goals</h1>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-sm py-2">Bulk Actions</button>
          <button onClick={() => { setEditGoal(null); setModalOpen(true) }} className="btn-purple text-sm py-2">
            <Plus size={15} /> Add Goal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search goals..." className="dark-input pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="dark-input text-sm w-full sm:w-40">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="dark-input text-sm w-full sm:w-44">
          <option value="">All Types</option>
          <option value="retirement">Retirement</option>
          <option value="home">Home Purchase</option>
          <option value="education">Child's Education</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Table */}
      <div className="dark-card overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 p-4 text-sm" style={{ color: '#fb7185', background: 'rgba(244,63,94,0.08)', borderBottom: '1px solid rgba(244,63,94,0.2)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your Goals ({total})</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--purple)', borderTopColor: 'transparent' }} />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(168,85,247,0.1)' }}>
              <Target size={24} style={{ color: 'var(--purple)' }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No goals yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Create your first financial goal to get started</p>
            <button onClick={() => { setEditGoal(null); setModalOpen(true) }} className="btn-purple text-sm py-2">
              <Plus size={14} /> Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  {['Goal Name', 'Type', 'Target Amount', 'Target Date', 'Monthly Contribution', 'Progress', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 font-medium text-xs uppercase tracking-wide ${h === 'Goal Name' ? 'text-left' : h === 'Type' || h === 'Status' || h === 'Actions' || h === 'Progress' ? 'text-left' : 'text-right'}`}
                      style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--bg-border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {goals.map(goal => {
                  const tc = TYPE_CFG[goal.goal_type] || TYPE_CFG.custom
                  const sc = STATUS_CFG[goal.status] || STATUS_CFG.active
                  const Icon = tc.icon
                  const pct = Math.min(Math.round(goal.progress_percent || 0), 100)
                  return (
                    <tr key={goal.id} className="dark-tr transition-colors" style={{ borderBottom: '1px solid rgba(37,47,71,0.5)' }}>
                      <td className="px-4 py-3.5">
                        <button onClick={() => navigate(`/goals/${goal.id}`)}
                          className="font-medium text-left hover:underline" style={{ color: 'var(--purple)' }}>
                          {goal.name}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: `${tc.color}15`, color: tc.color, border: `1px solid ${tc.color}30` }}>
                          <Icon size={11} />{tc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-num font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(goal.target_amount)}</td>
                      <td className="px-4 py-3.5 text-right font-num" style={{ color: 'var(--text-secondary)' }}>{goal.target_date}</td>
                      <td className="px-4 py-3.5 text-right font-num" style={{ color: 'var(--text-secondary)' }}>{fmt(goal.monthly_contribution)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 min-w-[90px]">
                          <div className="progress-dark flex-1">
                            <div className="progress-dark-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-num w-8 text-right" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className={sc.badge}>{sc.label}</span></td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="relative inline-block">
                          <button onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === goal.id && (
                            <div className="absolute right-0 top-8 z-20 w-44 rounded-xl py-1 shadow-xl fade-up"
                              style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}>
                              <button onClick={() => navigate(`/goals/${goal.id}`)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                style={{ color: 'var(--purple)' }}>
                                <PlayCircle size={14} /> View & Simulate
                              </button>
                              <button onClick={() => { setEditGoal(goal); setOpenMenuId(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                style={{ color: 'var(--text-secondary)' }}>
                                <Edit2 size={14} /> Edit Goal
                              </button>
                              {goal.status !== 'active' && (
                                <button onClick={() => handleStatus(goal, 'active')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                  style={{ color: '#10b981' }}>
                                  <CheckCircle2 size={14} /> Mark Active
                                </button>
                              )}
                              {goal.status === 'active' && (
                                <button onClick={() => handleStatus(goal, 'paused')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                  style={{ color: '#f59e0b' }}>
                                  <PauseCircle size={14} /> Pause Goal
                                </button>
                              )}
                              <div style={{ borderTop: '1px solid var(--bg-border)', margin: '4px 0' }} />
                              <button onClick={() => handleDelete(goal.id)} disabled={deleteLoading === goal.id}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                style={{ color: '#f43f5e' }}>
                                <Trash2 size={14} />{deleteLoading === goal.id ? 'Deleting…' : 'Delete Goal'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--bg-border)' }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="text-sm w-8 h-8 rounded-lg font-medium transition-colors"
                style={page===p ? {background:'var(--purple)',color:'white'} : {color:'var(--text-secondary)'}}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>© 2026 WealthApp. All rights reserved.</p>

      <GoalFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      <GoalFormModal open={!!editGoal} onClose={() => setEditGoal(null)} onSubmit={handleUpdate} initialData={editGoal} />
      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}
    </div>
  )
}
