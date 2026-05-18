import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { createSharedGoal, getEmployees } from "../api/goalApi"
import { getApiErrorMessage } from "../api/config"
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Plus,
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

function Field({ label, children, full = false }) {
    return (
        <label className={full ? "lg:col-span-2" : ""}>
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">{label}</span>
            {children}
        </label>
    )
}

function normalizeEmployee(employee, index) {
    return {
        ...employee,
        id: employee.id ?? employee.user_id ?? employee.employee_id ?? index + 1,
        name: employee.name || employee.full_name || employee.employee_name || "",
        email: employee.email || employee.employee_email || employee.mail || "",
    }
}

function getEmployeeLabel(employee) {
    if (employee.name && employee.email) {
        return `${employee.name} (${employee.email})`
    }

    return employee.name || employee.email || `Employee ${employee.id}`
}

export default function AssignKPI() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [form, setForm] = useState({
        title: "",
        description: "",
        thrust_area: "",
        uom: "",
        target_value: "",
        weightage: "",
        primary_owner_id: "",
        employee_ids: [],
    })

    useEffect(() => {
        fetchEmployees()
    }, [])

    async function fetchEmployees() {
        setLoading(true)
        setFetchError("")
        try {
            const data = await getEmployees()
            const employeeList = Array.isArray(data)
                ? data
                : Array.isArray(data?.employees)
                    ? data.employees
                    : Array.isArray(data?.data)
                        ? data.data
                        : []

            setEmployees(employeeList.map(normalizeEmployee))
        } catch (err) {
            console.error(err)
            setEmployees([])
            setFetchError(getApiErrorMessage(err, "Failed to load employees"))
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            thrust_area: "",
            uom: "",
            target_value: "",
            weightage: "",
            primary_owner_id: "",
            employee_ids: [],
        })
        setShowCreateForm(false)
    }

    function toggleEmployee(id) {
        setForm((current) => ({
            ...current,
            employee_ids: current.employee_ids.includes(id)
                ? current.employee_ids.filter((value) => value !== id)
                : [...current.employee_ids, id],
        }))
    }

    async function submitShared(event) {
        event.preventDefault()
        if (form.employee_ids.length === 0) {
            toast(
                "Select at least one employee",
                "#ef4444"
            )
            return
        }
        if (!form.primary_owner_id) {

            toast(
                "Select primary owner",
                "#ef4444"
            )

            return
        }
        if (

            !form.employee_ids.includes(
                Number(form.primary_owner_id)
            )

        ) {
            toast(
                "Primary owner must be part of employee selection",
                "#ef4444"
            )
            return
        }
        setSubmitting(true)
        try {
            await createSharedGoal({
                ...form,
                target_value: Number(form.target_value),
                weightage: Number(form.weightage),
                primary_owner_id: Number(form.primary_owner_id || 0),
            })
            toast("Shared KPI assigned")
            resetForm()
        } catch (err) {
            console.error(err)
            toast("Failed to assign KPI", "#ef4444")
        } finally {
            setSubmitting(false)
        }
    }

    const metrics = useMemo(() => {
        const selectedEmployees = form.employee_ids.length
        return {
            employees: employees.length,
            selectedEmployees,
            ownerReady: form.primary_owner_id ? 1 : 0,
        }
    }, [employees.length, form.employee_ids.length, form.primary_owner_id])

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mb-8 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-8 shadow-[0_40px_120px_rgba(2,6,23,0.7)]"
                >




                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Employee pool</p>
                                <p className="mt-3 text-3xl font-semibold text-white">{loading ? "-" : metrics.employees}</p>
                                <p className="mt-2 text-sm text-slate-400">Available employees fetched from the existing endpoint.</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Selection</p>
                                <p className="mt-3 text-3xl font-semibold text-white">{metrics.selectedEmployees}</p>
                                <p className="mt-2 text-sm text-slate-400">Employees currently selected for the next shared KPI.</p>
                            </div>
                        </div>
                        <div className="mt-8" >
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(true)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16"
                            >
                                <Plus size={16} />
                                Create Shared Goal
                            </button>

                    </div>
                </motion.section>

                <section className="mb-8 grid gap-5 xl:grid-cols-3">
                    <MetricCard title="Employees" value={loading ? "-" : metrics.employees} note="Total employees available for assignment." icon={Users} accent="#60a5fa" delay={0} />
                    <MetricCard title="Selected" value={metrics.selectedEmployees} note="Current assignment scope in the modal flow." icon={CheckCircle2} accent="#34d399" delay={0.08} />
                    <MetricCard title="Primary Owner" value={metrics.ownerReady ? "Ready" : "Pending"} note="A KPI owner should be set before final submission." icon={Target} accent="#a78bfa" delay={0.16} />
                </section>

                <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Assignment overview</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Team members ready for KPI allocation</h2>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[240px] items-center justify-center">
                            <div className="text-center">
                                <Loader2 size={28} className="mx-auto animate-spin text-cyan-300" />
                                <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">Loading employees</p>
                            </div>
                        </div>
                    ) : fetchError ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10">
                                <AlertCircle size={24} className="text-rose-300" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">Unable to load employees</h3>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{fetchError}</p>
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                <Users size={24} className="text-slate-500" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">No employees found</h3>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {employees.map((employee, index) => (
                                <motion.div
                                    key={employee.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.28, delay: index * 0.03 }}
                                    className={`rounded-2xl border p-4 ${form.employee_ids.includes(employee.id) ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/[0.03]"}`}
                                >
                                    <p className="text-sm font-medium text-white">{employee.name || employee.email || "Unnamed employee"}</p>
                                    <p className="mt-1 text-xs text-slate-400">{employee.email || "No email available"}</p>
                                    <p className="mt-1 text-xs text-slate-400">Employee ID: {employee.id}</p>
                                </motion.div>
                            ))}
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
                            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.7)]">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/80">Shared KPI editor</p>
                                        <h3 className="mt-2 text-2xl font-semibold text-white">Create and assign KPI</h3>
                                        <p className="mt-1 text-sm text-slate-400">Use the same modal-driven creation pattern as the goals page.</p>
                                    </div>
                                    <button
                                        onClick={resetForm}
                                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={submitShared} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Title" full>
                                            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClasses} placeholder="Shared KPI title" />
                                        </Field>
                                        <Field label="Description" full>
                                            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClasses} placeholder="Description" />
                                        </Field>
                                        <Field label="Thrust Area">
                                            <input value={form.thrust_area} onChange={(e) => setForm({ ...form, thrust_area: e.target.value })} className={inputClasses} placeholder="Thrust area" />
                                        </Field>
                                        <Field label="UOM">
                                            <select value={form.uom} onChange={(e) => setForm({ ...form, uom: e.target.value })} className={inputClasses}>
                                                <option value="">Select UOM</option>
                                                <option value="min">Min</option>
                                                <option value="max">Max</option>
                                                <option value="zero">Zero</option>
                                            </select>
                                        </Field>
                                        <Field label="Target Value">
                                            <input
                                                type="number"
                                                required
                                                min="0" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} className={inputClasses} placeholder="Target value" />
                                        </Field>
                                        <Field label="Weightage">
                                            <input
                                                type="number"
                                                required
                                                min="10"
                                                max="100" value={form.weightage} onChange={(e) => setForm({ ...form, weightage: e.target.value })} className={inputClasses} placeholder="Weightage %" />
                                        </Field>
                                        <Field label="Primary Owner" full>
                                            <select value={form.primary_owner_id} onChange={(e) => setForm({ ...form, primary_owner_id: e.target.value })} className={inputClasses}>
                                                <option value="">Select Primary Owner</option>
                                                {employees.map((employee) => (
                                                <option key={employee.id} value={employee.id}>
                                                    {getEmployeeLabel(employee)}
                                                </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>

                                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                        <div className="mb-4">
                                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Employee Selection</p>
                                            <p className="mt-2 text-sm text-slate-400">Choose the employees who should receive this shared KPI.</p>
                                        </div>
                                        {loading ? (
                                            <div className="flex min-h-[200px] items-center justify-center">
                                                <Loader2 size={22} className="animate-spin text-cyan-300" />
                                            </div>
                                        ) : fetchError ? (
                                            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
                                                {fetchError}
                                            </p>
                                        ) : employees.length === 0 ? (
                                            <p className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-400">
                                                No employees available for shared KPI assignment.
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {employees.map((employee) => (
                                                    <label
                                                        key={employee.id}
                                                        className={`flex items-start gap-3 rounded-2xl border p-3 transition ${form.employee_ids.includes(employee.id) ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-slate-950/45"}`}
                                                    >
                                                        <input type="checkbox" checked={form.employee_ids.includes(employee.id)} onChange={() => toggleEmployee(employee.id)} className="mt-0.5 h-4 w-4 flex-none accent-cyan-400" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-white">{employee.name || employee.email || `Employee ${employee.id}`}</p>
                                                            {employee.email && employee.name ? (
                                                                <p className="mt-1 text-xs text-slate-400">{employee.email}</p>
                                                            ) : null}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 xl:col-span-2">
                                        <button type="button" onClick={resetForm} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16 disabled:opacity-60">
                                            {submitting && <Loader2 size={15} className="animate-spin" />}
                                            Assign KPI
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
