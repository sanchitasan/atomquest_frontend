import { useEffect, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { approveGoal, getPendingGoals, rejectGoal } from "../api/goalApi"
import {
    clearManagerReviewHistory,
    loadManagerReviewHistory,
    recordReviewDecision,
    recordSubmissionReceived,
} from "../utils/managerReviewHistory"
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock3,
    History,
    Loader2,
    MessageSquareText,
    ShieldCheck,
    Target,
    Trash2,
    Users,
    X,
    XCircle,
} from "lucide-react"

function formatHistoryDate(iso) {
    if (!iso) return "-"
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

function getActionLabel(action) {
    switch (action) {
        case "submitted":
            return "Submitted"
        case "approved":
            return "Approved"
        case "rejected":
            return "Rejected"
        default:
            return action || "-"
    }
}

function getActionClass(action) {
    switch (action) {
        case "approved":
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        case "rejected":
            return "border-rose-400/20 bg-rose-400/10 text-rose-200"
        case "submitted":
            return "border-amber-400/20 bg-amber-400/10 text-amber-200"
        default:
            return "border-slate-400/20 bg-slate-400/10 text-slate-300"
    }
}

function getStatusStyles(status) {
    const normalized = status?.toLowerCase()

    if (normalized === "approved") {
        return {
            label: "Approved",
            badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
            dot: "bg-emerald-300",
        }
    }

    if (normalized === "rejected") {
        return {
            label: "Rejected",
            badge: "border-rose-400/20 bg-rose-400/10 text-rose-200",
            dot: "bg-rose-300",
        }
    }

    if (normalized === "pending" || normalized === "submitted") {
        return {
            label: "Pending",
            badge: "border-amber-400/20 bg-amber-400/10 text-amber-200",
            dot: "bg-amber-300",
        }
    }

    return {
        label: status || "Unknown",
        badge: "border-slate-400/20 bg-slate-400/10 text-slate-300",
        dot: "bg-slate-400",
    }
}

function toast(message, color = "#22c55e") {
    const el = document.createElement("div")
    el.style.cssText = `position:fixed;top:24px;right:24px;z-index:9999;padding:14px 22px;border-radius:16px;background:${color};color:#fff;font-weight:600;font-size:14px;box-shadow:0 20px 60px rgba(2,6,23,.45);transform:translateY(-10px);opacity:0;transition:all .25s ease`
    el.textContent = message
    document.body.appendChild(el)
    requestAnimationFrame(() => {
        el.style.transform = "translateY(0)"
        el.style.opacity = "1"
    })
    setTimeout(() => {
        el.style.opacity = "0"
        el.style.transform = "translateY(-10px)"
        setTimeout(() => el.remove(), 250)
    }, 2600)
}

function MetricCard({ title, value, note, icon: Icon, accent, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
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
                    Team
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
        <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

function TeamView() {
    const role = localStorage.getItem("role")
    const [goals, setGoals] = useState([])
    const [reviewHistory, setReviewHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [reviewGoal, setReviewGoal] = useState(null)
    const [reviewComment, setReviewComment] = useState("")
    const [rejectionReason, setRejectionReason] = useState("")

    useEffect(() => {
        setReviewHistory(loadManagerReviewHistory())
        fetchGoals()
    }, [])

    const refreshHistory = () => {
        setReviewHistory(loadManagerReviewHistory())
    }

    const fetchGoals = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true)
            }

            const data = await getPendingGoals()
            const list = Array.isArray(data) ? data : []

            list
                .filter((goal) => goal.status === "submitted" || goal.status === "pending")
                .forEach((goal) => recordSubmissionReceived(goal))

            setGoals(list)
            refreshHistory()
        } catch (error) {
            console.log(error)
            toast("Failed to load goals", "#ef4444")
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }
    }

    const handleApprove = async () => {
        setSubmitting(true)
        try {
            await approveGoal(reviewGoal.id)
            recordReviewDecision(reviewGoal, "approved", { comment: reviewComment })
            setGoals((currentGoals) =>
                currentGoals.map((goal) =>
                    goal.id === reviewGoal.id
                        ? {
                              ...goal,
                              status: "approved",
                          }
                        : goal
                )
            )
            refreshHistory()
            toast("Goal approved")
            setReviewGoal(null)
            setReviewComment("")
            setRejectionReason("")
            fetchGoals({ silent: true })
        } catch (error) {
            console.log(error)
            toast("Approval failed", "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast("Please provide a rejection reason", "#ef4444")
            return
        }

        setSubmitting(true)
        try {
            await rejectGoal(reviewGoal.id)
            recordReviewDecision(reviewGoal, "rejected", {
                comment: reviewComment,
                rejectionReason,
            })
            setGoals((currentGoals) =>
                currentGoals.map((goal) =>
                    goal.id === reviewGoal.id
                        ? {
                              ...goal,
                              status: "rejected",
                          }
                        : goal
                )
            )
            refreshHistory()
            toast("Goal rejected", "#f59e0b")
            setReviewGoal(null)
            setReviewComment("")
            setRejectionReason("")
            fetchGoals({ silent: true })
        } catch (error) {
            console.log(error)
            toast("Rejection failed", "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const handleClearHistory = () => {
        if (!window.confirm("Clear all review history for your account?")) return
        setReviewHistory(clearManagerReviewHistory())
    }

    const groupedEmployees = useMemo(() => {
        const employeeMap = new Map()

        goals.forEach((goal) => {
            const email = goal.employee_email || "Unknown employee"
            if (!employeeMap.has(email)) {
                employeeMap.set(email, {
                    employeeEmail: email,
                    employeeId: goal.employee_id || email,
                    goals: [],
                })
            }
            employeeMap.get(email).goals.push(goal)
        })

        return Array.from(employeeMap.values())
            .map((entry) => {
                const pending = entry.goals.filter((goal) => ["pending", "submitted"].includes(goal.status)).length
                const approved = entry.goals.filter((goal) => goal.status === "approved").length
                const rejected = entry.goals.filter((goal) => goal.status === "rejected").length

                return {
                    ...entry,
                    pending,
                    approved,
                    rejected,
                    total: entry.goals.length,
                    hasPending: pending > 0,
                }
            })
            .sort((a, b) => {
                if (a.hasPending !== b.hasPending) return a.hasPending ? -1 : 1
                return a.employeeEmail.localeCompare(b.employeeEmail)
            })
    }, [goals])

    const pendingGoals = goals.filter((goal) => goal.status === "submitted" || goal.status === "pending")
    const approvedGoals = goals.filter((goal) => goal.status === "approved")
    const rejectedGoals = goals.filter((goal) => goal.status === "rejected")



    if (role !== "manager") {
        return <Navigate to="/dashboard" replace />
    }

    return (
        <MainLayout>
            <div className="relative overflow-hidden">




                <div className="space-y-6">
                    <SectionCard
                        title="Review history"
                        eyebrow="Decision log"
                        action={
                            reviewHistory.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleClearHistory}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-400/16"
                                >
                                    <Trash2 size={14} />
                                    Clear history
                                </button>
                            ) : null
                        }
                    >
                        {reviewHistory.length === 0 ? (
                            <p className="text-sm text-slate-400">
                                History is recorded when employees submit goals and when you approve or reject them.
                            </p>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4">
                                {reviewHistory.map((entry, index) => {
                                    const action = getActionLabel(entry.action)
                                    const styles = getActionClass(entry.action)

                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: index * 0.05 }}
                                            className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/30"
                                        >
                                            {/* top glow */}
                                            <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                                                <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
                                                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
                                            </div>

                                            <div className="relative z-10 space-y-5">

                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                                            <Users size={20} className="text-cyan-300" />
                                                        </div>

                                                        <div>
                                                            <h3 className="text-md font-semibold text-white">
                                                                {entry.employeeEmail}
                                                            </h3>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {formatHistoryDate(entry.reviewedAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`inline-flex mt-4 items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles}`}
                                                    >
                            {action}
                        </span>
                                                </div>

                                                {/* Goal Card */}
                                                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-2">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Target size={15} className="text-cyan-300" />

                                                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                                            Goal
                                                        </p>
                                                    </div>

                                                    <p className="text-base font-medium leading-relaxed text-white">
                                                        {entry.goalSnapshot?.title || "-"}
                                                    </p>
                                                </div>

                                                {/* Metrics */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-2">
                                                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                            Target
                                                        </p>

                                                        <p className="mt-2 text-lg font-semibold text-white">
                                                            {entry.goalSnapshot?.target_value ?? "-"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-2">
                                                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                            Weight
                                                        </p>

                                                        <p className="mt-2 text-lg font-semibold text-white">
                                                            {entry.goalSnapshot?.weightage != null
                                                                ? `${entry.goalSnapshot.weightage}%`
                                                                : "-"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-2">
                                                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                            UOM
                                                        </p>

                                                        <p className="mt-2 text-lg font-semibold text-white">
                                                            {entry.goalSnapshot?.uom || "-"}
                                                        </p>
                                                    </div>
                                                </div>


                                                    <div className="space-y-3">
                                                        {entry.rejectionReason && (
                                                            <div className="rounded-2xl border border-rose-400/10 bg-rose-400/5 p-4">
                                                                <p className="text-xs uppercase tracking-[0.18em] text-rose-300">
                                                                    Rejection Reason
                                                                </p>

                                                                <p className="mt-2 text-sm leading-relaxed text-rose-100/90">
                                                                    {entry.rejectionReason}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-2">
                                                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                                                Manager Comment
                                                            </p>

                                                            <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                                                {entry.comment || "No comment added"}
                                                            </p>
                                                        </div>
                                                    </div>

                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </SectionCard>
                </div>
                </div>

            <AnimatePresence>
                {reviewGoal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                            onClick={() => setReviewGoal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            transition={{ duration: 0.22 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.7)]">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/80">Goal review</p>
                                        <h3 className="mt-2 text-2xl font-semibold text-white">Review employee goal</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setReviewGoal(null)}
                                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="mb-6 grid gap-5 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-2">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Employee</p>
                                        <p className="mt-2 text-lg font-medium text-white">{reviewGoal.employee_email || "Unknown"}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-2">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Goal title</p>
                                        <p className="mt-2 text-lg font-medium text-white">{reviewGoal.title}</p>
                                        <p className="mt-2 text-sm text-slate-400">{reviewGoal.description || "No description"}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Target</p>
                                        <p className="mt-2 text-lg font-medium text-white">{reviewGoal.target_value ?? "-"}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Weightage</p>
                                        <p className="mt-2 text-lg font-medium text-white">{reviewGoal.weightage}%</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Thrust Area</p>
                                        <p className="mt-2 text-lg font-medium text-white">{reviewGoal.thrust_area || "-"}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">UOM</p>
                                        <p className="mt-2 text-lg font-medium text-white">{reviewGoal.uom || "-"}</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <label className="block">
                                        <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                                            Manager comment
                                        </span>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(event) => setReviewComment(event.target.value)}
                                            rows={3}
                                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                                            Rejection reason
                                        </span>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(event) => setRejectionReason(event.target.value)}
                                            rows={3}
                                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-rose-400/40 focus:ring-4 focus:ring-rose-400/10"
                                        />
                                    </label>
                                </div>

                                <div className="mt-6 flex flex-wrap justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setReviewGoal(null)}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-400/16 disabled:opacity-60"
                                    >
                                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                                        Reject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApprove}
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/16 disabled:opacity-60"
                                    >
                                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </MainLayout>
    )
}

export default TeamView
