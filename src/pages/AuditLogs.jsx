import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layouts/MainLayout"
import { getAuditLogs } from "../api/auditApi"
import { getApiErrorMessage } from "../api/config"
import {
    AlertCircle,
    Calendar,
    FileSearch,
    Filter,
    RefreshCcw,
    Shield,
    User,
} from "lucide-react"

function parseSnapshot(value) {
    if (!value || typeof value !== "string") return null

    const trimmed = value.trim()
    if (!trimmed.includes("Title:") && !trimmed.includes("\n")) return null

    const fields = {}
    for (const line of trimmed.split("\n")) {
        const colonIndex = line.indexOf(":")
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim()
            const val = line.slice(colonIndex + 1).trim()
            if (key) fields[key] = val
        }
    }

    return Object.keys(fields).length > 0 ? fields : null
}

function formatCellValue(value) {
    if (value == null || value === "") return "No value"

    const snapshot = parseSnapshot(value)
    if (snapshot) {
        return Object.entries(snapshot)
            .map(([key, val]) => `${key}: ${val}`)
            .join(" | ")
    }

    return String(value)
}

function formatTimestamp(timestamp) {
    if (!timestamp) return "No timestamp"
    const date = new Date(timestamp)
    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

function formatEntity(log) {
    if (!log.entity) return "Unknown entity"
    if (log.entity_id != null) return `${log.entity} #${log.entity_id}`
    return log.entity
}

function getActionTone(action) {
    switch (action?.toLowerCase()) {
        case "create":
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        case "update":
            return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
        case "delete":
            return "border-rose-400/20 bg-rose-400/10 text-rose-200"
        case "approve":
            return "border-green-400/20 bg-green-400/10 text-green-200"
        case "reject":
            return "border-amber-400/20 bg-amber-400/10 text-amber-200"
        case "submit":
            return "border-violet-400/20 bg-violet-400/10 text-violet-200"
        default:
            return "border-white/10 bg-white/[0.04] text-slate-300"
    }
}

function getRoleTone(role) {
    switch (role?.toLowerCase()) {
        case "admin":
            return "border-rose-400/20 bg-rose-400/10 text-rose-200"
        case "manager":
            return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
        case "employee":
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        default:
            return "border-white/10 bg-white/[0.04] text-slate-300"
    }
}

function AuditLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filterAction, setFilterAction] = useState("")
    const [filterRole, setFilterRole] = useState("")

    useEffect(() => {
        fetchLogs()
    }, [])

    async function fetchLogs() {
        try {
            setLoading(true)
            setError("")
            const data = await getAuditLogs()
            setLogs(Array.isArray(data) ? data : [])
        } catch (fetchError) {
            console.log(fetchError)
            setLogs([])
            setError(getApiErrorMessage(fetchError, "Failed to load governance audit logs"))
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = useMemo(
        () =>
            logs.filter((log) => {
                const actionMatch = !filterAction || log.action?.toLowerCase().includes(filterAction.toLowerCase())
                const roleMatch = !filterRole || log.role?.toLowerCase().includes(filterRole.toLowerCase())
                return actionMatch && roleMatch
            }),
        [logs, filterAction, filterRole]
    )

    return (
        <MainLayout>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                    <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>
                <section className="mb-8 rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Governance filters</p>
                            </div>
                        <button
                            type="button"
                            onClick={fetchLogs}
                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16"
                        >
                            <RefreshCcw size={15} />
                            Refresh
                        </button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                        <label>
                            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Action</span>
                            <input
                                type="text"
                                placeholder="create, approve, reject..."
                                value={filterAction}
                                onChange={(event) => setFilterAction(event.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                            />
                        </label>
                        <label>
                            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Role</span>
                            <input
                                type="text"
                                placeholder="admin, manager, employee..."
                                value={filterRole}
                                onChange={(event) => setFilterRole(event.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                                data-testid="auditlog-role-filter"
                            />
                        </label>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setFilterAction("")
                                    setFilterRole("")
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
                            >
                                <Filter size={15} />
                                Clear
                            </button>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="mb-6 flex items-start justify-between gap-4">

                            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Audit stream</p>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                            <p className="text-sm font-medium text-white">{filteredLogs.length} entries</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[320px] items-center justify-center">
                            <div className="text-center">
                                <RefreshCcw size={28} className="mx-auto animate-spin text-cyan-300" />
                                <p className="mt-4 text-sm uppercase tracking-[0.26em] text-slate-500">Loading governance trail</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10">
                                <AlertCircle size={24} className="text-rose-300" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">Unable to load governance audit log</h3>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{error}</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                <FileSearch size={24} className="text-slate-500" />
                            </div>
                            <h3 className="mt-5 text-xl font-medium text-white">No audit records found</h3>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                                {filterAction || filterRole ? "Adjust the active filters to broaden the governance results." : "The audit endpoint has not returned any activity yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredLogs.map((log, index) => (
                                <motion.article
                                    key={log.id ?? `${log.timestamp}-${index}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.28, delay: index * 0.02 }}
                                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                                    data-testid="auditlog-row"
                                >
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getActionTone(log.action)}`}>
                                                    {log.action || "Unknown action"}
                                                </span>
                                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getRoleTone(log.role)}`}>
                                                    {log.role || "Unknown role"}
                                                </span>

                                            </div>

                                            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                                                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Calendar size={14} />
                                                        <span className="text-xs uppercase tracking-[0.24em]">Timestamp</span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-white">{formatTimestamp(log.timestamp)}</p>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <User size={14} />
                                                        <span className="text-xs uppercase tracking-[0.24em]">Performed By</span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-white">{log.performed_by ?? "Unknown user"}</p>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Shield size={14} />
                                                        <span className="text-xs uppercase tracking-[0.24em]">Employee</span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-white">{log.employee_email ?? "Not linked"}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Details</p>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">{log.details ?? "No additional detail provided."}</p>
                                            </div>
                                        </div>

                                        <div className="grid min-w-0 gap-4 xl:w-[34rem]">
                                            <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-4">
                                                <p className="text-xs uppercase tracking-[0.24em] text-rose-200/80">Previous Value</p>
                                                <p className="mt-3 text-sm leading-6 text-slate-200 break-words">{formatCellValue(log.old_value)}</p>
                                            </div>
                                            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                                                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Current Value</p>
                                                <p className="mt-3 text-sm leading-6 text-slate-200 break-words">{formatCellValue(log.new_value)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </MainLayout>
    )
}

export default AuditLogs
