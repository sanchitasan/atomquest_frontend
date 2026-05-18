import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../../layouts/MainLayout"
import { getApiErrorMessage } from "../../api/config"
import {
    getEmployeeGoals,
    getPendingGoals,
} from "../../api/goalApi"
import axios from "axios"
import { getApiBaseUrl } from "../../api/config"
import {
    CheckCircle2,
    Layers3,
    TrendingUp,
    Target,
    AlertCircle,
    Loader2,
    Users,
    XCircle,
} from "lucide-react"

const BASE_URL = getApiBaseUrl()

function getAuthHeaders() {
    return {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    }
}

function statusStyles(status) {
    const normalized = status?.trim()?.toLowerCase()

    if (normalized === "approved") {
        return {
            label: "Approved",
            container: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
            dot: "bg-emerald-300",
        }
    }

    if (normalized === "rejected") {
        return {
            label: "Rejected",
            container: "border-rose-400/20 bg-rose-400/10 text-rose-200",
            dot: "bg-rose-300",
        }
    }

    if (normalized === "pending" || normalized === "submitted") {
        return {
            label: "Pending",
            container: "border-amber-400/20 bg-amber-400/10 text-amber-200",
            dot: "bg-amber-300",
        }
    }

    return {
        label: "Draft",
        container: "border-slate-400/20 bg-slate-400/10 text-slate-300",
        dot: "bg-slate-400",
    }
}

function MetricCard({ title, value, icon: Icon, accent, note, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
        >
            <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />
            <div className="mb-4 flex items-start justify-between">
                <div className="rounded-2xl border border-white/10 p-3" style={{ backgroundColor: `${accent}1a` }}>
                    <Icon size={18} style={{ color: accent }} />
                </div>
                <span className="rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Live
                </span>
            </div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            {note && <p className="mt-3 text-sm text-slate-500">{note}</p>}
        </motion.div>
    )
}

export default function EmployeeDashboard() {
    const role = localStorage.getItem("role") || "employee"
    const userEmail = localStorage.getItem("email") || "User"

    const [goals, setGoals] = useState([])
    const [sharedGoals, setSharedGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        setError("")

        try {
            let goalsData = []
            if (role === "employee") {
                goalsData = await getEmployeeGoals()
            } else if (role === "manager") {
                goalsData = await getPendingGoals()
            }

            // Normalize goals: ensure is_shared is boolean and status is consistent
            const normalized = Array.isArray(goalsData)
                ? goalsData.map((g) => {
                    const isShared = Boolean(
                        g.is_shared || g.isShared || g.primary_owner_id || g.primary_owner_email
                    )
                    const statusFromResponse =
                        typeof g.status === "string" && g.status.trim() !== ""
                            ? g.status
                            : typeof g.goal_status === "string" && g.goal_status.trim() !== ""
                                ? g.goal_status
                                : null

                    return {
                        ...g,
                        is_shared: isShared,
                        status: statusFromResponse ?? (isShared ? "approved" : "draft"),
                    }
                })
                : []

            setGoals(normalized)

            // Fetch shared goals for employees
            if (role === "employee") {
                try {
                    const sharedRes = await axios.get(
                        `${BASE_URL}/shared-goals/overview`,
                        getAuthHeaders()
                    )
                    setSharedGoals(Array.isArray(sharedRes.data) ? sharedRes.data : [])
                } catch (err) {
                    console.log("No shared goals:", err)
                    setSharedGoals([])
                }
            }
        } catch (err) {
            console.error(err)
            setError(getApiErrorMessage(err, "Failed to load dashboard data"))
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const total = goals.length
        const approved = goals.filter((g) => g.status === "approved").length
        const pending = goals.filter((g) => ["pending", "submitted"].includes(g.status)).length
        const draft = goals.filter(
            (g) => !g.is_shared && g.status === "draft"
        ).length
        const rejected = goals.filter((g) => g.status === "rejected").length
        const shared = goals.filter((g) => g.is_shared).length

        // Calculate average progress from shared goals
        const avgProgress =
            sharedGoals.length > 0
                ? Math.round(
                    sharedGoals.reduce((acc, sg) => acc + (sg.progress || 0), 0) /
                    sharedGoals.length
                )
                : 0

        return {
            total,
            approved,
            pending,
            draft,
            rejected,
            shared,
            avgProgress,
        }
    }, [goals, sharedGoals])

    const topGoals = useMemo(() => {
        return goals
            .filter((g) => g.status === "approved")
            .sort((a, b) => (b.weightage || 0) - (a.weightage || 0))
            .slice(0, 3)
    }, [goals])

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="text-center">
                        <Loader2 size={40} className="mx-auto animate-spin text-cyan-300" />
                        <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">
                            Loading dashboard
                        </p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 flex items-start gap-3"
                    >
                        <AlertCircle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-rose-200">{error}</p>
                    </motion.div>
                )}

                {/* Main Metrics */}
                <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricCard
                        title="Total Goals"
                        value={stats.total}
                        icon={Layers3}
                        accent="#60a5fa"
                        note="All goals in scope"
                        delay={0}
                    />
                    <MetricCard
                        title="Approved"
                        value={stats.approved}
                        icon={CheckCircle2}
                        accent="#34d399"
                        note="Ready for execution"
                        delay={0.08}
                    />

                    <MetricCard
                        title="Avg Progress"
                        value={`${stats.avgProgress}%`}
                        icon={TrendingUp}
                        accent="#a78bfa"
                        note="Shared KPI progress"
                        delay={0.24}
                    />
                </section>

                {/* Goals Overview Grid */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Top Goals */}
                    <div className="lg:col-span-2">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.32 }}
                            className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                        >
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                                    Performance
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-white">
                                    Top Goals by Weight
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Your highest-priority approved goals
                                </p>
                            </div>

                            {topGoals.length === 0 ? (
                                <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                    <div className="text-center">
                                        <Target size={32} className="mx-auto text-slate-500 mb-3" />
                                        <p className="text-slate-400">No approved goals yet</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topGoals.map((goal, idx) => {
                                        const status = statusStyles(goal.status)
                                        return (
                                            <motion.div
                                                key={goal.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-white">
                                                            {goal.title}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {goal.description || "No description"}
                                                        </p>
                                                        <div className="mt-3 flex items-center gap-3">
                                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${status.container}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                                {status.label}
                                                            </span>
                                                            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-200">
                                                                {goal.uom?.toUpperCase() || "TARGET"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-lg font-semibold text-white">
                                                            {goal.weightage}%
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Weightage
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa)]"
                                                        style={{
                                                            width: `${Math.min(goal.weightage || 0, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            )}
                        </motion.section>
                    </div>

                    {/* Right Column: Summary Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.32 }}
                        className="space-y-4"
                    >
                        {/* Draft Goals */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                        Draft Goals
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-white">
                                        {stats.draft}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-400/20 bg-slate-400/10 p-3">
                                    <AlertCircle size={20} className="text-slate-300" />
                                </div>
                            </div>
                        </div>

                        {/* Rejected Goals */}
                        {stats.rejected > 0 && (
                            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-rose-300">
                                            Needs Rework
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold text-rose-200">
                                            {stats.rejected}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3">
                                        <XCircle size={20} className="text-rose-300" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shared KPIs */}
                        {role === "employee" && (
                            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                                            Shared KPIs
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold text-cyan-200">
                                            {sharedGoals.length}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                                        <Users size={20} className="text-cyan-300" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Shared KPIs Section */}
                {role === "employee" && sharedGoals.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="mt-8 rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                    >
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                                Collaboration
                            </p>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {sharedGoals.map((goal, idx) => (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                                    className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {goal.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {goal.member_count} contributors
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                                            {goal.progress}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#60a5fa)]"
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Quick Stats Footer */}
                {role === "employee" && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.48 }}
                        className="mt-8 rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                    Goal Completion
                                </p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold text-emerald-300">
                                        {stats.total > 0
                                            ? Math.round((stats.approved / stats.total) * 100)
                                            : 0}
                                        %
                                    </span>
                                    <span className="text-xs text-slate-500">of all goals</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                    Weightage Coverage
                                </p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold text-cyan-300">
                                        {goals
                                            .filter((g) => !g.is_shared && g.status === "approved")
                                            .reduce((sum, g) => sum + (g.weightage || 0), 0)}
                                        %
                                    </span>
                                    <span className="text-xs text-slate-500">achieved</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                    Active Status
                                </p>
                                <div className="mt-3">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        On Track
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                    Last Updated
                                </p>
                                <p className="mt-3 text-sm text-slate-300">
                                    {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.section>
                )}
            </div>
        </MainLayout>
    )
}
