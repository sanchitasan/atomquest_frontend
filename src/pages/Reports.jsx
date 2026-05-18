import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { getAuditLogs } from "../api/auditApi"
import { getApiErrorMessage } from "../api/config"
import {
    downloadAchievementReport,
    getDashboardStats,
} from "../api/reportApi"
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock3,
    Download,
    FileText,
    Shield,
    Users,
} from "lucide-react"

function formatTimestamp(timestamp) {
    if (!timestamp) return "No timestamp"

    return new Date(timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

function getActionTone(action) {
    switch (action?.toLowerCase()) {
        case "approve":
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        case "reject":
            return "border-amber-400/20 bg-amber-400/10 text-amber-200"
        case "create":
            return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
        case "update":
            return "border-violet-400/20 bg-violet-400/10 text-violet-200"
        default:
            return "border-white/10 bg-white/[0.04] text-slate-300"
    }
}

function StatCard({ title, value, note, icon: Icon, accent, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
        >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <div className="mb-4 flex items-start justify-between">
                <div className="rounded-2xl border border-white/10 p-3" style={{ backgroundColor: `${accent}1a` }}>
                    <Icon size={18} style={{ color: accent }} />
                </div>
                <span className="rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">Live</span>
            </div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-3 text-sm text-slate-500">{note}</p>
        </motion.div>
    )
}

function SectionCard({ eyebrow, title, children, action }) {
    return (
        <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">{eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
                </div>
                {action}
            </div>
            {children}
        </section>
    )
}

function Reports() {
    const [dashboardStats, setDashboardStats] = useState(null)
    const [governanceLogs, setGovernanceLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        fetchReports()
    }, [])

    async function fetchReports() {
        try {
            setLoading(true)
            setError("")

            const [stats, governance] = await Promise.all([
                getDashboardStats(),
                getAuditLogs(),
            ])

            setDashboardStats(stats)
            setGovernanceLogs(Array.isArray(governance) ? governance : [])
        } catch (fetchError) {
            console.log(fetchError)
            setError(getApiErrorMessage(fetchError, "Failed to load governance reports"))
        } finally {
            setLoading(false)
        }
    }

    async function handleExport() {
        try {
            setExporting(true)
            await downloadAchievementReport()
        } catch (exportError) {
            console.log(exportError)
            setError(getApiErrorMessage(exportError, "Failed to export achievement report"))
        } finally {
            setExporting(false)
        }
    }

    const topGovernanceLogs = useMemo(
        () =>
            [...governanceLogs]
                .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                .slice(0, 6),
        [governanceLogs]
    )

    const overviewStats = [
        {
            title: "Total Goals",
            value: dashboardStats?.total_goals || 0,
            note: "Overall tracked goals across the current reporting window.",
            icon: FileText,
            accent: "#60a5fa",
        },
        {
            title: "Approved Goals",
            value: dashboardStats?.approved_goals || 0,
            note: "Goals cleared through the current review workflow.",
            icon: CheckCircle2,
            accent: "#34d399",
        },
        {
            title: "Pending Goals",
            value: dashboardStats?.pending_goals || 0,
            note: "Items still waiting on governance or manager action.",
            icon: Clock3,
            accent: "#fbbf24",
        },
        {
            title: "Average Progress",
            value: `${Math.round(dashboardStats?.average_progress || 0)}%`,
            note: "Mean progress score calculated from tracked goals.",
            icon: Activity,
            accent: "#a78bfa",
        },
    ]

    const completionStats = [
        {
            title: "Total Employees",
            value: dashboardStats?.total_employees || 0,
            note: "Employees currently included in the completion dashboard.",
            icon: Users,
            accent: "#22d3ee",
        },

        {
            title: "Managers",
            value: dashboardStats?.total_managers || 0,
            note: "Managers represented in the current governance cycle.",
            icon: Shield,
            accent: "#60a5fa",
        },
        {
            title: "Rejected Goals",
            value: dashboardStats?.rejected_goals || 0,
            note: "Goals sent back during governance review.",
            icon: Clock3,
            accent: "#fb7185",
        },
    ]

    const latestAudit = topGovernanceLogs[0]

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mb-8 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-8 shadow-[0_40px_120px_rgba(2,6,23,0.7)]"
                >
                    <div className="grid gap-8 xl:grid-cols-[1.35fr_0.85fr]">
                        <div>
                            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
                                Governance Reports
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                                Monitor delivery, check-in completion, and governance activity from a single admin reporting surface aligned with the rest of the platform.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    disabled={exporting}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60"
                                >
                                    <Download size={16} />
                                    {exporting ? "Exporting..." : "Export Achievement Report"}
                                </button>
                                <button
                                    type="button"
                                    onClick={fetchReports}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
                                >
                                    <Activity size={16} />
                                    Refresh Data
                                </button>
                            </div>
                        </div>


                    </div>
                </motion.section>

                {error ? (
                    <section className="mb-8 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="mt-0.5 flex-none" />
                            <p className="text-sm leading-6">{error}</p>
                        </div>
                    </section>
                ) : null}

                <section className="mb-8 grid gap-5 xl:grid-cols-4">
                    {overviewStats.map((item, index) => (
                        <StatCard key={item.title} {...item} delay={index * 0.08} />
                    ))}
                </section>

                <SectionCard eyebrow="Delivery pulse" title="Completion Dashboard">
                    {loading ? (
                        <div className="grid gap-5 xl:grid-cols-4">
                            {completionStats.map((item) => (
                                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                    <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
                                    <div className="mt-4 h-10 w-16 animate-pulse rounded bg-white/10" />
                                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-5 xl:grid-cols-3">
                            {completionStats.map((item, index) => (
                                <StatCard key={item.title} {...item} delay={index * 0.08} />
                            ))}
                        </div>
                    )}
                </SectionCard>

                <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <SectionCard eyebrow="Reporting snapshot" title="Performance Summary">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Approval Rate</p>
                                <p className="mt-3 text-3xl font-semibold text-white">
                                    {dashboardStats?.total_goals ? `${Math.round(((dashboardStats.approved_goals || 0) / dashboardStats.total_goals) * 100)}%` : "0%"}
                                </p>
                                <p className="mt-2 text-sm text-slate-400">Approved goals compared with the current total goal count.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Check-in Coverage</p>
                                <p className="mt-3 text-3xl font-semibold text-white">
                                    {dashboardStats?.total_employees ? `${Math.round(((dashboardStats.employees_completed_checkins || 0) / dashboardStats.total_employees) * 100)}%` : "0%"}
                                </p>
                                <p className="mt-2 text-sm text-slate-400">Employees with completed check-ins across the tracked workforce.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Open Review Load</p>
                                <p className="mt-3 text-3xl font-semibold text-white">{dashboardStats?.pending_goals || 0}</p>
                                <p className="mt-2 text-sm text-slate-400">Pending approvals still moving through the governance process.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Manager Span</p>
                                <p className="mt-3 text-3xl font-semibold text-white">{dashboardStats?.total_managers || 0}</p>
                                <p className="mt-2 text-sm text-slate-400">Managers currently represented in reporting and completion data.</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard eyebrow="Audit preview" title="Governance Audit Trail">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                                        <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/10" />
                                        <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-white/10" />
                                    </div>
                                ))}
                            </div>
                        ) : topGovernanceLogs.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                                <p className="text-base text-white">No governance audit entries available.</p>
                                <p className="mt-2 text-sm text-slate-400">The audit report endpoint has not returned any rows yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topGovernanceLogs.map((log) => (
                                    <article key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getActionTone(log.action)}`}>
                                                {log.action || "Unknown"}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-300">
                                                <Calendar size={12} />
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-white">{log.performed_by || "Unknown actor"}</p>
                                        <p className="mt-1 text-sm text-slate-400">{log.entity || "Unknown entity"}</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-300">{log.details || "No additional detail provided."}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </MainLayout>
    )
}

export default Reports
