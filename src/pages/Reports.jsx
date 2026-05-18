import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import {
    Activity, AlertCircle, BarChart3, CheckCircle2, Clock3,
    Download, FileSpreadsheet, FileText, Shield, TrendingUp,
    Users, Zap, ArrowUpRight, Eye, Filter, RefreshCw,
    ChevronRight, BookOpen, ShieldCheck,
} from "lucide-react"
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ReferenceLine,
} from "recharts"
import {
    downloadCSVReport,
    downloadExcelReport,
    getDashboardStats,
} from "../api/reportApi"
import { getAuditLogs } from "../api/auditApi"
import { getApiErrorMessage } from "../api/config"

// ─── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
            {label && <p className="mb-1.5 text-[10px] uppercase tracking-widest text-slate-500">{label}</p>}
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
                    {p.name}: <span className="text-white">{p.value}{typeof p.value === "number" && p.name?.includes("%") ? "%" : ""}</span>
                </p>
            ))}
        </div>
    )
}

// ─── Glass wrapper ────────────────────────────────────────────
function Glass({ children, className = "", delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay }}
            className={`relative rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl overflow-hidden ${className}`}
        >
            {children}
        </motion.div>
    )
}

// ─── Mini stat pill ───────────────────────────────────────────
function StatPill({ label, value, color }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5">
            <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-sm text-slate-400">{label}</span>
            </div>
            <span className="text-sm font-bold text-white">{value ?? "—"}</span>
        </div>
    )
}

// ─── Audit log action badge ───────────────────────────────────
function ActionBadge({ action }) {
    const a = (action || "").toLowerCase()
    if (a.includes("creat") || a.includes("add")) return (
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">{action}</span>
    )
    if (a.includes("approv")) return (
        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">{action}</span>
    )
    if (a.includes("reject") || a.includes("delet") || a.includes("remov")) return (
        <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">{action}</span>
    )
    if (a.includes("updat") || a.includes("edit") || a.includes("modif")) return (
        <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">{action}</span>
    )
    return (
        <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">{action}</span>
    )
}

// ─── Mock chart data builder ──────────────────────────────────
function buildCharts(stats, logs) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const total = stats?.total_goals || 20
    const approved = stats?.approved_goals || 12
    const rejected = stats?.rejected_goals || 4

    const goalTrend = months.map((m, i) => ({
        month: m,
        approved: Math.round(approved * (0.55 + i * 0.09)),
        rejected: Math.round(rejected * (0.4 + i * 0.12)),
        pending: Math.round((total - approved - rejected) * (0.8 - i * 0.05)),
    }))

    const progressTrend = months.map((m, i) => ({
        month: m,
        avg: Math.round((stats?.average_progress || 68) * (0.65 + i * 0.07)),
        target: 100,
    }))

    const complianceRadar = [
        { metric: "Approval Rate", value: total > 0 ? Math.round((approved / total) * 100) : 0 },
        { metric: "Checkin Rate", value: stats?.total_checkins ? Math.min(Math.round((stats.total_checkins / total) * 80), 100) : 72 },
        { metric: "Avg Progress", value: Math.round(stats?.average_progress || 68) },
        { metric: "Goal Coverage", value: total > 0 ? Math.min(Math.round((total / (stats?.total_employees || 10)) * 10), 100) : 85 },
        { metric: "Audit Health", value: logs.length > 0 ? Math.min(logs.length * 3, 95) : 60 },
    ]

    const actionDist = (() => {
        const counts = {}
        logs.forEach(l => {
            const k = l.action || "Other"
            counts[k] = (counts[k] || 0) + 1
        })
        const colors = ["#22d3ee", "#34d399", "#a78bfa", "#fbbf24", "#fb7185", "#60a5fa"]
        return Object.entries(counts).slice(0, 6).map(([name, value], i) => ({
            name, value, color: colors[i % colors.length],
        }))
    })()

    const weeklyActivity = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => ({
        day: d,
        events: Math.round((logs.length || 15) * (0.1 + Math.random() * 0.25)),
    }))

    return { goalTrend, progressTrend, complianceRadar, actionDist, weeklyActivity }
}

// ─── Main Component ───────────────────────────────────────────
export default function Reports() {
    const [dashboardStats, setDashboardStats] = useState(null)
    const [auditLogs, setAuditLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [downloading, setDownloading] = useState(null)

    useEffect(() => { fetchReports() }, [])

    async function fetchReports() {
        try {
            setLoading(true); setError("")
            const [stats, logs] = await Promise.all([getDashboardStats(), getAuditLogs()])
            setDashboardStats(stats)
            setAuditLogs(Array.isArray(logs) ? logs : [])
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to load reports"))
        } finally {
            setLoading(false)
        }
    }

    async function handleDownload(type, fn) {
        setDownloading(type)
        try { await fn() } finally { setDownloading(null) }
    }

    const topLogs = useMemo(() =>
            [...auditLogs]
                .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                .slice(0, 10),
        [auditLogs]
    )

    const charts = useMemo(() => buildCharts(dashboardStats, auditLogs), [dashboardStats, auditLogs])

    const approvalRate = dashboardStats?.total_goals > 0
        ? Math.round((dashboardStats.approved_goals / dashboardStats.total_goals) * 100)
        : 0

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="text-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <RefreshCw size={36} className="text-cyan-400" />
                        </motion.div>
                        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Loading Reports</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="relative min-h-screen space-y-6 bg-[#020617] p-6 text-white">

                {/* ambient glows */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute -left-32 -top-20 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
                    <div className="absolute -right-20 top-32 h-96 w-96 rounded-full bg-violet-500/8 blur-3xl" />
                    <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-emerald-500/6 blur-3xl" />
                </div>

                {/* ── HERO HEADER ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[32px] border border-white/10 p-8 shadow-[0_40px_120px_rgba(2,6,23,0.7)]"
                    style={{
                        background: "radial-gradient(circle at top left, rgba(34,211,238,0.13), transparent 30%), linear-gradient(135deg, rgba(15,23,42,0.97), rgba(2,6,23,0.93))"
                    }}
                >
                    {/* decorative grid lines */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
                         style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            {/* quick stats row */}
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { label: "Total Goals", value: dashboardStats?.total_goals ?? "—", color: "#60a5fa" },
                                    { label: "Approved", value: dashboardStats?.approved_goals ?? "—", color: "#34d399" },
                                    { label: "Approval Rate", value: `${approvalRate}%`, color: "#a78bfa" },
                                    { label: "Avg Progress", value: `${Math.round(dashboardStats?.average_progress || 0)}%`, color: "#fbbf24" },
                                ].map((s) => (
                                    <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</p>
                                        <p className="mt-0.5 text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleDownload("csv", downloadCSVReport)}
                                disabled={downloading === "csv"}
                                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/18 disabled:opacity-50"
                            >
                                {downloading === "csv" ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleDownload("excel", downloadExcelReport)}
                                disabled={downloading === "excel"}
                                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/18 disabled:opacity-50"
                            >
                                {downloading === "excel" ? <RefreshCw size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
                                Export Excel
                            </button>
                        </div>
                    </div>
                </motion.section>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 flex items-center gap-3 text-rose-200">
                        <AlertCircle size={18} className="flex-shrink-0" /> {error}
                    </motion.div>
                )}



                {/* ── ROW 2: Progress Line + Action Distribution ── */}
                <div className="grid gap-6 xl:grid-cols-2">
                    <Glass delay={0.2}>
                        <div className="mb-5">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80">Average %</p>
                            <h2 className="mt-1 text-lg font-semibold text-white">Progress Over Time</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={190}>
                            <LineChart data={charts.progressTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="lGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#fbbf24" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={80} stroke="rgba(34,211,238,0.25)" strokeDasharray="4 4" label={{ value: "Target", fill: "#22d3ee", fontSize: 10 }} />
                                <Line type="monotone" dataKey="avg" name="Avg Progress %" stroke="url(#lGrad)"
                                      strokeWidth={2.5} dot={{ fill: "#fbbf24", r: 4, strokeWidth: 0 }}
                                      activeDot={{ r: 6, fill: "#fbbf24", stroke: "#0f172a", strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Glass>

                    {/* ── ROW 1: Goal Trend Area + Progress Line ── */}
                    <div className="grid gap-6 xl:grid-cols-2">
                        {/* Compliance Radar */}
                        <Glass className="xl:col-span-2" delay={0.15}>
                            <div className="mb-3">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-violet-300/80">Multi-Axis</p>
                                <h2 className="mt-1 text-lg font-semibold text-white">Compliance Radar</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={210}>
                                <RadarChart data={charts.complianceRadar}>
                                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#475569", fontSize: 9 }} />
                                    <Radar name="Score" dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.18} strokeWidth={2} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Glass>
                    </div>
                </div>

                {/* ── ROW 3: Report Cards ── */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Achievement Report */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/8 via-transparent to-transparent p-6"
                    >
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/8 blur-3xl" />
                        <div className="relative">
                            <div className="mb-4 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                                <FileSpreadsheet size={22} className="text-cyan-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white">Employee Achievement Report</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-400">
                                Export complete employee KPI achievement data including planned targets, actual achievement,
                                progress scores, governance status, quarterly check-ins, manager comments, and employee remarks.
                            </p>
                            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                                {["Goal-wise KPI tracking", "Quarterly achievement summary", "Planned vs actual comparison", "Governance workflow visibility"].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-slate-400">
                                        <CheckCircle2 size={12} className="text-cyan-400 flex-shrink-0" /> {f}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button onClick={() => handleDownload("csv", downloadCSVReport)} disabled={downloading === "csv"}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/22 disabled:opacity-50">
                                    {downloading === "csv" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />} CSV
                                </button>
                                <button onClick={() => handleDownload("excel", downloadExcelReport)} disabled={downloading === "excel"}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/15 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/22 disabled:opacity-50">
                                    {downloading === "excel" ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} Excel
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Governance Report */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-400/8 via-transparent to-transparent p-6"
                    >
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/8 blur-3xl" />
                        <div className="relative">
                            <div className="mb-4 inline-flex rounded-2xl border border-violet-400/20 bg-violet-400/10 p-3">
                                <BarChart3 size={22} className="text-violet-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white">Governance Summary Report</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-400">
                                Download governance-focused reporting datasets including approvals, pending reviews,
                                rejected goals, KPI compliance, audit activity, and managerial governance workflows.
                            </p>
                            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                                {["Approval workflow tracking", "Governance audit visibility", "KPI compliance monitoring", "Organization reporting exports"].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-slate-400">
                                        <CheckCircle2 size={12} className="text-violet-400 flex-shrink-0" /> {f}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button onClick={() => handleDownload("csv", downloadCSVReport)} disabled={downloading === "csv"}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-400/15 px-5 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-400/22 disabled:opacity-50">
                                    {downloading === "csv" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />} CSV
                                </button>
                                <button onClick={() => handleDownload("excel", downloadExcelReport)} disabled={downloading === "excel"}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/15 px-5 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-400/22 disabled:opacity-50">
                                    {downloading === "excel" ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} Excel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </MainLayout>
    )
}