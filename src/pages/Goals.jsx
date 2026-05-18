import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { getApiErrorMessage } from "../api/config"
import {
    approveGoal,
    createGoal,
    editGoal,
    getEmployeeGoals,
    getGoals,
    getPendingGoals,
    managerBulkUpdateGoals,
    rejectGoal,
    resubmitGoal,
    submitGoals,
} from "../api/goalApi"
import {
    CheckCircle2,
    Clock3,
    Edit3,
    Filter,
    Layers3,
    Loader2,
    Plus,
    Send,
    Target,
    Users,
    X,
    XCircle,
} from "lucide-react"

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

const filters = [
    { id: "all", label: "All Goals" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
]

const inputClasses =
    "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"

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

function Field({ label, children, full = false }) {
    return (
        <label className={full ? "lg:col-span-2" : ""}>
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">{label}</span>
            {children}
        </label>
    )
}

function MetricCard({ item, value, delay }) {
    const Icon = item.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
        >
            <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }}
            />
            <div className="mb-4 flex items-start justify-between">
                <div className="rounded-2xl border border-white/10 p-3" style={{ backgroundColor: `${item.accent}1a` }}>
                    <Icon size={18} style={{ color: item.accent }} />
                </div>
                <span className="rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Live
                </span>
            </div>
            <p className="text-sm text-slate-400">{item.title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-3 text-sm text-slate-500">{item.note}</p>
        </motion.div>
    )
}

function Goals() {
    const role = localStorage.getItem("role") || "employee"
    const submitLockRef = useRef(false)

    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [activeFilter, setActiveFilter] = useState("all")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingGoalId, setEditingGoalId] = useState(null)
    const [managerEditMode, setManagerEditMode] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        thrust_area: "",
        uom: "",
        target_value: "",
        weightage: "",
        manager_email: "",
    })

    useEffect(() => {
        fetchGoals()
    }, [])

    const fetchGoals = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true)
            }
            let data = []

            if (role === "employee") data = await getEmployeeGoals()
            else if (role === "manager") data = await getPendingGoals()
            else if (role === "admin") data = await getGoals()

            // Ensure we always have an array
            const raw = Array.isArray(data) ? data : []

            // Normalize each goal: guarantee is_shared (boolean) and status (string).
            // If backend sends status use that. If backend uses `goal_status`, use that.
            // Otherwise default shared goals to "approved" (backend creates shared KPIs as approved)
            // and non-shared to "draft".
            const normalized = raw.map((g) => {
                const isShared = Boolean(g.is_shared || g.isShared || g.primary_owner_id || g.primary_owner_email)
                const statusFromResponse = typeof g.status === "string" && g.status.trim() !== ""
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

            setGoals(normalized)
        } catch (error) {
            console.log(error)
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            thrust_area: "",
            uom: "",
            target_value: "",
            weightage: "",
            manager_email: "",
        })
        setEditingGoalId(null)
        setShowCreateForm(false)
    }

    const closeManagerEdit = () => {
        setManagerEditMode(false)
        setEditingGoalId(null)
        setFormData((prev) => ({
            ...prev,
            target_value: "",
            weightage: "",
        }))
    }

    const handleChange = (event) => {
        setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    }

    const handleEdit = (goal) => {
        setEditingGoalId(goal.id)
        setShowCreateForm(true)
        setFormData({
            title: goal.title || "",
            description: goal.description || "",
            thrust_area: goal.thrust_area || "",
            uom: goal.uom || "",
            target_value: goal.target_value ?? "",
            weightage: goal.weightage ?? "",
            manager_email: goal.manager_email || "",
        })
    }

    const handleManagerEdit = (goal) => {
        setManagerEditMode(true)
        setEditingGoalId(goal.id)
        setFormData((prev) => ({
            ...prev,
            target_value: goal.target_value ?? "",
            weightage: goal.weightage ?? "",
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                ...formData,
                target_value: Number(formData.target_value),
                weightage: Number(formData.weightage),
            }

            if (editingGoalId) {
                await editGoal(editingGoalId, payload)
                toast("Goal updated")
            } else {
                await createGoal(payload)
                toast("Goal created")
            }

            resetForm()
            fetchGoals()
        } catch (error) {
            toast(getApiErrorMessage(error, "Goal creation failed"), "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const handleManagerUpdate = async (event) => {
        event.preventDefault()
        setSubmitting(true)

        try {
            const targetGoal = goals.find((goal) => goal.id === editingGoalId)

            await managerBulkUpdateGoals({
                employee_id: targetGoal?.employee_id,
                goals: goals.map((goal) =>
                    goal.id === editingGoalId
                        ? {
                              goal_id: goal.id,
                              target_value: Number(formData.target_value),
                              weightage: Number(formData.weightage),
                          }
                        : {
                              goal_id: goal.id,
                              target_value: goal.target_value,
                              weightage: goal.weightage,
                          }
                ),
            })

            toast("Goal updated")
            closeManagerEdit()
            fetchGoals()
        } catch (error) {
            toast(getApiErrorMessage(error, "Goal update failed"), "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoalSubmission = async () => {
        if (submitLockRef.current || submitting) {
            return
        }
        submitLockRef.current = true
        setSubmitting(true)

        try {
            await submitGoals()

            setGoals((currentGoals) =>
                currentGoals.map((goal) =>
                    // only convert non-shared drafts to submitted locally
                    !goal.is_shared && (goal.status === "draft" || !goal.status)
                        ? {
                            ...goal,
                            status: "submitted",
                        }
                        : goal
                )
            )


            try {
                await fetchGoals({ silent: true })
            } catch (refreshError) {
                console.log(refreshError)
            }

            toast("Goals submitted")
        } catch (error) {
            toast(getApiErrorMessage(error, "Submission failed"), "#ef4444")
        } finally {
            setSubmitting(false)
            submitLockRef.current = false
        }
    }

    const handleResubmit = async (goalId) => {
        setSubmitting(true)
        try {
            await resubmitGoal(goalId)
            toast("Goal resubmitted")
            fetchGoals()
        } catch (error) {
            toast(getApiErrorMessage(error, "Resubmit failed"), "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const handleApprove = async (goalId) => {
        setSubmitting(true)
        try {
            await approveGoal(goalId)
            toast("Goal approved")
            fetchGoals()
        } catch (error) {
            toast("Approval failed", "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const handleReject = async (goalId) => {
        setSubmitting(true)
        try {
            await rejectGoal(goalId)
            toast("Goal rejected", "#f59e0b")
            fetchGoals()
        } catch (error) {
            toast("Rejection failed", "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const stats = useMemo(() => {
        const approved = goals.filter((goal) => goal.status === "approved").length
        const pending = goals.filter((goal) => ["pending", "submitted"].includes(goal.status)).length
        const rejected = goals.filter((goal) => goal.status === "rejected").length
        const draft = goals.filter((goal) => !goal.is_shared && goal.status === "draft").length

        return {
            total: goals.length,
            approved,
            pending,
            rejected,
            draft,
        }
    }, [goals])

    const filteredGoals = useMemo(() => {

        if (activeFilter === "all") {
            return goals
        }

        if (activeFilter === "pending") {
            return goals.filter((goal) =>
                ["pending", "submitted"].includes(goal.status)
            )
        }

        if (activeFilter === "draft") {
            return goals.filter(
                (goal) =>
                    !goal.is_shared &&
                    goal.status === "draft"
            )
        }

        return goals.filter(
            (goal) => goal.status === activeFilter
        )

    }, [activeFilter, goals])

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>


                    <div className="grid gap-8 xl:grid-cols-[1.35fr_0.85fr]">
                        <div>
                            <div className="mt-8 mb-10 flex flex-wrap gap-3">
                                {role === "employee" && (
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                                    >
                                        <Plus size={16} className="text-cyan-300" />
                                        New Goal
                                    </button>
                                )}
                            </div>
                        </div>


                    </div>


                {role === "employee" && (
                    <section className="mb-8 grid gap-5 xl:grid-cols-4">

                    </section>
                )}

                <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.26em] text-slate-400">
                                <Filter size={13} />
                                Goal inventory
                            </div>
                        </div>
                        {role === "employee" && (
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                                        activeFilter === filter.id
                                            ? "border-cyan-400/30 bg-cyan-400/12 text-white"
                                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                            )}
                    </div>

                    {loading ? (
                        <div className="flex min-h-[320px] items-center justify-center">
                            <div className="text-center">
                                <Loader2 size={28} className="mx-auto animate-spin text-cyan-300" />
                                <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">Loading goals</p>
                            </div>
                        </div>
                    ) : filteredGoals.length === 0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                <Target size={24} className="text-slate-500" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">No goals found</h3>
                            <p className="mt-2 max-w-md text-sm text-slate-400">
                                {role === "employee" ? "Create your first goal to start tracking work in this cycle." : "There are no records in the selected view yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-y-3">
                                <thead>
                                    <tr>
                                        {["Goal", "Thrust Area", "UOM", "Target", "Weight", "Status", ...(role !== "manager" ? ["Manager"] : []), ...(role === "admin" ? ["Employee"] : []), "Primary Owner", "Actions"].map((label) => (
                                            <th key={label} className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGoals.map((goal, index) => {
                                        const status = statusStyles(goal.status)
                                        return (
                                            <motion.tr
                                                key={goal.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.28, delay: index * 0.03 }}
                                                className="rounded-2xl"
                                                data-testid="goal-row"
                                            >
                                                <td className="rounded-l-2xl border-y border-l border-white/10 bg-white/[0.03] px-4 py-4 align-top">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
                                                            <Target size={15} className="text-cyan-300" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{goal.title}</p>
                                                            {goal.description && <p className="mt-1 max-w-[280px] text-sm text-slate-400">{goal.description}</p>}
                                                            {goal.is_shared && (
                                                                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[11px] font-medium text-cyan-200">
                                                                    <Users size={11} />
                                                                    Shared Goal
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                                                    {goal.thrust_area || <span className="text-slate-500">-</span>}
                                                </td>
                                                <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4">
                                                    <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-200">
                                                        {goal.uom?.toUpperCase() || "-"}
                                                    </span>
                                                </td>
                                                <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white">
                                                    {goal.target_value ?? "-"}
                                                </td>
                                                <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4">
                                                    <div className="flex min-w-[110px] items-center gap-3">
                                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                                                            <div
                                                                className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa)]"
                                                                style={{ width: `${Math.min(goal.weightage || 0, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-slate-300">{goal.weightage}%</span>
                                                    </div>
                                                </td>
                                                <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4">
                                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.container}`}>
                                                        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                {role !== "manager" && (
                                                    <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                                                        {goal.manager_email || "-"}
                                                    </td>
                                                )}
                                                {role === "admin" && (
                                                    <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                                                        {goal.employee_email || "-"}
                                                    </td>
                                                )}
                                                <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                                                    {goal.primary_owner_email || "N/A"}
                                                </td>
                                                <td className="rounded-r-2xl border-y border-r border-white/10 bg-white/[0.03] px-4 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {role === "employee" &&
                                                            !goal.is_shared &&
                                                            (goal.status === "draft" || goal.status === "rejected") && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(goal)}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-400/16"
                                                                    data-testid="goal-edit-button"
                                                                >
                                                                    <Edit3 size={12} />
                                                                    Edit
                                                                </button>
                                                                {goal.status === "rejected" && (
                                                                    <button
                                                                        onClick={() => handleResubmit(goal.id)}
                                                                        disabled={submitting}
                                                                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60"
                                                                        data-testid="goal-resubmit-button"
                                                                    >
                                                                        <Send size={12} />
                                                                        Resubmit
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}

                                                        {role === "manager" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleManagerEdit(goal)}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-400/16"
                                                                    data-testid="goal-manager-edit-button"
                                                                >
                                                                    <Edit3 size={12} />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApprove(goal.id)}
                                                                    disabled={submitting}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/16 disabled:opacity-60"
                                                                    data-testid="goal-approve-button"
                                                                >
                                                                    <CheckCircle2 size={12} />
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(goal.id)}
                                                                    disabled={submitting}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-400/16 disabled:opacity-60"
                                                                    data-testid="goal-reject-button"
                                                                >
                                                                    <XCircle size={12} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {role === "admin" && <span className="text-sm text-slate-500">Read-only</span>}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {role === "employee" &&
                        !loading &&
                        goals.some(goal => !goal.is_shared && goal.status === "draft") && (
                        <div className="mt-6 flex justify-end border-t border-white/10 pt-6">
                            <button
                                onClick={handleGoalSubmission}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Submit All
                            </button>
                        </div>
                    )}
                </section>
            </div>


            <AnimatePresence>
                {showCreateForm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                            onClick={resetForm}
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

                                        <h3 className="mt-2 text-md uppercase  font-semibold tracking-[0.26em] text-cyan-300/80">
                                            {editingGoalId ? "Update goal" : "Create goal"}
                                        </h3>

                                    </div>
                                    <button
                                        onClick={resetForm}
                                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
                                    <Field label="Goal Title" full>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            placeholder="Increase quarterly revenue"
                                            data-testid="goal-title-input"
                                        />
                                    </Field>
                                    <Field label="Description" full>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className={inputClasses}
                                            placeholder="Brief description"
                                            data-testid="goal-description-input"
                                        />
                                    </Field>
                                    <Field label="Thrust Area">
                                        <input
                                            type="text"
                                            name="thrust_area"
                                            value={formData.thrust_area}
                                            onChange={handleChange}
                                            className={inputClasses}
                                            placeholder="Sales, Innovation"
                                            data-testid="goal-thrust-area-input"
                                        />
                                    </Field>
                                    <Field label="Unit of Measure">
                                        <select
                                            name="uom"
                                            value={formData.uom}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            data-testid="goal-uom-select"
                                        >
                                            <option value="">Select UOM</option>
                                            <option value="min">Min - Minimum</option>
                                            <option value="max">Max - Maximum</option>
                                            <option value="zero">Zero - Target Value</option>
                                        </select>
                                    </Field>
                                    <Field label="Target Value">
                                        <input
                                            type="number"
                                            name="target_value"
                                            value={formData.target_value}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            placeholder="Numeric target"
                                            data-testid="goal-target-input"
                                        />
                                    </Field>
                                    <Field label="Weightage (%)">
                                        <input
                                            type="number"
                                            name="weightage"
                                            value={formData.weightage}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            placeholder="0 - 100"
                                            data-testid="goal-weightage-input"
                                        />
                                    </Field>
                                    <Field label="Manager Email" full>
                                        <input
                                            type="email"
                                            name="manager_email"
                                            value={formData.manager_email}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            placeholder="manager@company.com"
                                            data-testid="goal-manager-input"
                                        />
                                    </Field>

                                    <div className="flex justify-end gap-3 lg:col-span-2">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60"
                                            data-testid="goal-submit-button"
                                        >
                                            {submitting && <Loader2 size={15} className="animate-spin" />}
                                            {editingGoalId ? "Update Goal" : "Create Goal"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {role === "manager" && managerEditMode && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                            onClick={closeManagerEdit}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            transition={{ duration: 0.22 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.7)]">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/80">Manager edit</p>
                                        <h3 className="mt-2 text-2xl font-semibold text-white">Adjust target and weight</h3>
                                    </div>
                                    <button
                                        onClick={closeManagerEdit}
                                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleManagerUpdate} className="space-y-5">
                                    <Field label="Target Value">
                                        <input
                                            type="number"
                                            name="target_value"
                                            value={formData.target_value}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                        />
                                    </Field>
                                    <Field label="Weightage (%)">
                                        <input
                                            type="number"
                                            name="weightage"
                                            value={formData.weightage}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                        />
                                    </Field>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeManagerEdit}
                                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60"
                                        >
                                            {submitting && <Loader2 size={15} className="animate-spin" />}
                                            Update Goal
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </motion.div>

                    </>
                )}


            </AnimatePresence>
        </MainLayout>
    )
}

export default Goals
