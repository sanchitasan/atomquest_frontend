import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import {
    getDashboardStats,
    getCompletionDashboard,
    getGovernanceAudit,
    downloadAchievementReport
} from "../api/reportApi"

function Reports() {

    const [dashboardStats, setDashboardStats] = useState(null)

    const [completionData, setCompletionData] = useState(null)

    const [governanceLogs, setGovernanceLogs] = useState([])

    useEffect(() => {

        fetchDashboardStats()

        fetchCompletionDashboard()

        fetchGovernanceAudit()

    }, [])

    const fetchDashboardStats = async () => {

        try {

            const data = await getDashboardStats()

            setDashboardStats(data)

        } catch (error) {

            console.log(error)
        }
    }

    const fetchCompletionDashboard = async () => {

        try {

            const data = await getCompletionDashboard()

            setCompletionData(data)        } catch (error) {

            console.log(error)
        }
    }

    const fetchGovernanceAudit = async () => {

        try {

            const data = await getGovernanceAudit()

            setGovernanceLogs(data)

        } catch (error) {

            console.log(error)
        }
    }

    return (

        <MainLayout>

            <div className="flex justify-between items-center mb-8">

                <h1 className="text-4xl font-bold">
                    Reports & Governance
                </h1>

                <button
                    onClick={downloadAchievementReport}
                    className="bg-black text-white px-6 py-3 rounded"
                >
                    Export Achievement Report
                </button>

            </div>

            <div className="grid grid-cols-4 gap-6 mb-10">

                <div className="bg-white p-6 rounded-xl shadow">

                    <h3 className="text-gray-500 text-sm mb-2">
                        Total Goals
                    </h3>

                    <p className="text-3xl font-bold">
                        {dashboardStats?.total_goals || 0}
                    </p>

                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-gray-500 text-sm mb-2">
                        Approved Goals
                    </h3>

                    <p className="text-3xl font-bold text-green-600">
                        {dashboardStats?.approved_goals || 0}
                    </p>

                </div>

                <div className="bg-white p-6 rounded-xl shadow">

                    <h3 className="text-gray-500 text-sm mb-2">
                        Pending Goals
                    </h3>

                    <p className="text-3xl font-bold text-yellow-600">
                        {dashboardStats?.pending_goals || 0}
                    </p>

                </div>

                <div className="bg-white p-6 rounded-xl shadow">

                    <h3 className="text-gray-500 text-sm mb-2">
                        Average Progress
                    </h3>

                    <p className="text-3xl font-bold text-blue-600">
                        {Math.round(dashboardStats?.average_progress || 0)}%
                    </p>

                </div>

            </div>

            <div className="bg-white p-6 rounded-xl shadow mb-10">

                <h2 className="text-2xl font-bold mb-6">
                    Completion Dashboard
                </h2>

                <div className="grid grid-cols-4 gap-6">

                    <div className="border p-6 rounded-xl">

                        <h3 className="text-gray-500 mb-2">
                            Total Employees
                        </h3>
                        <p className="text-3xl font-bold">
                            {completionData?.total_employees || 0}
                        </p>

                    </div>

                    <div className="border p-6 rounded-xl">

                        <h3 className="text-gray-500 mb-2">
                            Completed CheckIns
                        </h3>

                        <p className="text-3xl font-bold text-green-600">
                            {
                                completionData?.employees_completed_checkins || 0
                            }
                        </p>

                    </div>

                    <div className="border p-6 rounded-xl">

                        <h3 className="text-gray-500 mb-2">
                            Managers
                        </h3>

                        <p className="text-3xl font-bold text-blue-600">
                            {completionData?.total_managers || 0}
                        </p>

                    </div>

                    <div className="border p-6 rounded-xl">

                        <h3 className="text-gray-500 mb-2">
                            Pending Approvals
                        </h3>

                        <p className="text-3xl font-bold text-red-500">
                            {completionData?.pending_goals || 0}
                        </p>

                    </div>

                </div>

            </div>

            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold mb-6">
                    Governance Audit Trail
                </h2>

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                        <tr className="border-b bg-gray-100">

                            <th className="text-left py-3 px-3">
                                Timestamp
                            </th>

                            <th className="text-left py-3 px-3">
                                Performed By
                            </th>

                            <th className="text-left py-3 px-3">
                                Action
                            </th>

                            <th className="text-left py-3 px-3">
                                Entity
                            </th>

                            <th className="text-left py-3 px-3">
                                Details
                            </th>

                        </tr>

                        </thead>

                        <tbody>

                        {governanceLogs.map((log) => (

                            <tr
                                key={log.id}
                                className="border-b"
                            >

                                <td className="py-4 px-3">
                                    {
                                        new Date(
                                            log.timestamp
                                        ).toLocaleString()
                                    }
                                </td>

                                <td className="py-4 px-3">
                                    {log.performed_by}
                                </td>

                                <td className="py-4 px-3 font-medium">
                                    {log.action}
                                </td>

                                <td className="py-4 px-3">
                                    {log.entity}
                                </td>

                                <td className="py-4 px-3 max-w-md whitespace-pre-wrap">
                                    {log.details}
                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </MainLayout>
    )
}

export default Reports
