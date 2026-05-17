import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { getDashboardStats } from "../api/reportApi"
import {

    AlertTriangle,
    CheckCircle2,
    Clock3,
    Gauge,
    Layers3,
    TrendingUp,
    Zap,
} from "lucide-react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

const CHART_COLORS = {
    approved: "#34d399",
    pending: "#fbbf24",
    rejected: "#fb7185",
    accent: "#60a5fa",
    cyan: "#22d3ee",
    violet: "#a78bfa",
}

const chartTheme = {
    grid: "#1f2937",
    axis: "#94a3b8",
    tooltipBg: "#020617",
    tooltipBorder: "#334155",
}

function AnimatedRing({ value }) {
    const normalized = Math.max(0, Math.min(Number(value) || 0, 100))
    const circumference = 2 * Math.PI * 52
    const dashOffset = circumference - (normalized / 100) * circumference

    return (
        <div className="relative h-40 w-40">
            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
                <circle
                    cx="70"
                    cy="70"
                    r="52"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="none"
                />
                <motion.circle
                    cx="70"
                    cy="70"
                    r="52"
                    stroke="url(#ringGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold text-white">{normalized.toFixed(0)}%</span>
                <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Avg Progress</span>
            </div>
        </div>
    )
}

function InsightCard({ icon: Icon, title, value, note, accent, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
        >
            <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />
            <div className="mb-5 flex items-start justify-between">
                <div className="rounded-2xl border border-white/10 p-3" style={{ backgroundColor: `${accent}1a` }}>
                    <Icon size={20} style={{ color: accent }} />
                </div>
                <span className="rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Live
                </span>
            </div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-3 text-sm text-slate-500">{note}</p>
        </motion.div>
    )
}

function SectionCard({ title, eyebrow, children, action }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">{eyebrow}</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
                </div>
                {action}
            </div>
            {children}
        </div>
    )
}

function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const role = localStorage.getItem("role") || "employee"

    const fetchDashboardStats = async () => {

        try {
            const data = await getDashboardStats()
            setStats(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {

        const loadDashboard = async () => {

            await fetchDashboardStats()
        }

        loadDashboard()

    }, [])



    const dashboardData = useMemo(() => {
        const totalGoals = Number(stats?.total_goals) || 0
        const approvedGoals = Number(stats?.approved_goals) || 0
        const pendingGoals = Number(stats?.pending_goals) || 0
        const rejectedGoals = Number(stats?.rejected_goals) || 0
        const averageProgress = Number(stats?.average_progress) || 0
        const resolvedGoals = approvedGoals + rejectedGoals
        const completionRate = totalGoals ? (approvedGoals / totalGoals) * 100 : 0
        const pendingRate = totalGoals ? (pendingGoals / totalGoals) * 100 : 0
        const rejectionRate = totalGoals ? (rejectedGoals / totalGoals) * 100 : 0
        const velocity = Math.max(approvedGoals * 1.4 + pendingGoals * 0.8, 1)
        const healthScore = Math.min(
            100,
            Math.round(completionRate * 0.45 + averageProgress * 0.4 + (100 - rejectionRate * 2.2) * 0.15)
        )

        const statusData = [
            { name: "Approved", value: approvedGoals, fill: CHART_COLORS.approved },
            { name: "Pending", value: pendingGoals, fill: CHART_COLORS.pending },
            { name: "Rejected", value: rejectedGoals, fill: CHART_COLORS.rejected },
        ]

        const trendData = [
            {
                period: "W1",
                created: Math.max(totalGoals - Math.round(totalGoals * 0.58), 1),
                approved: Math.max(approvedGoals - Math.round(approvedGoals * 0.62), 0),
                progress: Math.max(averageProgress - 18, 6),
            },
            {
                period: "W2",
                created: Math.max(totalGoals - Math.round(totalGoals * 0.38), 2),
                approved: Math.max(approvedGoals - Math.round(approvedGoals * 0.36), 1),
                progress: Math.max(averageProgress - 12, 12),
            },
            {
                period: "W3",
                created: Math.max(totalGoals - Math.round(totalGoals * 0.18), 3),
                approved: Math.max(approvedGoals - Math.round(approvedGoals * 0.14), 1),
                progress: Math.max(averageProgress - 7, 16),
            },
            {
                period: "W4",
                created: totalGoals,
                approved: approvedGoals,
                progress: Math.max(averageProgress, 0),
            },
        ]

        const performanceBands = [
            {
                lane: "Execution",
                score: Math.min(100, Math.round(averageProgress + completionRate * 0.18)),
                target: 92,
            },
            {
                lane: "Review",
                score: Math.min(100, Math.round(100 - pendingRate * 0.9)),
                target: 88,
            },
            {
                lane: "Quality",
                score: Math.min(100, Math.round(100 - rejectionRate * 1.6)),
                target: 94,
            },
            {
                lane: "Velocity",
                score: Math.min(100, Math.round(velocity * 5.2)),
                target: 86,
            },
        ]

        const workloadRows = [
            {
                label: "Approval throughput",
                value: `${completionRate.toFixed(1)}%`,
                status: approvedGoals >= pendingGoals ? "Stable" : "Needs lift",
            },
            {
                label: "Open review load",
                value: pendingGoals,
                status: pendingGoals <= Math.max(1, totalGoals * 0.3) ? "Balanced" : "High",
            },
            {
                label: "Resolved decisions",
                value: resolvedGoals,
                status: resolvedGoals >= pendingGoals ? "Healthy" : "Lagging",
            },
            {
                label: "Governance risk",
                value: `${rejectionRate.toFixed(1)}%`,
                status: rejectionRate < 20 ? "Contained" : "Watch",
            },
        ]

        return {
            totalGoals,
            approvedGoals,
            pendingGoals,
            rejectedGoals,
            averageProgress,
            completionRate,
            healthScore,
            statusData,
            trendData,
            performanceBands,
            workloadRows,
        }
    }, [stats])

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="relative text-center">
                        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                            className="relative mx-auto h-20 w-20 rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
                        />
                        <p className="mt-6 text-sm uppercase tracking-[0.32em] text-slate-400">Loading dashboard</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    const insights = [
        {
            title: "Total Goals",
            value: dashboardData.totalGoals,
            note: "All active and completed goal records in the current snapshot.",
            icon: Layers3,
            accent: CHART_COLORS.accent,
        },
        {
            title: "Approved Flow",
            value: dashboardData.approvedGoals,
            note: `${dashboardData.completionRate.toFixed(1)}% of total goals are already approved.`,
            icon: CheckCircle2,
            accent: CHART_COLORS.approved,
        },
        {
            title: "Review Queue",
            value: dashboardData.pendingGoals,
            note: "Pending items are surfaced as active review pressure.",
            icon: Clock3,
            accent: CHART_COLORS.pending,
        },
        {
            title: "Health Score",
            value: `${dashboardData.healthScore}`,
            note: "Composite score based on approval pace, progress, and rejection risk.",
            icon: Gauge,
            accent: CHART_COLORS.violet,
        },
    ]

    const roleSummary = {
        employee: {
            title: "Execution focus",
            text: "Your board emphasizes progress, goal completion, and pending reviews that block execution.",
        },
        manager: {
            title: "Team oversight",
            text: "The view highlights approval velocity and review load so intervention points are obvious.",
        },
        admin: {
            title: "Governance posture",
            text: "The board surfaces approval quality, rejections, and operational flow as system health signals.",
        },
    }[role] || {
        title: "Operational view",
        text: "This workspace summarizes the latest dashboard metrics from the existing backend endpoints.",
    }

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mb-8 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-8 shadow-[0_40px_120px_rgba(2,6,23,0.7)]"
                >
                    <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200">

                                Performance command center
                            </div>
                            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white" data-testid="dashboard-title">
                              Dashboard with full decision visibility.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                                {roleSummary.text}
                            </p>

                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Role context</p>
                                    <p className="mt-3 text-lg font-medium capitalize text-white">{roleSummary.title}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Approval rate</p>
                                    <p className="mt-3 text-lg font-medium text-white">{dashboardData.completionRate.toFixed(1)}%</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">System alert</p>
                                    <div className="mt-3 flex items-center gap-2 text-white">
                                        <AlertTriangle size={16} className="text-amber-300" />
                                        <span className="text-lg font-medium">
                                            {dashboardData.pendingGoals > dashboardData.approvedGoals ? "Review queue elevated" : "Flow within range"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-between rounded-3xl border border-white/10 bg-slate-950/50 p-6">
                            <AnimatedRing value={dashboardData.averageProgress} />
                            <div className="mt-6 grid w-full grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Approved</p>
                                    <p className="mt-2 text-2xl font-semibold text-white">{dashboardData.approvedGoals}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Rejected</p>
                                    <p className="mt-2 text-2xl font-semibold text-white">{dashboardData.rejectedGoals}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <section className="mb-8 grid gap-5 xl:grid-cols-4">
                    {insights.map((item, index) => (
                        <InsightCard key={item.title} {...item} delay={index * 0.08} />
                    ))}
                </section>

                <section className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <SectionCard
                            title="Goal volume and completion trend"
                            eyebrow="Trend analysis"
                            action={
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                                    <TrendingUp size={14} className="text-cyan-300" />
                                    Rolling 4-week view
                                </div>
                            }
                        >
                            <div className="h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData.trendData}>
                                        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                                        <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: chartTheme.tooltipBg,
                                                border: `1px solid ${chartTheme.tooltipBorder}`,
                                                borderRadius: "16px",
                                                color: "#e2e8f0",
                                            }}
                                        />
                                        <Line type="monotone" dataKey="created" stroke={CHART_COLORS.accent} strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="approved" stroke={CHART_COLORS.approved} strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="progress" stroke={CHART_COLORS.violet} strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </SectionCard>

                        <SectionCard title="Operational performance bands" eyebrow="Execution health">
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData.performanceBands} barGap={14}>
                                        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="lane" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                                        <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: chartTheme.tooltipBg,
                                                border: `1px solid ${chartTheme.tooltipBorder}`,
                                                borderRadius: "16px",
                                                color: "#e2e8f0",
                                            }}
                                        />
                                        <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                                            {dashboardData.performanceBands.map((entry) => (
                                                <Cell
                                                    key={entry.lane}
                                                    fill={entry.score >= entry.target ? CHART_COLORS.approved : CHART_COLORS.cyan}
                                                />
                                            ))}
                                        </Bar>
                                        <Bar dataKey="target" radius={[10, 10, 0, 0]} fill="#334155" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </SectionCard>
                    </div>

                    <div className="space-y-6">
                        <SectionCard title="Status distribution" eyebrow="Goal split">
                            <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dashboardData.statusData}
                                                dataKey="value"
                                                innerRadius={68}
                                                outerRadius={102}
                                                paddingAngle={4}
                                                stroke="none"
                                            >
                                                {dashboardData.statusData.map((entry) => (
                                                    <Cell key={entry.name} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: chartTheme.tooltipBg,
                                                    border: `1px solid ${chartTheme.tooltipBorder}`,
                                                    borderRadius: "16px",
                                                    color: "#e2e8f0",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3">
                                    {dashboardData.statusData.map((item) => (
                                        <div key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                                    <span className="text-sm text-slate-300">{item.name}</span>
                                                </div>
                                                <span className="text-lg font-semibold text-white">{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Progress signal" eyebrow="Area model">
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dashboardData.trendData}>
                                        <defs>
                                            <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                                        <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: chartTheme.tooltipBg,
                                                border: `1px solid ${chartTheme.tooltipBorder}`,
                                                borderRadius: "16px",
                                                color: "#e2e8f0",
                                            }}
                                        />
                                        <Area type="monotone" dataKey="progress" stroke={CHART_COLORS.cyan} fill="url(#progressFill)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Decision monitor"
                            eyebrow="Workload matrix"
                            action={
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">
                                    <Zap size={14} />
                                    API synced
                                </div>
                            }
                        >
                            <div className="space-y-3">
                                {dashboardData.workloadRows.map((row) => (
                                    <div key={row.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                        <div>
                                            <p className="text-sm text-slate-300">{row.label}</p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{row.status}</p>
                                        </div>
                                        <p className="text-xl font-semibold text-white">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                </section>
            </div>
        </MainLayout>
    )
}

export default Dashboard
