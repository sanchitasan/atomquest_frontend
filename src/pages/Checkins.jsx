import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { createCheckIn, getCheckIns } from "../api/checkinApi"
import { getEmployeeGoals } from "../api/goalApi"
import {

    Award,
    Calendar,
    ClipboardList,
    Loader2,
    MessageSquareText,
    Plus,
    Target,

    X,
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

function getStatusConfig(status) {
    switch (status?.toLowerCase()) {
        case "on track":
            return {
                label: "on track",
                badge: "border-amber-400/20 bg-amber-400/10 text-amber-200",
            }
        case "completed":
            return {
                label: "Completed",
                badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
            }
        case "not started":
            return {
                label: "Not Started",
                badge: "border-orange-400/20 bg-orange-400/10 text-orange-200",
            }
        case "behind":
            return {
                label: "Behind",
                badge: "border-rose-400/20 bg-rose-400/10 text-rose-200",
            }
        default:
            return {
                label: status || "Unknown",
                badge: "border-slate-400/20 bg-slate-400/10 text-slate-300",
            }
    }
}

function getProgressAccent(score) {
    if (score >= 80) return "#34d399"
    if (score >= 50) return "#fbbf24"
    return "#fb7185"
}

const inputClasses =
    "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"

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
                    Live
                </span>
            </div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-3 text-sm text-slate-500">{note}</p>
        </motion.div>
    )
}

function Field({ label, children, full = false, icon: Icon }) {
    return (
        <label className={full ? "lg:col-span-2" : ""}>
            <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                {Icon ? <Icon size={13} /> : null}
                {label}
            </span>
            {children}
        </label>
    )
}

function Checkins() {
    const role = localStorage.getItem("role")
    const [checkins, setCheckins] = useState([])
    const [goalsLoading, setGoalsLoading] = useState(true)
    const [goals, setGoals] = useState([])
    const currentUserId = Number(
        localStorage.getItem("user_id")
    )
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [formData, setFormData] = useState({
        quarter: "",
        planned_value: "",
        actual_value: "",
        employee_comment: "",
        goal_id: "",
    })

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchCheckIns(), fetchGoals()])
            setLoading(false)
        }
        loadData()
    }, [])

    const fetchCheckIns = async () => {
        try {
            const data = await getCheckIns()
            setCheckins(Array.isArray(data) ? data : [])
        } catch (error) {
            console.log(error)
        }
    }

    const fetchGoals = async () => {
        try {
            setGoalsLoading(true)
            const data = await getEmployeeGoals()
            const approvedGoals = (Array.isArray(data) ? data : []).filter(
                (goal) => goal.status === "approved"
            )
            setGoals(approvedGoals)
        } catch (error) {
            console.log(error)
        }
        finally {

            setGoalsLoading(false)
        }
    }

    const handleChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const selectedGoal = goals.find(
            (goal) => Number(goal.id) === Number(formData.goal_id)
        )

        const alreadyExists = checkins.some((item) => {

            // Shared KPI validation
            if (
                selectedGoal?.is_shared &&
                item.shared_goal_id &&
                selectedGoal.shared_goal_id &&
                item.shared_goal_id === selectedGoal.shared_goal_id
            ) {
                return item.quarter === formData.quarter
            }

            // Normal goal validation
            return (
                Number(item.goal_id) === Number(formData.goal_id)
                &&
                item.quarter === formData.quarter
            )
        })

        if (alreadyExists) {
            toast(
                "Check-in already submitted for this quarter",
                "#ef4444"
            )

            return
        }

        setSubmitting(true)

        try {

            await createCheckIn({
                quarter: formData.quarter,
                planned_value: Number(formData.planned_value),
                actual_value: Number(formData.actual_value),
                employee_comment: formData.employee_comment,
                goal_id: Number(formData.goal_id),
            })

            toast("Check-in submitted")

            setFormData({
                quarter: "",
                planned_value: "",
                actual_value: "",
                employee_comment: "",
                goal_id: "",
            })

            setShowCreateForm(false)

            const updatedCheckins = await getCheckIns()

            setCheckins(
                Array.isArray(updatedCheckins)
                    ? updatedCheckins
                    : []
            )

        } catch (error) {

            console.log(error)

            toast(
                error.response?.data?.detail ||
                "Check-in submission failed",
                "#ef4444"
            )

        } finally {
            setSubmitting(false)
        }
    }

    const metrics = useMemo(() => {
        const total = checkins.length
       const avgProgress = total
            ? checkins.reduce((sum, item) => sum + Number(item.progress_score || 0), 0) / total
            : 0

        return {
            total,

            avgProgress,
        }
    }, [checkins])

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>



                <section className="mb-8 grid gap-5 xl:grid-cols-2">
                    <MetricCard title="Total Check-ins" value={metrics.total} note="All recorded check-ins in your current scope." icon={ClipboardList} accent="#60a5fa" delay={0} />
                    <MetricCard title="Avg Progress" value={`${Math.min(metrics.avgProgress, 100).toFixed(1)}%`} note="Mean progress score across all check-ins." icon={Award} accent="#a78bfa" delay={0.24} />
                </section>

                {role === "employee" && (
                    <section className="relative mb-8 overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.92),rgba(15,23,42,0.76))] px-4 py-10 shadow-[0_40px_140px_rgba(2,6,23,0.65)] sm:px-6 lg:px-10">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
                            <div className="absolute right-10 top-12 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
                            <div className="absolute inset-0 backdrop-blur-[2px]" />
                        </div>

                        <div className="relative z-10 mx-auto max-w-4xl">
                            <div className="mb-8 text-center">
                                <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Submission panel</p>
                                <h2 className="mt-3 text-3xl font-semibold text-white">Submit quarterly check-in</h2>
                                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                                    Enter your latest quarterly execution update in a focused submission form.
                                </p>
                            </div>

                            {goalsLoading ? (

                                <div className="text-center text-slate-400">
                                    Loading goals...
                                </div>

                            ) : goals.length === 0 ? (
                                <div className="mx-auto max-w-2xl rounded-3xl border border-amber-400/20 bg-amber-400/10 p-8 text-center backdrop-blur-xl">
                                    <p className="text-base font-medium text-amber-100">No approved goals available</p>
                                    <p className="mt-2 text-sm text-amber-200/80">
                                        You need approved goals before submitting check-ins.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(true)}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16"
                                    >
                                        <Plus size={16} />
                                        Create Quarterly Check-in
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">History board</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Check-in history</h2>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[320px] items-center justify-center">
                            <div className="text-center">
                                <Loader2 size={28} className="mx-auto animate-spin text-cyan-300" />
                                <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">Loading check-ins</p>
                            </div>
                        </div>
                    ) : checkins.length === 0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                <ClipboardList size={24} className="text-slate-500" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">No check-ins yet</h3>
                            <p className="mt-2 max-w-md text-sm text-slate-400">
                                Submit your first quarterly check-in to start building progress history.
                            </p>
                        </div>
                    ) : (
                        <div className="relative ml-4 border-l border-cyan-400/20 pl-8">

                            {checkins.map((checkin, index) => {

                                const statusConfig = getStatusConfig(checkin.status)

                                const progressScore = Number(
                                    checkin.progress_score ?? 0
                                )

                                const progressAccent =
                                    getProgressAccent(progressScore)

                                return (

                                    <motion.div
                                        key={checkin.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: index * 0.03,
                                        }}
                                        className="relative mb-6"
                                    >

                                        {/* TIMELINE DOT */}

                                        <div
                                            className="absolute -left-[42px] top-6 h-4 w-4 rounded-full border-4 border-slate-950"
                                            style={{
                                                background: progressAccent,
                                            }}
                                        />

                                        {/* CARD */}

                                        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(15,23,42,0.58))] p-5 backdrop-blur-xl">

                                            {/* TOP ROW */}

                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                                <div>

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="text-lg font-semibold text-white">
                                                            {checkin.goal_title}
                                                        </h3>

                                                        {checkin.is_shared && (
                                                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                                        Shared KPI
                                    </span>
                                                        )}

                                                        {checkin.primary_owner_email && (
                                                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                                        Owner: {checkin.primary_owner_email}
                                    </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-2 text-sm text-slate-400">
                                                        {checkin.quarter}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">

                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.badge}`}
                            >
                                {statusConfig.label}
                            </span>

                                                    <span className="text-lg font-semibold text-white">
                                {progressScore.toFixed(1)}%
                            </span>
                                                </div>
                                            </div>

                                            {/* PROGRESS */}

                                            <div className="mt-5">

                                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(progressScore, 100)}%`,
                                                            background: `linear-gradient(90deg, ${progressAccent}, #60a5fa)`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* METADATA */}

                                            <div className="mt-5 grid gap-3 sm:grid-cols-3">

                                                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                        Planned
                                                    </p>

                                                    <p className="mt-1 text-base font-semibold text-white">
                                                        {checkin.planned_value}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                        Actual
                                                    </p>

                                                    <p className="mt-1 text-base font-semibold text-white">
                                                        {checkin.actual_value}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                        Progress
                                                    </p>

                                                    <p className="mt-1 text-base font-semibold text-white">
                                                        {progressScore.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* COMMENT */}

                                            {checkin.employee_comment && (

                                                <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-4">

                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                        Employee Notes
                                                    </p>

                                                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300">
                                                        {checkin.employee_comment}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>

            <AnimatePresence>
                {role === "employee" && showCreateForm && goals.length > 0 && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowCreateForm(false)}
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
                                        <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/80">Check-in editor</p>
                                        <h3 className="mt-2 text-2xl font-semibold text-white">Create quarterly check-in</h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Submit a progress update against one approved goal.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
                                    <Field label="Quarter" icon={Calendar}>
                                        <select
                                            name="quarter"
                                            value={formData.quarter}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            data-testid="checkin-quarter-select"
                                        >
                                            <option value="">Select Quarter</option>
                                            <option value="Q1">Q1 (Jan-Mar)</option>
                                            <option value="Q2">Q2 (Apr-Jun)</option>
                                            <option value="Q3">Q3 (Jul-Sep)</option>
                                            <option value="Q4">Q4 (Oct-Dec)</option>
                                        </select>
                                    </Field>

                                    <Field label="Goal" icon={Target}>
                                        <select
                                            name="goal_id"
                                            value={formData.goal_id}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            data-testid="checkin-goal-select"
                                        >
                                            <option value="">Select Goal</option>
                                            {goals.map((goal) => (
                                                <option key={goal.id} value={goal.id}>
                                                    {goal.title}
                                                    {goal.is_shared
                                                        ? " (Shared KPI)"
                                                        : ""
                                                    }
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Planned Value">
                                        <input
                                            type="number"
                                            name="planned_value"
                                            value={formData.planned_value}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            placeholder="Planned target"
                                            data-testid="checkin-planned-input"
                                        />
                                    </Field>

                                    <Field label="Actual Value">
                                        <input
                                            type="number"
                                            name="actual_value"
                                            value={formData.actual_value}
                                            onChange={handleChange}
                                            required
                                            className={inputClasses}
                                            placeholder="Actual achievement"
                                            data-testid="checkin-actual-input"
                                        />
                                    </Field>

                                    <Field label="Comment" icon={MessageSquareText} full>
                                        <textarea
                                            name="employee_comment"
                                            value={formData.employee_comment}
                                            onChange={handleChange}
                                            rows={4}
                                            className={inputClasses}
                                            placeholder="Notes about progress, blockers, or achievements"
                                            data-testid="checkin-comment-input"
                                        />
                                    </Field>

                                    <div className="flex justify-end lg:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60"
                                            data-testid="checkin-submit-button"
                                        >
                                            {submitting && <Loader2 size={15} className="animate-spin" />}
                                            Submit Check-in
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

export default Checkins
