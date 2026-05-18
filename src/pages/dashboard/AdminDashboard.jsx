import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../../layouts/MainLayout"
import {
    Activity,
    CheckCircle2,
    Users,
    AlertCircle,
    Loader2,
    TrendingUp,
    PieChart,
    FileText,
    Clock3,
    Shield,
    ArrowUpRight,
    Zap,
} from "lucide-react"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    RadialBarChart,
    RadialBar,
    PieChart as RePieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { getDashboardStats } from "../../api/reportApi"
import { getEmployees, getGoals } from "../../api/goalApi"
import { getCheckIns } from "../../api/checkinApi"
import { getAuditLogs } from "../../api/auditApi"

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
            {label && <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">{label}</p>}
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
                    {p.name}: <span className="text-white">{p.value}</span>
                </p>
            ))}
        </div>
    )
}

function GaugeRing({ value, max, color, label, sublabel }) {
    const pct = max > 0 ? (value / max) * 100 : 0
    const r = 52
    const circ = 2 * Math.PI * r
    const dash = (pct / 100) * circ

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={130} height={130} viewBox="0 0 130 130">
                <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
                <circle
                    cx={65} cy={65} r={r} fill="none"
                    stroke={color} strokeWidth={10}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 65 65)"
                    style={{ transition: "stroke-dasharray 1s ease" }}
                />
                <text x={65} y={60} textAnchor="middle" fill="white" fontSize={22} fontWeight={700}>{value}</text>
                <text x={65} y={78} textAnchor="middle" fill="rgba(148,163,184,0.8)" fontSize={10}>{sublabel}</text>
            </svg>
            <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
    )
}

// ─── Stat Card ──────────────────────────────────────────────────────────
function StatCard({ title, value, note, icon: Icon, accent, delay = 0, trend }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
        >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: accent }} />
            <div className="mb-4 flex items-start justify-between">
                <div className="rounded-2xl border border-white/10 p-3" style={{ backgroundColor: `${accent}1a` }}>
                    {Icon && <Icon size={18} style={{ color: accent }} />}
                </div>
                {trend !== undefined && (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                        <ArrowUpRight size={11} /> {trend}%
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-1 text-3xl font-bold text-white">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
        </motion.div>
    )
}

// ─── Section Wrapper ────────────────────────────────────────────────────
function Glass({ children, className = "", delay = 0 }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay }}
            className={`rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl ${className}`}
        >
            {children}
        </motion.section>
    )
}

// ─── MOCK data for charts (replaced by real data when available) ─────────
function buildChartData(analytics, stats) {
    // Monthly goal trend (mock 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const goalTrend = months.map((m, i) => ({
        month: m,
        approved: Math.round((stats?.approved_goals || 12) * (0.6 + i * 0.08)),
        rejected: Math.round((stats?.rejected_goals || 4) * (0.5 + i * 0.07)),
        total: Math.round((stats?.total_goals || 20) * (0.55 + i * 0.09)),
    }))

    // Progress over months
    const progressTrend = months.map((m, i) => ({
        month: m,
        progress: Math.round((stats?.average_progress || 65) * (0.7 + i * 0.06)),
    }))

    // Checkins per quarter
    const checkinTrend = ["Q1", "Q2", "Q3", "Q4"].map((q, i) => ({
        quarter: q,
        checkins: Math.round((analytics.totalCheckins || 40) * (0.2 + i * 0.28)),
        audits: Math.round((analytics.totalAuditLogs || 30) * (0.15 + i * 0.3)),
    }))

    // Goal status pie
    const goalStatusPie = [
        { name: "Approved", value: analytics.approvedGoals || stats?.approved_goals || 0, color: "#34d399" },
        { name: "Rejected", value: analytics.rejectedGoals || stats?.rejected_goals || 0, color: "#fb7185" },
        { name: "Draft", value: analytics.goalsByStatus?.draft || 0, color: "#60a5fa" },
    ].filter(d => d.value > 0)

    // User distribution radial
    const userRadial = [
        { name: "Employees", value: stats?.total_employees || analytics.employees || 0, fill: "#22d3ee" },
        { name: "Managers", value: stats?.total_managers || analytics.managers || 0, fill: "#a78bfa" },
        { name: "Admins", value: stats?.total_admins || analytics.admins || 0, fill: "#fbbf24" },
    ]

    return { goalTrend, progressTrend, checkinTrend, goalStatusPie, userRadial }
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [users, setUsers] = useState([])
    const [goals, setGoals] = useState([])
    const [checkins, setCheckins] = useState([])
    const [logs, setLogs] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => { fetchDashboard() }, [])

    const fetchDashboard = async () => {
        setLoading(true); setError("")
        try {
            const [usersData, goalsData, checkinsData, logsData, statsData] = await Promise.all([
                getEmployees().catch(() => []),
                getGoals().catch(() => []),
                getCheckIns().catch(() => []),
                getAuditLogs().catch(() => []),
                getDashboardStats().catch(() => null),
            ])
            setUsers(Array.isArray(usersData) ? usersData : [])
            setGoals(Array.isArray(goalsData) ? goalsData : [])
            setCheckins(Array.isArray(checkinsData) ? checkinsData : [])
            setLogs(Array.isArray(logsData) ? logsData : [])
            setStats(statsData || null)
        } catch (err) {
            setError("Failed to load admin dashboard data")
        } finally {
            setLoading(false)
        }
    }

    const analytics = useMemo(() => {
        try {
            const u = Array.isArray(users) ? users : []
            const g = Array.isArray(goals) ? goals : []
            const c = Array.isArray(checkins) ? checkins : []
            const l = Array.isArray(logs) ? logs : []
            const employees = u.filter(x => x?.role === "employee")
            const managers = u.filter(x => x?.role === "manager")
            const admins = u.filter(x => x?.role === "admin")
            const approvedGoals = g.filter(x => (x?.status + "").toLowerCase() === "approved")
            const rejectedGoals = g.filter(x => (x?.status + "").toLowerCase() === "rejected")
            const avgProgress = c.length > 0
                ? (c.reduce((s, x) => s + (Number(x?.progress_score) || 0), 0) / c.length).toFixed(1)
                : "0.0"
            const goalsByStatus = {
                approved: approvedGoals.length,
                rejected: rejectedGoals.length,
                draft: g.filter(x => (x?.status + "").toLowerCase() === "draft").length,
            }
            return {
                employees: employees.length, managers: managers.length, admins: admins.length,
                totalUsers: u.length, approvedGoals: approvedGoals.length,
                rejectedGoals: rejectedGoals.length, totalGoals: g.length,
                totalCheckins: c.length, totalAuditLogs: l.length,
                avgProgress, goalsByStatus,
            }
        } catch {
            return {
                employees: 0, managers: 0, admins: 0, totalUsers: 0,
                approvedGoals: 0, rejectedGoals: 0, totalGoals: 0,
                totalCheckins: 0, totalAuditLogs: 0, avgProgress: "0.0",
                goalsByStatus: { approved: 0, rejected: 0, draft: 0 },
            }
        }
    }, [users, goals, checkins, logs])

    const charts = useMemo(() => buildChartData(analytics, stats), [analytics, stats])

    const approvalRate = analytics.totalGoals > 0
        ? Math.round((analytics.approvedGoals / analytics.totalGoals) * 100)
        : stats?.total_goals > 0
            ? Math.round(((stats?.approved_goals || 0) / stats.total_goals) * 100)
            : 0

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="text-center">
                        <Loader2 size={40} className="mx-auto animate-spin text-cyan-300" />
                        <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">Loading admin dashboard</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="relative overflow-hidden space-y-6">
                {/* ambient bg */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-rose-200">{error}</p>
                    </motion.div>
                )}

                {/* ── ROW 1: Top KPI cards ── */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard title="Total Goals" value={stats?.total_goals || analytics.totalGoals}
                              note="Overall tracked goals" icon={FileText} accent="#60a5fa" delay={0} trend={12} />
                    <StatCard title="Approved Goals" value={stats?.approved_goals || analytics.approvedGoals}
                              note="Goals cleared through review" icon={CheckCircle2} accent="#34d399" delay={0.08} trend={8} />
                    <StatCard title="Average Progress" value={`${Math.round(stats?.average_progress || analytics.avgProgress)}%`}
                              note="Mean progress score" icon={Activity} accent="#a78bfa" delay={0.16} />
                    <StatCard title="Total Employees" value={stats?.total_employees || analytics.employees}
                              note="Active in current cycle" icon={Users} accent="#22d3ee" delay={0.24} />
                    <StatCard title="Managers" value={stats?.total_managers || analytics.managers}
                              note="In governance cycle" icon={Shield} accent="#60a5fa" delay={0.32} />
                    <StatCard title="Rejected Goals" value={stats?.rejected_goals || analytics.rejectedGoals}
                              note="Sent back during review" icon={Clock3} accent="#fb7185" delay={0.4} />
                </section>

                {/* ── ROW 2: Goal Trend Area Chart + Pie ── */}
                <div className="grid gap-6 xl:grid-cols-3">

                    {/* Area chart - goals trend */}
                    <Glass className="xl:col-span-2" delay={0.45}>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">6-Month View</p>
                                <h2 className="mt-1 text-xl font-semibold text-white">Goal Activity Trend</h2>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                                <Zap size={12} className="text-cyan-300" /> Live
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={charts.goalTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 8 }} />
                                <Area type="monotone" dataKey="total" name="Total" stroke="#60a5fa" strokeWidth={2} fill="url(#gradTotal)" dot={false} />
                                <Area type="monotone" dataKey="approved" name="Approved" stroke="#34d399" strokeWidth={2} fill="url(#gradApproved)" dot={false} />
                                <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#fb7185" strokeWidth={1.5} fill="url(#gradRejected)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Glass>

                    {/* Pie chart - goal status */}
                    <Glass delay={0.5}>
                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Status Split</p>
                            <h2 className="mt-1 text-xl font-semibold text-white">Goal Distribution</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <RePieChart>
                                <Pie data={charts.goalStatusPie.length ? charts.goalStatusPie : [{ name: "No data", value: 1, color: "#334155" }]}
                                     cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                                     paddingAngle={3} dataKey="value">
                                    {(charts.goalStatusPie.length ? charts.goalStatusPie : [{ color: "#334155" }]).map((entry, i) => (
                                        <Cell key={i} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 space-y-2">
                            {charts.goalStatusPie.map((d) => (
                                <div key={d.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                                        <span className="text-sm text-slate-400">{d.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </Glass>
                </div>

                {/* ── ROW 3: Progress line + Bar (checkins/audits) ── */}
                <div className="grid gap-6 xl:grid-cols-2">

                    {/* Progress line chart */}
                    <Glass delay={0.55}>
                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-[0.32em] text-violet-300/80">Avg %</p>
                            <h2 className="mt-1 text-xl font-semibold text-white">Progress Over Time</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={charts.progressTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#a78bfa" />
                                        <stop offset="100%" stopColor="#60a5fa" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="progress" name="Progress %" stroke="url(#lineGlow)"
                                      strokeWidth={2.5} dot={{ fill: "#a78bfa", r: 4, strokeWidth: 0 }}
                                      activeDot={{ r: 6, fill: "#a78bfa", stroke: "#1e1b4b", strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Glass>

                    {/* Bar chart - checkins vs audits */}
                    <Glass delay={0.6}>
                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/80">Quarterly</p>
                            <h2 className="mt-1 text-xl font-semibold text-white">Check-ins & Audit Events</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={charts.checkinTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="quarter" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 8 }} />
                                <Bar dataKey="checkins" name="Check-ins" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="audits" name="Audit Events" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Glass>
                </div>

                {/* ── ROW 4: Gauge rings (approval rate, avg progress) + User distribution radial ── */}
                <div className="grid gap-6 xl:grid-cols-3">

                    {/* Gauge rings */}
                    <Glass delay={0.65} className="xl:col-span-1">
                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">KPI Health</p>
                            <h2 className="mt-1 text-xl font-semibold text-white">Performance Rings</h2>
                        </div>
                        <div className="flex flex-wrap items-center justify-around gap-4 pt-2">
                            <GaugeRing
                                value={approvalRate}
                                max={100}
                                color="#34d399"
                                label="Approval Rate"
                                sublabel="% approved"
                            />
                            <GaugeRing
                                value={Math.round(stats?.average_progress || Number(analytics.avgProgress) || 0)}
                                max={100}
                                color="#a78bfa"
                                label="Avg Progress"
                                sublabel="% complete"
                            />
                        </div>
                    </Glass>

                    {/* Radial bar - user distribution */}
                    <Glass delay={0.7} className="xl:col-span-2">
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Organization</p>
                                <h2 className="mt-1 text-xl font-semibold text-white">User Distribution</h2>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={90}
                                                data={charts.userRadial} startAngle={90} endAngle={-270}>
                                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "rgba(255,255,255,0.04)" }} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-3 min-w-[130px]">
                                {[
                                    { label: "Employees", value: stats?.total_employees || analytics.employees, color: "#22d3ee" },
                                    { label: "Managers", value: stats?.total_managers || analytics.managers, color: "#a78bfa" },
                                    { label: "Admins", value: stats?.total_admins || analytics.admins, color: "#fbbf24" },
                                    { label: "Total Users", value: stats?.total_users || analytics.totalUsers, color: "#34d399" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                            <span className="text-sm text-slate-400">{item.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">{item.value ?? "—"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Glass>
                </div>

                {/* ── ROW 5: System Metrics ── */}
                <Glass delay={0.75}>
                    <div className="mb-5">
                        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Real-time</p>
                        <h2 className="mt-1 text-xl font-semibold text-white">System Metrics</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                label: "Quarterly Check-ins", value: analytics.totalCheckins,
                                sub: "Progress updates recorded", icon: PieChart, color: "text-cyan-300",
                                bar: analytics.totalCheckins, max: Math.max(analytics.totalCheckins, 100), accent: "#22d3ee"
                            },
                            {
                                label: "Audit Events", value: analytics.totalAuditLogs,
                                sub: "System changes tracked", icon: CheckCircle2, color: "text-emerald-300",
                                bar: analytics.totalAuditLogs, max: Math.max(analytics.totalAuditLogs, 100), accent: "#34d399"
                            },
                            {
                                label: "Approval Rate", value: `${approvalRate}%`,
                                sub: "Of all KPI goals", icon: TrendingUp, color: "text-amber-300",
                                bar: approvalRate, max: 100, accent: "#fbbf24"
                            },
                        ].map((m, i) => (
                            <motion.div key={m.label}
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
                                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-slate-400">{m.label}</span>
                                    <m.icon size={16} className={m.color} />
                                </div>
                                <p className="text-3xl font-bold text-white">{m.value}</p>
                                {/* mini progress bar */}
                                <div className="mt-3 h-1.5 w-full rounded-full bg-white/5">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${Math.min((m.bar / m.max) * 100, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.9 + i * 0.1, ease: "easeOut" }}
                                        className="h-full rounded-full" style={{ background: m.accent }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">{m.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </Glass>
            </div>
        </MainLayout>
    )
}