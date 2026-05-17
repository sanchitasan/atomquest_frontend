// src/pages/AuditLogs.jsx - COMPLETE MODERNIZED VERSION
import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { getAuditLogs } from "../api/auditApi"
import { History, Calendar, User, Shield, FileText, ArrowRight } from "lucide-react"

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
    if (value == null || value === "") return "—"

    const snapshot = parseSnapshot(value)
    if (snapshot) {
        return Object.entries(snapshot)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ")
    }

    return value
}

function formatTimestamp(timestamp) {
    if (!timestamp) return "—"
    const date = new Date(timestamp)
    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

function formatEntity(log) {
    if (!log.entity) return "—"
    if (log.entity_id != null) return `${log.entity} #${log.entity_id}`
    return log.entity
}

function getActionConfig(action) {
    switch (action?.toLowerCase()) {
        case "create":
            return {
                color: "text-green-600",
                bg: "bg-green-100",
                border: "border-green-200",
                label: "✓ Created",
                icon: "+"
            }
        case "update":
            return {
                color: "text-blue-600",
                bg: "bg-blue-100",
                border: "border-blue-200",
                label: "✎ Updated",
                icon: "~"
            }
        case "delete":
            return {
                color: "text-red-600",
                bg: "bg-red-100",
                border: "border-red-200",
                label: "✕ Deleted",
                icon: "−"
            }
        case "approve":
            return {
                color: "text-emerald-600",
                bg: "bg-emerald-100",
                border: "border-emerald-200",
                label: "✓ Approved",
                icon: "✓"
            }
        case "reject":
            return {
                color: "text-orange-600",
                bg: "bg-orange-100",
                border: "border-orange-200",
                label: "✗ Rejected",
                icon: "✗"
            }
        case "submit":
            return {
                color: "text-purple-600",
                bg: "bg-purple-100",
                border: "border-purple-200",
                label: "→ Submitted",
                icon: "→"
            }
        default:
            return {
                color: "text-gray-600",
                bg: "bg-gray-100",
                border: "border-gray-200",
                label: action || "Unknown",
                icon: "•"
            }
    }
}

function getRoleConfig(role) {
    switch (role?.toLowerCase()) {
        case "admin":
            return {
                color: "text-red-600",
                bg: "bg-red-100",
                border: "border-red-200",
                label: "🔐 Admin"
            }
        case "manager":
            return {
                color: "text-blue-600",
                bg: "bg-blue-100",
                border: "border-blue-200",
                label: "👔 Manager"
            }
        case "employee":
            return {
                color: "text-green-600",
                bg: "bg-green-100",
                border: "border-green-200",
                label: "👤 Employee"
            }
        default:
            return {
                color: "text-gray-600",
                bg: "bg-gray-100",
                border: "border-gray-200",
                label: role || "Unknown"
            }
    }
}

function AuditLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterAction, setFilterAction] = useState("")
    const [filterRole, setFilterRole] = useState("")

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const data = await getAuditLogs()
            setLogs(Array.isArray(data) ? data : [])
        } catch (error) {
            console.log(error)
            const errorMsg = document.createElement('div')
            errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            errorMsg.textContent = 'Failed to load audit logs'
            document.body.appendChild(errorMsg)
            setTimeout(() => errorMsg.remove(), 3000)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        const actionMatch = !filterAction || log.action?.toLowerCase().includes(filterAction.toLowerCase())
        const roleMatch = !filterRole || log.role?.toLowerCase().includes(filterRole.toLowerCase())
        return actionMatch && roleMatch
    })

    return (
        <MainLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2" data-testid="auditlogs-title">
                    Audit Logs
                </h1>
                <p className="text-gray-600">System activity and change tracking</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FileText className="text-white" size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
                </div>

                <div className="gap-6">


                    {/* Role Filter */}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Filter by Role</label>
                        <input
                            type="text"
                            placeholder="e.g., admin, manager, employee..."
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            data-testid="auditlog-role-filter"
                        />
                    </div>
                </div>

                {(filterAction || filterRole) && (
                    <button
                        onClick={() => {
                            setFilterAction("")
                            setFilterRole("")
                        }}
                        className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm font-semibold transition-all"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <History className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Activity Log</h2>
                            <p className="text-sm text-gray-600">{filteredLogs.length} entries</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500">Loading audit logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="text-gray-400" size={32} />
                        </div>
                        <p className="text-gray-500 text-lg font-medium mb-2">No Audit Logs Found</p>
                        <p className="text-gray-400 text-sm">
                            {filterAction || filterRole ? "Try adjusting your filters" : "No activity recorded yet"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Timestamp</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Action</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Entity</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Role</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Performed By</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Details</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Old Value</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-700">New Value</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLogs.map((log) => {
                                const actionConfig = getActionConfig(log.action)
                                const roleConfig = getRoleConfig(log.role)

                                return (
                                    <tr
                                        key={log.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors align-top"
                                        data-testid="auditlog-row"
                                    >
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-gray-600 font-medium">{formatTimestamp(log.timestamp)}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${actionConfig.bg} ${actionConfig.color} ${actionConfig.border} border`}>
                                                {actionConfig.label}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-medium text-xs">
                                                {formatEntity(log)}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border} border`}>
                                                {roleConfig.label}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-gray-800 font-medium">{log.performed_by ?? "—"}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap text-gray-600 text-xs">
                                            {log.employee_email ?? "—"}
                                        </td>

                                        <td className="py-4 px-4 text-gray-600 max-w-xs truncate">
                                            {log.details ?? "—"}
                                        </td>

                                        <td className="py-4 px-4">
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 max-w-xs text-xs text-gray-700">
                                                {formatCellValue(log.old_value) === "—" ? (
                                                    <span className="text-gray-400 italic">No previous value</span>
                                                ) : (
                                                    formatCellValue(log.old_value)
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-4 px-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 max-w-xs text-xs text-gray-700">
                                                {formatCellValue(log.new_value) === "—" ? (
                                                    <span className="text-gray-400 italic">No value</span>
                                                ) : (
                                                    formatCellValue(log.new_value)
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}

export default AuditLogs
