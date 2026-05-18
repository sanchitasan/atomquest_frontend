import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { getApiErrorMessage } from "../api/config"
import { editGoal, getEmployeeGoals } from "../api/goalApi"
import {
    Award,
    AlertCircle,
    Edit3,
    Layers3,
    Loader2,
    Target,
    Users,
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

const inputClasses =
    "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"

function normalizeGoal(goal) {
    return {
        ...goal,
        employeeId: goal.employee_id ?? goal.user_id ?? null,
        employeeEmail: goal.employee_email || goal.email || "",
        managerEmail: goal.manager_email || goal.primary_owner_email || "",
        primaryOwnerEmail: goal.primary_owner_email || "",
        primaryOwnerId: goal.primary_owner_id ?? null,
        isSharedKpi: Boolean(goal.is_shared || goal.primary_owner_id || goal.primary_owner_email),
    }
}

function MetricCard({ title, value, note, icon: Icon, accent, delay }) {
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

export default function AssignedKPI() {
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [editModal, setEditModal] = useState(null)
    const [weightage, setWeightage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchAssigned()
    }, [])

    async function fetchAssigned() {
        setLoading(true)
        setError("")
        try {
            const data = await getEmployeeGoals()
            const assigned = (Array.isArray(data) ? data : [])
                .map(normalizeGoal)
                .filter((goal) => goal.isSharedKpi)
            setGoals(assigned)
        } catch (err) {
            console.error(err)
            setGoals([])
            setError(getApiErrorMessage(err, "Failed to load assigned Goals"))
        } finally {
            setLoading(false)
        }
    }

    const openEdit = (goal) => {
        setEditModal(goal)
        setWeightage(String(goal.weightage ?? ""))
    }

    const closeEdit = () => {
        setEditModal(null)
        setWeightage("")
    }

    const updateWeightage = async () => {
        if (!editModal) return
        if (Number(weightage) < 10 || Number(weightage) > 100) {
            toast("Weightage must be between 0 and 100", "#ef4444")
            return
        }

        setSubmitting(true)
        try {
            await editGoal(editModal.id, {
                title: editModal.title || "",
                description: editModal.description || "",
                thrust_area: editModal.thrust_area || "",
                uom: editModal.uom || "",
                target_value: Number(editModal.target_value ?? 0),
                weightage: Number(weightage),
                manager_email: editModal.manager_email || editModal.managerEmail || "",
            })
            toast("Weightage updated")
            closeEdit()
            fetchAssigned()
        } catch (err) {
            console.error(err)
            toast(getApiErrorMessage(err, "Failed to update weightage"), "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const metrics = useMemo(() => {
        const total = goals.length
        const shared = goals.filter((goal) => goal.isSharedKpi).length
        const editable = goals.filter((goal) => goal.weightage != null).length
        return { total, shared, editable }
    }, [goals])

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>
                <section className="mb-8 grid gap-5 xl:grid-cols-2">
                    <MetricCard title="Assigned Goals" value={loading ? "-" : metrics.total} note="Goals assigned to you by your manager." icon={Layers3} accent="#60a5fa" delay={0} />
                 <MetricCard title="Editable Weight" value={loading ? "-" : metrics.editable} note="Goals where weightage is available to review and adjust." icon={Target} accent="#a78bfa" delay={0.16} />
                </section>

                <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Goal inventory</p>
                     </div>

                    {loading ? (
                        <div className="flex min-h-[240px] items-center justify-center">
                            <div className="text-center">
                                <Loader2 size={28} className="mx-auto animate-spin text-cyan-300" />
                                <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">Loading assigned Goals</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10">
                                <AlertCircle size={24} className="text-rose-300" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">Unable to load assigned Goals</h3>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{error}</p>
                        </div>
                    ) : goals.length === 0 ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                <Award size={24} className="text-slate-500" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">No assigned Goals found</h3>
                        </div>
                    ) : (
                        <div className="grid gap-5 xl:grid-cols-2">
                            {goals.map((goal, index) => (
                                <motion.article
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.28, delay: index * 0.04 }}
                                    className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))] p-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">{goal.description || "No description"}</p>
                                        </div>
                                        <button
                                            onClick={() => openEdit(goal)}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16"
                                        >
                                            <Edit3 size={14} />
                                            Edit Weightage
                                        </button>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Target</p>
                                            <p className="mt-2 text-lg font-semibold text-white">{goal.target_value ?? "-"}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Weightage</p>
                                            <p className="mt-2 text-lg font-semibold text-white">{goal.weightage ?? "-"}%</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">UOM</p>
                                            <p className="mt-2 text-lg font-semibold text-white">{goal.uom || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Thrust Area</p>
                                            <p className="mt-2 text-sm text-slate-300">{goal.thrust_area || "-"}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Assigned by</p>
                                            <p className="mt-2 text-sm text-slate-300">{goal.managerEmail || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Primary Owner</p>
                                            <p className="mt-2 text-sm text-slate-300">{goal.primaryOwnerEmail || goal.primaryOwnerId || "Not assigned"}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Goal Type</p>
                                            <p className="mt-2 text-sm text-slate-300">{goal.isSharedKpi ? "Shared Goal" : "Manager Assigned"}</p>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <AnimatePresence>
                {editModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                            onClick={closeEdit}
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
                                        <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/80">Weightage editor</p>
                                     </div>
                                    <button
                                        onClick={closeEdit}
                                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Goal</p>
                                    <p className="mt-2 text-lg font-medium text-white">{editModal.title}</p>
                                    <p className="mt-2 text-sm text-slate-400">Target: {editModal.target_value}</p>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Weightage %</span>
                                    <input type="number" min="0" max="100" value={weightage} onChange={(e) => setWeightage(e.target.value)} className={inputClasses} />
                                </label>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={closeEdit} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]">
                                        Cancel
                                    </button>
                                    <button onClick={updateWeightage} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60">
                                        {submitting && <Loader2 size={15} className="animate-spin" />}
                                        Save
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
