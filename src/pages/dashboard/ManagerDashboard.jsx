import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../../layouts/MainLayout"
import { getApiErrorMessage } from "../../api/config"
import {
    getPendingGoals,
    approveGoal,
    rejectGoal,
    getManagerTeamProgress,
} from "../../api/goalApi"
import axios from "axios"
import { getApiBaseUrl } from "../../api/config"
import {
    CheckCircle2,
    Clock3,
    Layers3,
    Users,
    TrendingUp,
    AlertCircle,
    Loader2,
    Target,
    XCircle,
    CheckSquare,
    Zap,
    BarChart3,
    Calendar,
} from "lucide-react"

const BASE_URL = getApiBaseUrl()

const MOCK_DATA = {
    pendingGoals: [
        {
            id: 1,
            title: "Implement New Feature X",
            employee_email: "employee1@example.com",
            employee_name: "John Doe",
            thrust_area: "Innovation",
            weightage: 25,
            status: "submitted",
            description: "Develop and integrate the new feature X into the core module.",
            target_value: "100%",
            uom: "percentage",
            created_at: "2024-03-15T10:00:00Z"
        },
        {
            id: 2,
            title: "Optimize Database Performance",
            employee_email: "employee2@example.com",
            employee_name: "Jane Smith",
            thrust_area: "Infrastructure",
            weightage: 20,
            status: "submitted",
            description: "Reduce query latency by optimizing indexes and rewriting complex queries.",
            target_value: "< 200ms",
            uom: "ms",
            created_at: "2024-03-16T11:30:00Z"
        },
        {
            id: 3,
            title: "Customer Success Initiative",
            employee_email: "employee3@example.com",
            employee_name: "Bob Wilson",
            thrust_area: "Customer",
            weightage: 15,
            status: "submitted",
            description: "Launch a new feedback loop for key customers.",
            target_value: "50 feedback",
            uom: "count",
            created_at: "2024-03-17T09:15:00Z"
        }
    ],
    sharedGoals: [
        {
            id: 101,
            title: "Company-wide Security Audit",
            progress: 65,
            owners: ["John Doe", "Jane Smith"],
            status: "In Progress"
        },
        {
            id: 102,
            title: "Q2 Revenue Growth",
            progress: 40,
            owners: ["Alice Brown", "Charlie Davis"],
            status: "On Track"
        }
    ],
    teamProgress: [
        {
            employee_email: "employee1@example.com",
            employee_name: "John Doe",
            approved_count: 3,
            total_count: 5,
            avg_progress: 60
        },
        {
            employee_email: "employee2@example.com",
            employee_name: "Jane Smith",
            approved_count: 4,
            total_count: 4,
            avg_progress: 100
        },
        {
            employee_email: "employee3@example.com",
            employee_name: "Bob Wilson",
            approved_count: 2,
            total_count: 5,
            avg_progress: 40
        },
        {
            employee_email: "employee4@example.com",
            employee_name: "Alice Brown",
            approved_count: 5,
            total_count: 6,
            avg_progress: 83
        }
    ],
    quarterlyCheckins: [
        {
            quarter: "Q1 2024",
            checkins: [
                { id: 1, employee_name: "John Doe", status: "Completed", date: "2024-03-01", progress_score: 85 },
                { id: 2, employee_name: "Jane Smith", status: "Completed", date: "2024-03-05", progress_score: 90 }
            ]
        },
        {
            quarter: "Q2 2024",
            checkins: [
                { id: 3, employee_name: "Bob Wilson", status: "Scheduled", date: "2024-06-15", progress_score: 45 }
            ]
        }
    ]
}

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

function HeatmapCell({ value, employeeEmail, maxValue }) {
    let bgColor = "bg-slate-700"
    let textColor = "text-slate-300"

    if (value >= maxValue * 0.8) {
        bgColor = "bg-emerald-600"
        textColor = "text-emerald-100"
    } else if (value >= maxValue * 0.6) {
        bgColor = "bg-cyan-600"
        textColor = "text-cyan-100"
    } else if (value >= maxValue * 0.4) {
        bgColor = "bg-amber-600"
        textColor = "text-amber-100"
    } else if (value > 0) {
        bgColor = "bg-rose-600"
        textColor = "text-rose-100"
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`${bgColor} ${textColor} rounded-lg p-3 text-center cursor-pointer transition transform`}
            title={`${employeeEmail}: ${value}%`}
        >
            <p className="text-xs font-semibold truncate">{value}%</p>
        </motion.div>
    )
}

export default function ManagerDashboard() {
    const userEmail = localStorage.getItem("email") || "User"

    const [pendingGoals, setPendingGoals] = useState([])
    const [sharedGoals, setSharedGoals] = useState([])
    const [teamProgress, setTeamProgress] = useState([])
    const [quarterlyCheckins, setQuarterlyCheckins] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [approvingGoalId, setApprovingGoalId] = useState(null)
    const [rejectingGoalId, setRejectingGoalId] = useState(null)
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        fetchManagerDashboardData()
    }, [])

    const fetchManagerDashboardData = async () => {
        setLoading(true)
        setError("")
        setSuccessMessage("")

        try {
            // Fetch pending goals for approval
            let normalized = []
            try {
                const goalsData = await getPendingGoals()
                normalized = Array.isArray(goalsData)
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
            } catch (err) {
                console.log("No real pending goals, using mock:", err)
                normalized = MOCK_DATA.pendingGoals
            }

            setPendingGoals(normalized)

            // Fetch shared goals
            try {
                const sharedRes = await axios.get(
                    `${BASE_URL}/shared-goals/overview`,
                    getAuthHeaders()
                )
                setSharedGoals(Array.isArray(sharedRes.data) ? sharedRes.data : [])
            } catch (err) {
                console.log("No shared goals, using mock:", err)
                setSharedGoals(MOCK_DATA.sharedGoals)
            }

            // Fetch team progress for heatmap
            try {
                const progressRes = await axios.get(
                    `${BASE_URL}/manager/team-goals`,
                    getAuthHeaders()
                )
                const progress = Array.isArray(progressRes.data)
                    ? progressRes.data
                    : Array.isArray(progressRes.data?.data)
                        ? progressRes.data.data
                        : []
                
                if (progress.length === 0) {
                    setTeamProgress(MOCK_DATA.teamProgress)
                } else {
                    setTeamProgress(progress)
                }
            } catch (err) {
                console.log("No team progress data, using mock:", err)
                setTeamProgress(MOCK_DATA.teamProgress)
            }

            // Fetch quarterly checkins
            try {
                const checkinsRes = await axios.get(
                    `${BASE_URL}/manager/checkins`,
                    getAuthHeaders()
                )
                const checkins = Array.isArray(checkinsRes.data)
                    ? checkinsRes.data
                    : Array.isArray(checkinsRes.data?.data)
                        ? checkinsRes.data.data
                        : []

                if (checkins.length === 0) {
                    setQuarterlyCheckins(MOCK_DATA.quarterlyCheckins)
                } else {
                    // Group by quarter
                    const grouped = {}
                    checkins.forEach((c) => {
                        const quarter = c.quarter || "Unknown"
                        if (!grouped[quarter]) grouped[quarter] = []
                        grouped[quarter].push(c)
                    })
                    setQuarterlyCheckins(Object.entries(grouped).map(([q, items]) => ({ quarter: q, checkins: items })))
                }
            } catch (err) {
                console.log("No checkins, using mock:", err)
                setQuarterlyCheckins(MOCK_DATA.quarterlyCheckins)
            }
        } catch (err) {
            console.error(err)
            setError(getApiErrorMessage(err, "Failed to load dashboard data"))
        } finally {
            setLoading(false)
        }
    }

    const handleApproveGoal = async (goalId, employeeEmail) => {
        setApprovingGoalId(goalId)
        try {
            await approveGoal(goalId)
            setSuccessMessage("Goal approved successfully!")
            setTimeout(() => setSuccessMessage(""), 3000)
            fetchManagerDashboardData()
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to approve goal"))
        } finally {
            setApprovingGoalId(null)
        }
    }

    const handleRejectGoal = async (goalId) => {
        setRejectingGoalId(goalId)
        try {
            await rejectGoal(goalId)
            setSuccessMessage("Goal rejected successfully!")
            setTimeout(() => setSuccessMessage(""), 3000)
            fetchManagerDashboardData()
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to reject goal"))
        } finally {
            setRejectingGoalId(null)
        }
    }

    const stats = useMemo(() => {
        const pending = pendingGoals.filter((g) => g.status === "submitted" || g.status === "pending").length
        const approved = pendingGoals.filter((g) => g.status === "approved").length
        const rejected = pendingGoals.filter((g) => g.status === "rejected").length
        const total = pendingGoals.length

        const teamCount = new Set(pendingGoals.map((g) => g.employee_email)).size
        const avgTeamCompletion =
            teamProgress.length > 0
                ? Math.round(
                teamProgress.reduce((sum, t) => sum + (t.approved_count || 0), 0) /
                (teamProgress.reduce((sum, t) => sum + (t.total_count || 1), 0) || 1)
            ) * 100
                : 0

        return {
            total,
            pending,
            approved,
            rejected,
            teamCount,
            avgTeamCompletion,
        }
    }, [pendingGoals, teamProgress])

    const goalsByType = useMemo(() => {
        const types = {}
        pendingGoals.forEach((g) => {
            const type = g.thrust_area || "Unassigned"
            if (!types[type]) types[type] = 0
            types[type]++
        })
        return Object.entries(types)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
    }, [pendingGoals])

    const maxTeamProgress = useMemo(
        () =>
            Math.max(
                ...teamProgress.map((t) =>
                    Math.round(((t.approved_count || 0) / (t.total_count || 1)) * 100)
                ),
                50
            ),
        [teamProgress]
    )

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="text-center">
                        <Loader2 size={40} className="mx-auto animate-spin text-cyan-300" />
                        <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">
                            Loading manager dashboard
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


                {/* Messages */}
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 flex items-start gap-3"
                    >
                        <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-emerald-200">{successMessage}</p>
                    </motion.div>
                )}

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
                <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Pending Approval"
                        value={stats.pending}
                        icon={Clock3}
                        accent="#fbbf24"
                        note="Goals awaiting your review"
                        delay={0}
                    />
                    <MetricCard
                        title="Team Members"
                        value={stats.teamCount}
                        icon={Users}
                        accent="#34d399"
                        note="Direct reports with goals"
                        delay={0.08}
                    />
                    <MetricCard
                        title="Team Completion"
                        value={`${stats.avgTeamCompletion}%`}
                        icon={TrendingUp}
                        accent="#60a5fa"
                        note="Average goal approval rate"
                        delay={0.16}
                    />
                    <MetricCard
                        title="Shared KPIs"
                        value={sharedGoals.length}
                        icon={Target}
                        accent="#a78bfa"
                        note="Active collaborative goals"
                        delay={0.24}
                    />
                </section>

                {/* Main Grid */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Pending Goals for Approval */}
                    <div className="lg:col-span-2">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.32 }}
                            className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                        >
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                                    Goal Approvals
                                </p>
                            </div>

                            {pendingGoals.length === 0 ? (
                                <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                    <div className="text-center">
                                        <CheckCircle2 size={32} className="mx-auto text-slate-500 mb-3" />
                                        <p className="text-slate-400">All goals approved! Great work.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {pendingGoals.map((goal, idx) => {
                                        const status = statusStyles(goal.status)
                                        const isSubmitted = goal.status === "submitted"

                                        return (
                                            <motion.div
                                                key={goal.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.08 }}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition"
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-white">
                                                            {goal.title}
                                                        </h3>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {goal.employee_email}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium flex-shrink-0 ${status.container}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-400 mb-3">
                                                    {goal.description || "No description"}
                                                </p>

                                                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                                                    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
                                                        <p className="text-slate-500">Target</p>
                                                        <p className="text-white font-semibold">{goal.target_value}</p>
                                                    </div>
                                                    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
                                                        <p className="text-slate-500">Weight</p>
                                                        <p className="text-white font-semibold">{goal.weightage}%</p>
                                                    </div>
                                                    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
                                                        <p className="text-slate-500">UOM</p>
                                                        <p className="text-white font-semibold">{goal.uom?.toUpperCase() || "—"}</p>
                                                    </div>
                                                </div>

                                                {isSubmitted && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApproveGoal(goal.id, goal.employee_email)}
                                                            disabled={approvingGoalId === goal.id}
                                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/16 disabled:opacity-60"
                                                        >
                                                            {approvingGoalId === goal.id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 size={14} />
                                                            )}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectGoal(goal.id)}
                                                            disabled={rejectingGoalId === goal.id}
                                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-400/16 disabled:opacity-60"
                                                        >
                                                            {rejectingGoalId === goal.id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <XCircle size={14} />
                                                            )}
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
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
                        {/* Pending Review Goals */}
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                                        Pending Review
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-amber-200">
                                        {stats.pending}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
                                    <Clock3 size={20} className="text-amber-300" />
                                </div>
                            </div>
                        </div>

                        {/* Approved Goals */}
                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">
                                        Approved
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-emerald-200">
                                        {stats.approved}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                                    <CheckCircle2 size={20} className="text-emerald-300" />
                                </div>
                            </div>
                        </div>

                        {/* Rejected Goals */}
                        {stats.rejected > 0 && (
                            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-rose-300">
                                            Rejected
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

                        {/* Total Goals */}
                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                                        Total Goals
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-cyan-200">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                                    <Layers3 size={20} className="text-cyan-300" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Team Performance Heatmap */}

                {/* Goal Types Breakdown */}
                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className=" rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                    >
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                                Team Performance
                            </p>
                        </div>

                        {teamProgress.length === 0 ? (
                            <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                <p className="text-slate-400">No team progress data yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {teamProgress.map((member, idx) => {
                                    const completionRate = Math.round(member.avg_progress || 0)

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: idx * 0.08 }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-white truncate">
                                                {member.employee_email}
                                            </span>
                                                <span className="text-sm text-slate-400">
                                                {member.approved_count || 0}/{member.total_count || 0}
                                            </span>
                                            </div>
                                            <div className="h-8 rounded-lg bg-slate-800 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${completionRate}%` }}
                                                    transition={{ duration: 0.6, delay: 0.2 + idx * 0.05 }}
                                                    className="h-full rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center"
                                                >
                                                    {completionRate > 15 && (
                                                        <span className="text-xs font-bold text-white">
                                                        {completionRate}%
                                                    </span>
                                                    )}
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.section>

                    {/* Shared KPIs */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.48 }}
                        className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                    >
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                                Collaboration
                            </p>

                        </div>

                        {sharedGoals.length === 0 ? (
                            <div className="flex min-h-[150px] items-center justify-center">
                                <p className="text-slate-400">No shared KPIs yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[250px] overflow-y-auto">
                                {sharedGoals.slice(0, 5).map((goal, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: idx * 0.08 }}
                                        className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-semibold text-white text-sm">
                                                {goal.title}
                                            </h3>
                                            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-200 flex-shrink-0">
                                                {goal.progress}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">
                                            {goal.member_count} contributors
                                        </p>
                                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                                                style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </div>

                {/* Quarterly Checkins */}
                {quarterlyCheckins.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.56 }}
                        className="mt-8 rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                    >
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                                Progress Tracking
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                Quarterly Check-ins
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Team progress updates by quarter
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {quarterlyCheckins.map((q, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-white">{q.quarter}</h3>
                                        <Calendar size={16} className="text-cyan-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Check-ins</span>
                                            <span className="font-semibold text-white">
                                                {q.checkins.length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Avg Score</span>
                                            <span className="font-semibold text-cyan-300">
                                                {(
                                                    q.checkins.reduce((sum, c) => sum + (c.progress_score || 0), 0) /
                                                    q.checkins.length
                                                ).toFixed(0)}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </div>
        </MainLayout>
    )
}
