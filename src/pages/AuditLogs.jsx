import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import { getAuditLogs } from "../api/auditApi"

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

function AuditLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

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
        } finally {
            setLoading(false)
        }
    }

    return (
        <MainLayout>
            <h1 className="text-4xl font-bold mb-8">Audit Logs</h1>

            <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
                {loading ? (
                    <p className="text-gray-500">Loading audit logs...</p>
                ) : logs.length === 0 ? (
                    <p className="text-gray-500">No audit logs found.</p>
                ) : (
                    <table className="w-full text-sm min-w-[1100px]">
                        <thead>
                            <tr className="border-b text-left text-gray-500">
                                <th className="py-3 pr-4 font-medium whitespace-nowrap">
                                    Timestamp
                                </th>
                                <th className="py-3 pr-4 font-medium whitespace-nowrap">
                                    Action
                                </th>
                                <th className="py-3 pr-4 font-medium whitespace-nowrap">
                                    Entity
                                </th>
                                <th className="py-3 pr-4 font-medium whitespace-nowrap">
                                    Role
                                </th>
                                <th className="py-3 pr-4 font-medium whitespace-nowrap">
                                    Performed By
                                </th>
                                <th className="py-3 pr-4 font-medium whitespace-nowrap">
                                    Employee
                                </th>
                                <th className="py-3 pr-4 font-medium min-w-[180px]">
                                    Details
                                </th>
                                <th className="py-3 pr-4 font-medium min-w-[160px]">
                                    Old Value
                                </th>
                                <th className="py-3 font-medium min-w-[160px]">
                                    New Value
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="border-b align-top hover:bg-gray-50"
                                >
                                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                                        {formatTimestamp(log.timestamp)}
                                    </td>
                                    <td className="py-3 pr-4 font-medium whitespace-nowrap">
                                        {log.action}
                                    </td>
                                    <td className="py-3 pr-4 whitespace-nowrap">
                                        {formatEntity(log)}
                                    </td>
                                    <td className="py-3 pr-4 capitalize whitespace-nowrap">
                                        {log.role ?? "—"}
                                    </td>
                                    <td className="py-3 pr-4 whitespace-nowrap">
                                        {log.performed_by ?? "—"}
                                    </td>
                                    <td className="py-3 pr-4 whitespace-nowrap">
                                        {log.employee_email ?? "—"}
                                    </td>
                                    <td className="py-3 pr-4 text-gray-600">
                                        {log.details ?? "—"}
                                    </td>
                                    <td className="py-3 pr-4 text-gray-500">
                                        {formatCellValue(log.old_value)}
                                    </td>
                                    <td className="py-3 text-gray-900">
                                        {formatCellValue(log.new_value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </MainLayout>
    )
}

export default AuditLogs
