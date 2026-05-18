import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { getApiBaseUrl } from "../api/config"
import axios from "axios"

export default function SharedGoalOverview() {
    const BASE_URL = getApiBaseUrl()

    const [sharedGoals, setSharedGoals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSharedGoals()
    }, [])

    const fetchSharedGoals = async () => {
        try {
            const token = localStorage.getItem("token")

            const response = await axios.get(
                `${BASE_URL}/shared-goals/overview`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setSharedGoals(response.data || [])
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const statusStyles = {
        approved:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

        pending:
            "border-amber-400/20 bg-amber-400/10 text-amber-200",

        rejected:
            "border-rose-400/20 bg-rose-400/10 text-rose-200",

        draft:
            "border-slate-400/20 bg-slate-400/10 text-slate-300",
    }

    const averageProgress =
        sharedGoals.length > 0
            ? Math.round(
                sharedGoals.reduce(
                    (acc, item) => acc + item.progress,
                    0
                ) / sharedGoals.length
            )
            : 0

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[70vh] items-center justify-center text-white">
                    Loading collaboration workspace...
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="text-white">
                <div className="mx-auto">

                    {/* HEADER */}

                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <p className="text-cyan-300 text-sm uppercase tracking-[0.3em]">
                                Collaboration Workspace
                            </p>




                        </div>
                    </div>

                    {/* METRICS */}

                    <div className="mb-10 grid gap-6 md:grid-cols-3">

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <p className="text-sm text-slate-400">
                                Active Shared Goals
                            </p>

                            <h2 className="mt-3 text-4xl font-bold">
                                {sharedGoals.length}
                            </h2>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <p className="text-sm text-slate-400">
                                Total Contributors
                            </p>

                            <h2 className="mt-3 text-4xl font-bold">
                                {sharedGoals.reduce(
                                    (acc, item) =>
                                        acc +
                                        (item.members?.length || 0),
                                    0
                                )}
                            </h2>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <p className="text-sm text-slate-400">
                                Average Progress
                            </p>

                            <h2 className="mt-3 text-4xl font-bold">
                                {averageProgress}%
                            </h2>
                        </div>
                    </div>

                    {/* EMPTY STATE */}

                    {sharedGoals.length === 0 ? (
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">

                            <h3 className="text-2xl font-semibold text-white">
                                No collaborative Goals found
                            </h3>

                            <p className="mt-3 text-slate-400">
                                You are not assigned as a primary owner
                                for any shared Goal yet.
                            </p>
                        </div>
                    ) : (

                        <div className="space-y-8">

                            {sharedGoals.map((goal) => (

                                <div
                                    key={goal.id}
                                    className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
                                >

                                    {/* KPI HEADER */}

                                    <div className="border-b border-white/10 p-6">

                                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                                            <div>

                                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                                                    Shared Goal
                                                </div>

                                                <h2 className="mt-4 text-3xl font-bold text-white">
                                                    {goal.title}
                                                </h2>

                                                <p className="mt-2 text-slate-400">
                                                    {goal.thrustArea}
                                                </p>

                                                <p className="mt-3 text-sm text-cyan-300">
                                                    {goal.member_count} contributors linked
                                                </p>
                                            </div>

                                            {/* OVERALL KPI PROGRESS */}

                                            <div className="w-full max-w-sm">

                                                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                                                    <span>
                                                        Overall Progress
                                                    </span>

                                                    <span>
                                                        {goal.progress}%
                                                    </span>
                                                </div>

                                                <div className="h-4 overflow-hidden rounded-full bg-slate-800">

                                                    <div
                                                        className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa)]"
                                                        style={{
                                                            width: `${goal.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MEMBERS TABLE */}

                                    <div className="overflow-x-auto">

                                        <table className="min-w-full border-separate border-spacing-y-3 p-6">

                                            <thead>
                                            <tr>

                                                {[
                                                    "Employee",
                                                    "Role",
                                                    "Quarter",
                                                    "Progress",
                                                    "Status",
                                                    "Collaboration State",
                                                ].map((head) => (

                                                    <th
                                                        key={head}
                                                        className="px-6 py-4 text-left text-xs uppercase tracking-[0.25em] text-slate-500"
                                                    >
                                                        {head}
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>

                                            <tbody>

                                            {(goal.members || []).map(
                                                (member, idx) => (

                                                    <tr key={idx}>

                                                        {/* EMPLOYEE */}

                                                        <td className="rounded-l-2xl border-y border-l border-white/10 bg-white/[0.03] px-6 py-5">

                                                            <div>
                                                                <h3 className="font-semibold text-white">
                                                                    {member.name}
                                                                </h3>

                                                                <p className="mt-1 text-sm text-slate-400">
                                                                    {member.email}
                                                                </p>
                                                            </div>
                                                        </td>

                                                        {/* ROLE */}

                                                        <td className="border-y border-white/10 bg-white/[0.03] px-6 py-5">

                                                            {member.owner ? (

                                                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                                                                        Primary Owner
                                                                    </span>

                                                            ) : (

                                                                <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs text-slate-300">
                                                                        Contributor
                                                                    </span>
                                                            )}
                                                        </td>

                                                        {/* QUARTER */}

                                                        <td className="border-y border-white/10 bg-white/[0.03] px-6 py-5 text-slate-300">
                                                            {member.quarter}
                                                        </td>

                                                        {/* PROGRESS */}

                                                        <td className="border-y border-white/10 bg-white/[0.03] px-6 py-5">

                                                            <div className="flex min-w-[200px] items-center gap-4">

                                                                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">

                                                                    <div
                                                                        className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa)]"
                                                                        style={{
                                                                            width: `${member.progress}%`,
                                                                        }}
                                                                    />
                                                                </div>

                                                                <span className="text-sm text-white">
                                                                        {member.progress}%
                                                                    </span>
                                                            </div>
                                                        </td>

                                                        {/* STATUS */}

                                                        <td className="border-y border-white/10 bg-white/[0.03] px-6 py-5">

                                                                <span
                                                                    className={`rounded-full border px-3 py-1 text-xs capitalize ${statusStyles[member.status]}`}
                                                                >
                                                                    {member.status}
                                                                </span>
                                                        </td>

                                                        {/* COLLABORATION STATE */}

                                                        <td className="rounded-r-2xl border-y border-r border-white/10 bg-white/[0.03] px-6 py-5">

                                                            {member.status === "approved" &&
                                                                member.progress >= 70 && (

                                                                    <span className="text-emerald-300 text-sm font-medium">
                                                                        On Track
                                                                    </span>
                                                                )}

                                                            {member.status === "pending" && (

                                                                <span className="text-amber-300 text-sm font-medium">
                                                                        Pending Updates
                                                                    </span>
                                                            )}

                                                            {member.status === "rejected" && (

                                                                <span className="text-rose-300 text-sm font-medium">
                                                                        Needs Attention
                                                                    </span>
                                                            )}

                                                            {member.progress < 40 && (

                                                                <span className="text-rose-300 text-sm font-medium">
                                                                        At Risk
                                                                    </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}