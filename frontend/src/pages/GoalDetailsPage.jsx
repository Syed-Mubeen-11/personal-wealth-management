import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { goalsApi } from '../services/goalsApi'
import api from '../services/api'
import {
  ArrowLeft, PlayCircle, Save, Download, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Loader2, GitCompare, BarChart2,
  DollarSign, Calendar, TrendingUp, Info, BookOpen, AlertTriangle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt  = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(n ?? 0)
const fmtK = (n) => {
  const abs = Math.abs(n ?? 0)
  if (abs >= 1e6) return `$${((n??0)/1e6).toFixed(2)}M`
  if (abs >= 1e3) return `$${((n??0)/1e3).toFixed(1)}K`
  return fmt(n)
}

// ── Dark tooltip ──────────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 text-xs shadow-xl" style={{ background:'var(--bg-card)', border:'1px solid var(--bg-border)' }}>
      <p className="font-semibold mb-2" style={{ color:'var(--text-primary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background:p.color }}/>
          <span style={{ color:'var(--text-secondary)' }}>{p.name}:</span>
          <span className="font-semibold" style={{ color:p.color }}>{fmtK(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

// ── Slider input ──────────────────────────────────────────────────────────────
function SliderInput({ label, name, value, onChange, min, max, step, unit = '', hint = '' }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium" style={{ color:'var(--text-secondary)' }}>{label}</label>
        <span className="text-xs font-bold font-num px-2 py-0.5 rounded-lg"
          style={{ background:'rgba(168,85,247,0.15)', color:'var(--purple)' }}>
          {value}{unit}
        </span>
      </div>
      <input type="range" name={name} min={min} max={max} step={step}
        value={value} onChange={onChange}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor:'var(--purple)' }}/>
      <div className="flex justify-between text-xs mt-1" style={{ color:'var(--text-muted)' }}>
        <span>{min}{unit}</span>
        {hint && <span style={{ color:'var(--text-muted)' }}>{hint}</span>}
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

// ── Number input with validation ──────────────────────────────────────────────
function NumInput({ label, name, value, onChange, min = 0, max, prefix = '', suffix = '', placeholder = '', error = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color:'var(--text-secondary)' }}>{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'var(--text-muted)' }}>{prefix}</span>}
        <input type="number" name={name} value={value} onChange={onChange}
          min={min} max={max} placeholder={placeholder}
          className={`dark-input text-sm py-2 ${prefix?'pl-7':''} ${suffix?'pr-8':''}`}
          style={error ? { borderColor:'#f43f5e' } : {}}/>
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'var(--text-muted)' }}>{suffix}</span>}
      </div>
      {error && <p className="text-xs mt-1" style={{ color:'#fb7185' }}>{error}</p>}
    </div>
  )
}

// ── Tab button ────────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon: Icon, children }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
    style={active
      ? { background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--bg-border)' }
      : { color:'var(--text-muted)' }}>
    {Icon && <Icon size={13}/>}
    {children}
  </button>
)

// ── Result stat block ─────────────────────────────────────────────────────────
const StatBlock = ({ label, value, color, sub }) => (
  <div className="p-3 rounded-xl" style={{ background:'var(--bg-surface)' }}>
    <p className="text-xs mb-1" style={{ color:'var(--text-muted)' }}>{label}</p>
    <p className="font-num font-bold text-sm" style={{ color }}>{value}</p>
    {sub && <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{sub}</p>}
  </div>
)

// ── Contribution schedule ─────────────────────────────────────────────────────
function buildContribSchedule(goal) {
  const monthly = parseFloat(goal?.monthly_contribution || 0)
  const current = parseFloat(goal?.current_amount || 0)
  const target  = parseFloat(goal?.target_amount  || 0)
  const today   = new Date()
  const tdate   = new Date(goal?.target_date)
  const maxMonths = Math.min(
    Math.max((tdate.getFullYear() - today.getFullYear()) * 12 + (tdate.getMonth() - today.getMonth()), 1),
    60
  )
  const monthly_data = []
  let cum = current
  for (let i = 1; i <= maxMonths; i++) {
    const d = new Date(today); d.setMonth(d.getMonth() + i)
    cum += monthly
    monthly_data.push({
      period:    d.toLocaleDateString('en-US', { month:'short', year:'2-digit' }),
      contribution: monthly,
      cumulative: Math.round(cum),
      target,
    })
  }
  const weekly_data = []
  let wcum = current
  const weeks = Math.min(52, maxMonths * 4)
  const wamt  = parseFloat((monthly / 4.33).toFixed(2))
  for (let i = 1; i <= weeks; i++) {
    wcum += wamt
    weekly_data.push({ period:`W${i}`, contribution:wamt, cumulative:Math.round(wcum), target })
  }
  return {
    monthly: monthly_data,
    weekly:  weekly_data,
    daily:   monthly / 30,
    weekly_amt: wamt,
    annual:  monthly * 12,
    months_to_goal: monthly > 0 ? Math.ceil(Math.max(target - current, 0) / monthly) : null,
  }
}


// ── Main page ─────────────────────────────────────────────────────────────────
export default function GoalDetailsPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [goal,        setGoal]        = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [activeTab,   setActiveTab]   = useState('simulate')

  // ── Simulation state ──
  const [simForm, setSimForm] = useState({
    annual_return_rate: 8,
    inflation_rate:     3,
    additional_monthly: 0,
    simulation_years:   '',
    scenario_name:      'Base Case',
  })
  const [simErrors,  setSimErrors]  = useState({})
  const [simResult,  setSimResult]  = useState(null)
  const [simLoading, setSimLoading] = useState(false)
  const [simError,   setSimError]   = useState('')
  const [saveOk,     setSaveOk]     = useState(false)
  const [savedSims,  setSavedSims]  = useState([])
  const [showSaved,  setShowSaved]  = useState(false)
  const [showJson,   setShowJson]   = useState(false)

  // ── What-If state ──
  const [wfForm, setWfForm] = useState({
    base_annual_return:   8,
    base_inflation:       3,
    base_sim_years:       '',
    whatif_extra_monthly: 500,
    whatif_annual_return: '',
    whatif_sim_years:     '',
    whatif_inflation:     '',
    whatif_target_date:   '',
  })
  const [wfErrors,  setWfErrors]  = useState({})
  const [wfResult,  setWfResult]  = useState(null)
  const [wfLoading, setWfLoading] = useState(false)
  const [wfError,   setWfError]   = useState('')
  const [wfSaveOk,  setWfSaveOk]  = useState(false)

  // ── Contribution tab ──
  const [contribFreq, setContribFreq] = useState('monthly')
  const contribData = useMemo(() => goal ? buildContribSchedule(goal) : null, [goal])

  useEffect(() => {
    goalsApi.get(id)
      .then(r => {
        setGoal(r.data)
        // Pre-fill scenario name with goal name
        setSimForm(f => ({ ...f, scenario_name: `${r.data.name} — Base Case` }))
      })
      .catch(() => navigate('/goals'))
      .finally(() => setPageLoading(false))
  }, [id, navigate])

  // Load saved simulations
  useEffect(() => {
    if (goal) {
      goalsApi.simulations(id).then(r => setSavedSims(r.data || [])).catch(() => {})
    }
  }, [goal, id])

  // ── Validation ────────────────────────────────────────────────────────────
  function validateSim(form) {
    const errs = {}
    if (form.annual_return_rate < 0)  errs.annual_return_rate = 'Cannot be negative'
    if (form.annual_return_rate > 50) errs.annual_return_rate = 'Maximum 50%'
    if (form.inflation_rate < 0)      errs.inflation_rate     = 'Cannot be negative'
    if (form.inflation_rate > 20)     errs.inflation_rate     = 'Maximum 20%'
    if (form.additional_monthly < 0)  errs.additional_monthly = 'Cannot be negative'
    if (form.simulation_years && (form.simulation_years < 1 || form.simulation_years > 50))
      errs.simulation_years = '1 – 50 years'
    if (!form.scenario_name?.trim())  errs.scenario_name      = 'Required'
    return errs
  }

  function validateWf(form) {
    const errs = {}
    if (form.base_annual_return < 0 || form.base_annual_return > 50)  errs.base_annual_return = '0 – 50%'
    if (form.base_inflation < 0     || form.base_inflation > 20)      errs.base_inflation     = '0 – 20%'
    if (form.whatif_extra_monthly < 0)  errs.whatif_extra_monthly = 'Cannot be negative'
    if (form.whatif_annual_return !== '' && (Number(form.whatif_annual_return) < 0 || Number(form.whatif_annual_return) > 50))
      errs.whatif_annual_return = '0 – 50%'
    return errs
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSim  = (e) => { setSimForm(f => ({ ...f, [e.target.name]: e.target.type === 'range' ? Number(e.target.value) : e.target.value })); setSimErrors({}) }
  const handleWf   = (e) => { setWfForm(f =>  ({ ...f, [e.target.name]: e.target.type === 'range' ? Number(e.target.value) : e.target.value })); setWfErrors({}) }

  async function runSimulation(save = false) {
    const errs = validateSim(simForm)
    if (Object.keys(errs).length) { setSimErrors(errs); return }
    setSimLoading(true); setSimError(''); setSaveOk(false)
    try {
      const payload = {
        goal_id:            parseInt(id),
        annual_return_rate: Number(simForm.annual_return_rate),
        inflation_rate:     Number(simForm.inflation_rate),
        additional_monthly: Number(simForm.additional_monthly) || 0,
        scenario_name:      simForm.scenario_name,
        save_scenario:      save,
      }
      if (simForm.simulation_years) payload.simulation_years = parseInt(simForm.simulation_years)
      const res = await goalsApi.simulate(id, payload)
      setSimResult(res.data)
      if (save) {
        setSaveOk(true)
        // Refresh saved list
        goalsApi.simulations(id).then(r => setSavedSims(r.data || [])).catch(() => {})
        setTimeout(() => setSaveOk(false), 3000)
      }
    } catch (err) {
      const d = err.response?.data?.detail
      setSimError(Array.isArray(d) ? d.map(x => x.msg).join(', ') : (d || 'Simulation failed'))
    } finally { setSimLoading(false) }
  }

  async function runWhatIf(save = false) {
    const errs = validateWf(wfForm)
    if (Object.keys(errs).length) { setWfErrors(errs); return }
    setWfLoading(true); setWfError(''); setWfSaveOk(false)
    try {
      const payload = {
        base_annual_return:   Number(wfForm.base_annual_return),
        base_inflation:       Number(wfForm.base_inflation),
        whatif_extra_monthly: Number(wfForm.whatif_extra_monthly) || 0,
        save_whatif:          save,
      }
      if (wfForm.base_sim_years)      payload.base_sim_years      = parseInt(wfForm.base_sim_years)
      if (wfForm.whatif_annual_return !== '') payload.whatif_annual_return = Number(wfForm.whatif_annual_return)
      if (wfForm.whatif_sim_years     !== '') payload.whatif_sim_years     = parseInt(wfForm.whatif_sim_years)
      if (wfForm.whatif_inflation     !== '') payload.whatif_inflation     = Number(wfForm.whatif_inflation)
      if (wfForm.whatif_target_date   !== '') payload.whatif_target_date   = wfForm.whatif_target_date
      const res = await api.post(`/goals/${id}/whatif`, payload)
      setWfResult(res.data)
      if (save) {
        setWfSaveOk(true)
        goalsApi.simulations(id).then(r => setSavedSims(r.data || [])).catch(() => {})
        setTimeout(() => setWfSaveOk(false), 3000)
      }
    } catch (err) {
      const d = err.response?.data?.detail
      setWfError(Array.isArray(d) ? d.map(x => x.msg).join(', ') : (d || 'What-If failed'))
    } finally { setWfLoading(false) }
  }

  const exportJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `simulation-${goal?.name || id}.json`; a.click()
  }

  if (pageLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 size={32} className="animate-spin" style={{ color:'var(--purple)' }}/>
    </div>
  )
  if (!goal) return null

  const pct     = Math.min(Math.round(goal.progress_percent || 0), 100)
  const results = simResult?.results || {}
  const yearly  = results?.yearly_breakdown || []

  // Chart data for simulation
  const simChartData = yearly.map(y => ({
    year:              String(y.year),
    'Portfolio Value': y.value,
    'Contributions':   y.cumulative_contribution,
    'Gains':           y.cumulative_gain,
  }))

  // Chart data for what-if comparison
  const wfBase   = wfResult?.base_scenario?.yearly_breakdown   || []
  const wfWhatif = wfResult?.whatif_scenario?.yearly_breakdown || []
  const wfChartData = Array.from({ length: Math.max(wfBase.length, wfWhatif.length) }, (_, i) => ({
    year:          (wfBase[i] || wfWhatif[i])?.year || '',
    'Current Plan': wfBase[i]?.value   ?? null,
    'What-If':      wfWhatif[i]?.value ?? null,
  }))

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto fade-up">
      {/* Back */}
      <button onClick={() => navigate('/goals')} className="flex items-center gap-1.5 text-sm mb-5"
        style={{ color:'var(--text-muted)' }}>
        <ArrowLeft size={14}/> Back to Goals
      </button>

      {/* ── Goal summary ── */}
      <div className="dark-card p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="font-display font-bold text-xl" style={{ color:'var(--text-primary)' }}>
              {goal.name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
              Target: {fmt(goal.target_amount)} by {goal.target_date}
            </p>
          </div>
          <span className="badge-purple text-xs self-start capitalize">{goal.goal_type}</span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ color:'var(--text-secondary)' }}>
            <span>{pct}% achieved</span>
            <span>{fmt(goal.current_amount)} of {fmt(goal.target_amount)}</span>
          </div>
          <div className="progress-dark"><div className="progress-dark-fill" style={{ width:`${pct}%` }}/></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBlock label="Current Value"     value={fmt(goal.current_amount)}       color="var(--text-primary)"/>
          <StatBlock label="Target Amount"     value={fmt(goal.target_amount)}        color="var(--purple)"/>
          <StatBlock label="Monthly SIP"       value={fmt(goal.monthly_contribution)} color="var(--text-primary)"/>
          <StatBlock label="Amount Remaining"  value={fmt(goal.amount_remaining||0)}  color="#f43f5e"/>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-5 flex-wrap" style={{ background:'var(--bg-surface)' }}>
        <TabBtn active={activeTab==='simulate'}     onClick={() => setActiveTab('simulate')}     icon={PlayCircle}>Simulation</TabBtn>
        <TabBtn active={activeTab==='whatif'}       onClick={() => setActiveTab('whatif')}       icon={GitCompare}>What-If</TabBtn>
        <TabBtn active={activeTab==='contributions'} onClick={() => setActiveTab('contributions')} icon={BarChart2}>Contributions</TabBtn>
        {savedSims.length > 0 && (
          <TabBtn active={activeTab==='saved'} onClick={() => setActiveTab('saved')} icon={BookOpen}>
            Saved ({savedSims.length})
          </TabBtn>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── SIMULATION TAB ── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'simulate' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="dark-card p-5">
              <h2 className="font-display font-semibold mb-0.5" style={{ color:'var(--text-primary)' }}>
                Simulation Parameters
              </h2>
              <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>
                Adjust assumptions to project future portfolio value using compound interest.
              </p>

              <div className="space-y-5">
                <SliderInput
                  label="Expected Annual Return"
                  name="annual_return_rate"
                  value={simForm.annual_return_rate}
                  onChange={handleSim}
                  min={0} max={25} step={0.5} unit="%"
                  hint="Equity avg ~10%, balanced ~7%"
                />
                {simErrors.annual_return_rate && <p className="text-xs -mt-3" style={{ color:'#fb7185' }}>{simErrors.annual_return_rate}</p>}

                <SliderInput
                  label="Annual Inflation Rate"
                  name="inflation_rate"
                  value={simForm.inflation_rate}
                  onChange={handleSim}
                  min={0} max={15} step={0.5} unit="%"
                  hint="Historical avg ~3%"
                />
                {simErrors.inflation_rate && <p className="text-xs -mt-3" style={{ color:'#fb7185' }}>{simErrors.inflation_rate}</p>}

                <NumInput
                  label="Extra Monthly Contribution ($)"
                  name="additional_monthly"
                  value={simForm.additional_monthly}
                  onChange={handleSim}
                  min={0} prefix="$"
                  placeholder="0 — on top of your current SIP"
                  error={simErrors.additional_monthly}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium" style={{ color:'var(--text-secondary)' }}>
                      Simulation Period (Years)
                    </label>
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                      Leave blank = use target date
                    </span>
                  </div>
                  <input
                    type="number" name="simulation_years"
                    value={simForm.simulation_years}
                    onChange={handleSim}
                    min={1} max={50} placeholder={`Auto (${goal.months_remaining ? Math.ceil(goal.months_remaining/12) : '?'} yrs to target)`}
                    className="dark-input text-sm py-2"
                    style={simErrors.simulation_years ? { borderColor:'#f43f5e' } : {}}
                  />
                  {simErrors.simulation_years && <p className="text-xs mt-1" style={{ color:'#fb7185' }}>{simErrors.simulation_years}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color:'var(--text-secondary)' }}>
                    Scenario Name
                  </label>
                  <input name="scenario_name" value={simForm.scenario_name} onChange={handleSim}
                    className="dark-input text-sm py-2"
                    style={simErrors.scenario_name ? { borderColor:'#f43f5e' } : {}}/>
                  {simErrors.scenario_name && <p className="text-xs mt-1" style={{ color:'#fb7185' }}>{simErrors.scenario_name}</p>}
                </div>
              </div>

              {/* Info box */}
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2"
                style={{ background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.15)' }}>
                <Info size={12} style={{ color:'var(--purple)', marginTop:2, flexShrink:0 }}/>
                <p className="text-xs" style={{ color:'var(--text-secondary)' }}>
                  Monthly SIP used: {fmt(goal.monthly_contribution)}
                  {simForm.additional_monthly > 0 && ` + $${simForm.additional_monthly} extra = ${fmt(Number(goal.monthly_contribution) + Number(simForm.additional_monthly))}/mo`}
                </p>
              </div>

              {simError && (
                <div className="mt-3 p-3 rounded-xl flex items-start gap-2"
                  style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)' }}>
                  <AlertTriangle size={13} style={{ color:'#fb7185', flexShrink:0, marginTop:1 }}/>
                  <p className="text-xs" style={{ color:'#fb7185' }}>{simError}</p>
                </div>
              )}
              {saveOk && (
                <p className="mt-3 text-xs p-2 rounded-lg flex items-center gap-1"
                  style={{ background:'rgba(16,185,129,0.1)', color:'#34d399' }}>
                  <CheckCircle2 size={12}/> Scenario saved successfully!
                </p>
              )}

              <div className="mt-4 space-y-2">
                <button onClick={() => runSimulation(false)} disabled={simLoading}
                  className="btn-purple w-full justify-center text-sm py-2.5">
                  {simLoading ? <Loader2 size={14} className="animate-spin"/> : <PlayCircle size={14}/>}
                  {simLoading ? 'Calculating…' : 'Run Simulation'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => runSimulation(true)} disabled={simLoading || !simResult}
                    className="btn-ghost flex-1 justify-center text-xs py-2 disabled:opacity-40">
                    <Save size={12}/> Save Scenario
                  </button>
                  <button onClick={() => simResult && exportJSON(simResult)} disabled={!simResult}
                    className="btn-ghost flex-1 justify-center text-xs py-2 disabled:opacity-40">
                    <Download size={12}/> Export JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {simResult ? (
              <>
                {/* Result banner */}
                <div className="dark-card p-5" style={{
                  border:`1px solid ${results.goal_achievable?'rgba(16,185,129,0.35)':'rgba(244,63,94,0.35)'}`,
                  background:results.goal_achievable?'rgba(16,185,129,0.04)':'rgba(244,63,94,0.04)',
                }}>
                  <div className="flex items-center gap-2 mb-4">
                    {results.goal_achievable
                      ? <CheckCircle2 size={18} style={{ color:'#10b981' }}/>
                      : <XCircle      size={18} style={{ color:'#f43f5e' }}/>}
                    <h3 className="font-display font-semibold" style={{ color:results.goal_achievable?'#10b981':'#f43f5e' }}>
                      {results.goal_achievable ? 'Goal Is Achievable!' : 'Goal Not Achievable with Current Parameters'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    <StatBlock label="Projected Value"          value={fmtK(results.projected_value)}         color="var(--text-primary)"    sub={`Nominal value in ${results.months_simulated ? Math.round(results.months_simulated/12) : '?'} yrs`}/>
                    <StatBlock label="Real Value (today's $)"   value={fmtK(results.projected_value_real)}    color="var(--purple)"          sub={`Inflation-adjusted at ${results.inflation_rate}%`}/>
                    <StatBlock label="Total Gains"              value={`+${fmtK(results.total_gains)}`}       color="#10b981"                sub="From compound returns"/>
                    <StatBlock label="Total Contributions"      value={fmtK(results.total_contributions)}     color="var(--text-secondary)"  sub="Your actual SIP payments"/>
                    <StatBlock label="Monthly SIP Needed"       value={fmt(results.monthly_required_to_meet)} color="var(--purple)"          sub="To hit target exactly"/>
                    {results.years_to_goal && (
                      <StatBlock label="Years to Goal"          value={`${results.years_to_goal} yrs`}        color="#10b981"                sub="When target is first hit"/>
                    )}
                  </div>

                  {/* Return vs inflation warning */}
                  {Number(simForm.inflation_rate) >= Number(simForm.annual_return_rate) && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg"
                      style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)' }}>
                      <AlertTriangle size={13} style={{ color:'#f59e0b', flexShrink:0 }}/>
                      <p className="text-xs" style={{ color:'#fbbf24' }}>
                        Inflation rate ≥ return rate — real purchasing power will decrease over time.
                      </p>
                    </div>
                  )}
                </div>

                {/* Growth chart */}
                {simChartData.length > 0 && (
                  <div className="dark-card p-5">
                    <h3 className="font-display font-semibold mb-1" style={{ color:'var(--text-primary)' }}>
                      Portfolio Value Projection
                    </h3>
                    <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>
                      Nominal value (purple) vs cumulative contributions (cyan) vs gains (green)
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={simChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,47,71,0.8)"/>
                        <XAxis dataKey="year" tick={{ fontSize:11, fill:'#475569' }} tickLine={false} axisLine={false}/>
                        <YAxis tickFormatter={fmtK} tick={{ fontSize:11, fill:'#475569' }} tickLine={false} axisLine={false} width={60}/>
                        <Tooltip content={<DarkTooltip/>}/>
                        <Legend wrapperStyle={{ fontSize:'11px', color:'#64748b' }}/>
                        <ReferenceLine y={goal.target_amount} stroke="#f59e0b" strokeDasharray="4 4"
                          label={{ value:'Target', position:'insideTopRight', fill:'#f59e0b', fontSize:10 }}/>
                        <Line type="monotone" dataKey="Portfolio Value"  stroke="#a855f7" strokeWidth={2.5} dot={false}/>
                        <Line type="monotone" dataKey="Contributions"    stroke="#06b6d4" strokeWidth={1.5} dot={false} strokeDasharray="5 3"/>
                        <Line type="monotone" dataKey="Gains"            stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="3 3"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Raw JSON */}
                <div className="dark-card overflow-hidden">
                  <button onClick={() => setShowJson(!showJson)}
                    className="w-full flex items-center justify-between px-5 py-3.5 transition-colors">
                    <span className="text-sm font-medium" style={{ color:'var(--text-secondary)' }}>
                      View Raw JSON Output
                    </span>
                    {showJson ? <ChevronUp size={14} style={{ color:'var(--text-muted)' }}/> : <ChevronDown size={14} style={{ color:'var(--text-muted)' }}/>}
                  </button>
                  {showJson && (
                    <pre className="text-xs p-4 overflow-x-auto max-h-64 font-mono"
                      style={{ background:'var(--bg-surface)', color:'#94a3b8', borderTop:'1px solid var(--bg-border)' }}>
                      {JSON.stringify(simResult.results, null, 2)}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="dark-card p-12 flex flex-col items-center text-center">
                <TrendingUp size={36} className="mb-4" style={{ color:'var(--purple)', opacity:0.4 }}/>
                <p className="font-display font-semibold text-lg mb-2" style={{ color:'var(--text-primary)' }}>
                  Ready to simulate
                </p>
                <p className="text-sm max-w-xs" style={{ color:'var(--text-secondary)' }}>
                  Set your expected return rate and click <strong style={{ color:'var(--purple)' }}>Run Simulation</strong> to see how your goal grows with compound interest.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── WHAT-IF TAB ── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'whatif' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="dark-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <GitCompare size={16} style={{ color:'var(--purple)' }}/>
                <h2 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>What-If Analysis</h2>
              </div>
              <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>
                Compare your current plan against a changed scenario side-by-side.
              </p>

              {/* Base (current plan) */}
              <div className="p-4 rounded-xl space-y-4 mb-4" style={{ background:'var(--bg-surface)', border:'1px solid var(--bg-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color:'var(--text-muted)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background:'#64748b' }}/>
                  Current Plan (base)
                </p>
                <SliderInput label="Base Annual Return" name="base_annual_return" value={wfForm.base_annual_return}
                  onChange={handleWf} min={0} max={25} step={0.5} unit="%"/>
                {wfErrors.base_annual_return && <p className="text-xs" style={{ color:'#fb7185' }}>{wfErrors.base_annual_return}</p>}
                <SliderInput label="Base Inflation Rate" name="base_inflation" value={wfForm.base_inflation}
                  onChange={handleWf} min={0} max={15} step={0.5} unit="%"/>
              </div>

              {/* What-If scenario */}
              <div className="p-4 rounded-xl space-y-4" style={{ background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color:'var(--purple)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background:'var(--purple)' }}/>
                  What-If Scenario (changes)
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium" style={{ color:'var(--text-secondary)' }}>Extra Monthly (+$)</label>
                    <span className="text-xs font-bold font-num px-2 py-0.5 rounded-lg"
                      style={{ background:'rgba(168,85,247,0.15)', color:'var(--purple)' }}>
                      +${wfForm.whatif_extra_monthly}/mo
                    </span>
                  </div>
                  <input type="range" name="whatif_extra_monthly" min={0} max={10000} step={100}
                    value={wfForm.whatif_extra_monthly} onChange={handleWf}
                    className="w-full" style={{ accentColor:'var(--purple)' }}/>
                  <div className="flex justify-between text-xs mt-1" style={{ color:'var(--text-muted)' }}>
                    <span>$0</span><span>$10,000/mo</span>
                  </div>
                  {wfErrors.whatif_extra_monthly && <p className="text-xs mt-1" style={{ color:'#fb7185' }}>{wfErrors.whatif_extra_monthly}</p>}
                </div>

                <NumInput label="New Annual Return (% — optional)" name="whatif_annual_return"
                  value={wfForm.whatif_annual_return} onChange={handleWf}
                  min={0} max={50} suffix="%" placeholder={`Same as base (${wfForm.base_annual_return}%)`}
                  error={wfErrors.whatif_annual_return}/>

                <NumInput label="Retire Earlier / Later (years — optional)" name="whatif_sim_years"
                  value={wfForm.whatif_sim_years} onChange={handleWf}
                  min={1} max={50} placeholder="Auto from goal target date"/>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color:'var(--text-secondary)' }}>
                    New Target Date (optional)
                  </label>
                  <input type="date" name="whatif_target_date" value={wfForm.whatif_target_date}
                    onChange={handleWf} className="dark-input text-sm py-2"/>
                </div>
              </div>

              {wfError && (
                <div className="mt-3 p-3 rounded-xl flex items-start gap-2"
                  style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)' }}>
                  <AlertTriangle size={13} style={{ color:'#fb7185', flexShrink:0, marginTop:1 }}/>
                  <p className="text-xs" style={{ color:'#fb7185' }}>{wfError}</p>
                </div>
              )}
              {wfSaveOk && (
                <p className="mt-3 text-xs p-2 rounded-lg flex items-center gap-1"
                  style={{ background:'rgba(16,185,129,0.1)', color:'#34d399' }}>
                  <CheckCircle2 size={12}/> Scenario saved!
                </p>
              )}

              <div className="mt-4 space-y-2">
                <button onClick={() => runWhatIf(false)} disabled={wfLoading}
                  className="btn-purple w-full justify-center text-sm py-2.5">
                  {wfLoading ? <Loader2 size={14} className="animate-spin"/> : <GitCompare size={14}/>}
                  {wfLoading ? 'Comparing…' : 'Run What-If Comparison'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => runWhatIf(true)} disabled={wfLoading || !wfResult}
                    className="btn-ghost flex-1 justify-center text-xs py-2 disabled:opacity-40">
                    <Save size={12}/> Save Scenario
                  </button>
                  <button onClick={() => wfResult && exportJSON(wfResult)} disabled={!wfResult}
                    className="btn-ghost flex-1 justify-center text-xs py-2 disabled:opacity-40">
                    <Download size={12}/> Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {wfResult ? (
              <>
                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key:'base_scenario',   title:'Current Plan', color:'#64748b', border:'rgba(100,116,139,0.3)' },
                    { key:'whatif_scenario', title:'What-If',      color:'var(--purple)', border:'rgba(168,85,247,0.35)' },
                  ].map(col => {
                    const d = wfResult[col.key] || {}
                    return (
                      <div key={col.key} className="dark-card p-4"
                        style={{ border:`1px solid ${col.border}` }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5"
                          style={{ color:col.color }}>
                          <span className="w-2 h-2 rounded-full" style={{ background:col.color }}/>
                          {col.title}
                        </p>
                        {[
                          { label:'Projected Value',     val:fmtK(d.projected_value),           color:'var(--text-primary)' },
                          { label:'Real Value (today $)', val:fmtK(d.projected_value_real),      color:col.color },
                          { label:'Total Contributions', val:fmtK(d.total_contributions),        color:'var(--text-secondary)' },
                          { label:'Total Gains',         val:`+${fmtK(d.total_gains)}`,          color:'#10b981' },
                          { label:'Years to Goal',       val:d.years_to_goal ? `${d.years_to_goal} yrs` : 'Not achieved', color:'var(--text-secondary)' },
                          { label:'Monthly SIP Needed',  val:fmt(d.monthly_required_to_meet),   color:col.color },
                        ].map(row => (
                          <div key={row.label} className="flex justify-between py-1.5"
                            style={{ borderBottom:'1px solid rgba(37,47,71,0.5)' }}>
                            <span className="text-xs" style={{ color:'var(--text-muted)' }}>{row.label}</span>
                            <span className="font-num font-semibold text-xs" style={{ color:row.color }}>{row.val}</span>
                          </div>
                        ))}
                        <span className={`mt-2 inline-block text-xs font-semibold ${d.goal_achievable?'badge-green':'badge-red'}`}>
                          {d.goal_achievable ? '✓ Achievable' : '✗ Shortfall'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Impact summary */}
                <div className="dark-card p-4" style={{ border:'1px solid rgba(168,85,247,0.2)', background:'rgba(168,85,247,0.04)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color:'var(--purple)' }}>
                    Impact of the What-If Scenario
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Extra Value',
                        val:   `${(wfResult.comparison?.projected_value_diff||0)>=0?'+':''}${fmtK(wfResult.comparison?.projected_value_diff||0)}`,
                        color: (wfResult.comparison?.projected_value_diff||0)>=0?'#10b981':'#f43f5e',
                      },
                      {
                        label: '% Increase',
                        val:   `${((wfResult.comparison?.projected_value_diff_pct||0)>=0?'+':'')}${(wfResult.comparison?.projected_value_diff_pct||0).toFixed(1)}%`,
                        color: '#10b981',
                      },
                      {
                        label: 'Years Saved',
                        val:   wfResult.comparison?.years_saved != null ? `${wfResult.comparison.years_saved} yrs` : 'N/A',
                        color: (wfResult.comparison?.years_saved||0)>0?'#10b981':'var(--text-secondary)',
                      },
                      {
                        label: 'Extra Monthly',
                        val:   `+${fmt(wfResult.comparison?.extra_monthly||0)}`,
                        color: 'var(--purple)',
                      },
                    ].map(item => (
                      <StatBlock key={item.label} label={item.label} value={item.val} color={item.color}/>
                    ))}
                  </div>
                </div>

                {/* Comparison chart */}
                {wfChartData.length > 0 && (
                  <div className="dark-card p-5">
                    <h3 className="font-display font-semibold mb-1" style={{ color:'var(--text-primary)' }}>
                      Current Plan vs What-If — Side by Side
                    </h3>
                    <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>
                      Dashed gray = current plan &nbsp;·&nbsp; Solid purple = what-if scenario
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={wfChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,47,71,0.8)"/>
                        <XAxis dataKey="year" tick={{ fontSize:11, fill:'#475569' }} tickLine={false} axisLine={false}/>
                        <YAxis tickFormatter={fmtK} tick={{ fontSize:11, fill:'#475569' }} tickLine={false} axisLine={false} width={60}/>
                        <Tooltip content={<DarkTooltip/>}/>
                        <Legend wrapperStyle={{ fontSize:'11px', color:'#64748b' }}/>
                        <ReferenceLine y={goal.target_amount} stroke="#f59e0b" strokeDasharray="4 4"
                          label={{ value:'Target', position:'insideTopRight', fill:'#f59e0b', fontSize:10 }}/>
                        <Line type="monotone" dataKey="Current Plan" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 3"/>
                        <Line type="monotone" dataKey="What-If"      stroke="#a855f7" strokeWidth={2.5} dot={false}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="dark-card p-12 flex flex-col items-center text-center">
                <GitCompare size={36} className="mb-4" style={{ color:'var(--purple)', opacity:0.4 }}/>
                <p className="font-display font-semibold text-lg mb-2" style={{ color:'var(--text-primary)' }}>
                  Ready to compare
                </p>
                <p className="text-sm max-w-xs" style={{ color:'var(--text-secondary)' }}>
                  Set what-if parameters and click <strong style={{ color:'var(--purple)' }}>Run What-If Comparison</strong> to see the impact.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── CONTRIBUTIONS TAB ── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'contributions' && contribData && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label:'Daily',    val:fmt(contribData.daily),      color:'#06b6d4', sub:'per day' },
              { label:'Weekly',   val:fmt(contribData.weekly_amt), color:'var(--purple)', sub:'per week' },
              { label:'Monthly',  val:fmt(goal.monthly_contribution), color:'#10b981', sub:'per month (SIP)' },
              { label:'Annual',   val:fmt(contribData.annual),     color:'#f59e0b', sub:'per year' },
            ].map(c => (
              <div key={c.label} className="dark-card p-4">
                <p className="text-xs mb-1" style={{ color:'var(--text-muted)' }}>{c.label}</p>
                <p className="font-num font-bold text-xl" style={{ color:c.color }}>{c.val}</p>
                <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{c.sub}</p>
              </div>
            ))}
          </div>

          {contribData.months_to_goal && (
            <div className="dark-card p-4 flex items-start gap-3"
              style={{ border:'1px solid rgba(168,85,247,0.2)', background:'rgba(168,85,247,0.04)' }}>
              <Calendar size={18} style={{ color:'var(--purple)', flexShrink:0, marginTop:1 }}/>
              <p className="text-sm" style={{ color:'var(--text-primary)' }}>
                At {fmt(goal.monthly_contribution)}/month, you will reach your target in approximately{' '}
                <strong style={{ color:'var(--purple)' }}>{contribData.months_to_goal} months</strong>
                {contribData.months_to_goal >= 12 && (
                  <span style={{ color:'var(--text-secondary)' }}>
                    {' '}({Math.floor(contribData.months_to_goal/12)} yr{Math.floor(contribData.months_to_goal/12)>1?'s':''} {contribData.months_to_goal%12} mo)
                  </span>
                )}
                {' '}<span style={{ color:'var(--text-muted)' }}>(without investment returns)</span>
              </p>
            </div>
          )}

          {/* Chart */}
          <div className="dark-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid var(--bg-border)' }}>
              <h3 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>Contribution Schedule</h3>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background:'var(--bg-surface)' }}>
                {['weekly','monthly'].map(f => (
                  <button key={f} onClick={() => setContribFreq(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                    style={contribFreq===f
                      ? { background:'var(--bg-card)', color:'var(--purple)', border:'1px solid rgba(168,85,247,0.3)' }
                      : { color:'var(--text-muted)' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={contribData[contribFreq]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,47,71,0.8)"/>
                  <XAxis dataKey="period" tick={{ fontSize:10, fill:'#475569' }} tickLine={false} axisLine={false}
                    interval={contribFreq==='weekly' ? 3 : 2}/>
                  <YAxis tickFormatter={fmtK} tick={{ fontSize:11, fill:'#475569' }} tickLine={false} axisLine={false} width={55}/>
                  <Tooltip content={<DarkTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize:'11px', color:'#64748b' }}/>
                  <ReferenceLine y={goal.target_amount} stroke="#f59e0b" strokeDasharray="4 4"
                    label={{ value:'Target', position:'insideTopRight', fill:'#f59e0b', fontSize:10 }}/>
                  <Line type="monotone" dataKey="cumulative" name="Cumulative Savings" stroke="#a855f7" strokeWidth={2.5} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── SAVED SIMULATIONS TAB ── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedSims.length === 0 ? (
            <div className="dark-card p-12 text-center">
              <p className="font-semibold" style={{ color:'var(--text-primary)' }}>No saved scenarios yet</p>
              <p className="text-sm mt-1" style={{ color:'var(--text-secondary)' }}>Run a simulation and click Save Scenario to store it here.</p>
            </div>
          ) : (
            savedSims.map(sim => (
              <div key={sim.id} className="dark-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold" style={{ color:'var(--text-primary)' }}>{sim.scenario_name}</h3>
                    <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                      Saved {sim.created_at ? new Date(sim.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}
                    </p>
                  </div>
                  <button onClick={() => exportJSON(sim)} className="btn-ghost text-xs py-1.5 px-3">
                    <Download size={12}/> Export
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sim.assumptions && [
                    { label:'Return Rate',  val:`${sim.assumptions.annual_return_rate}%` },
                    { label:'Inflation',    val:`${sim.assumptions.inflation_rate}%` },
                    { label:'Extra Monthly', val:sim.assumptions.additional_monthly ? fmt(sim.assumptions.additional_monthly) : '—' },
                    { label:'Period',       val:sim.assumptions.simulation_years ? `${sim.assumptions.simulation_years} yrs` : 'Auto' },
                  ].map(row => (
                    <div key={row.label} className="p-3 rounded-xl" style={{ background:'var(--bg-surface)' }}>
                      <p className="text-xs mb-1" style={{ color:'var(--text-muted)' }}>{row.label}</p>
                      <p className="font-num font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{row.val}</p>
                    </div>
                  ))}
                </div>
                {sim.results?.projected_value && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`badge-${sim.results.goal_achievable?'green':'red'} text-xs`}>
                      {sim.results.goal_achievable ? '✓ Goal Achievable' : '✗ Shortfall'}
                    </span>
                    <span className="text-xs" style={{ color:'var(--text-secondary)' }}>
                      Projected: <strong style={{ color:'var(--purple)' }}>{fmtK(sim.results.projected_value)}</strong>
                    </span>
                    {sim.results.years_to_goal && (
                      <span className="text-xs" style={{ color:'var(--text-secondary)' }}>
                        · Reaches goal in <strong>{sim.results.years_to_goal} yrs</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <p className="text-center text-xs mt-6 pb-2" style={{ color:'var(--text-muted)' }}>
        © 2026 WealthApp. All rights reserved.
      </p>
    </div>
  )
}
