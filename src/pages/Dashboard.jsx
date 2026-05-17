import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import { getDashboardStats } from "../api/reportApi"

function Dashboard() {

    const [stats, setStats] = useState(null)

    useEffect(() => {

        fetchDashboardStats()

    }, [])

    const fetchDashboardStats = async () => {

        try {

            const data = await getDashboardStats()

            setStats(data)

        } catch (error) {

            console.log(error)
        }
    }

    if (!stats) {

        return (

            <MainLayout>

                <h1 className="text-3xl font-bold">
                    Loading Dashboard...
                </h1>

            </MainLayout>
        )
    }

    return (

        <MainLayout>

            <h1 className="text-4xl font-bold mb-8">
                Dashboard
            </h1>

            <div className="grid grid-cols-4 gap-6">

                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-gray-500">
                        Total Goals
                    </h2>

                    <p className="text-3xl font-bold mt-2">
                        {stats.total_goals}
                    </p>

                </div>

                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-gray-500">
                        Approved Goals
                    </h2>

                    <p className="text-3xl font-bold mt-2">
                        {stats.approved_goals}
                    </p>

                </div>

                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-gray-500">
                        Pending Goals
                    </h2>

                    <p className="text-3xl font-bold mt-2">
                        {stats.pending_goals}
                    </p>

                </div>

                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-gray-500">
                        Rejected Goals
                    </h2>

                    <p className="text-3xl font-bold mt-2">
                        {stats.rejected_goals}
                    </p>

                </div>
                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-gray-500">
                        Average Progress
                    </h2>

                    <p className="text-3xl font-bold mt-2">
                        {stats.average_progress?.toFixed(1)}%
                    </p>

                </div>

            </div>

        </MainLayout>
    )
}

export default Dashboard