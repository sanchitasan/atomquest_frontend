import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"

import {
    createCheckIn,
    getCheckIns
} from "../api/checkinApi"

import {
    getEmployeeGoals
} from "../api/goalApi"

function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case "approved":
        case "on_track":
            return "text-green-600"
        case "pending":
        case "submitted":
            return "text-amber-600"
        case "rejected":
        case "behind":
            return "text-red-600"
        default:
            return "text-gray-600"
    }
}

function Checkins() {

    const [checkins, setCheckins] = useState([])
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)

    const role = localStorage.getItem("role")

    const [formData, setFormData] = useState({

        quarter: "",
        planned_value: "",
        actual_value: "",
        employee_comment: "",
        goal_id: ""
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

            alert(
                error.response?.data?.detail ||
                "Failed to fetch check-ins"
            )
        }
    }

    const fetchGoals = async () => {

        try {

            const data = await getEmployeeGoals()

            const approvedGoals = (Array.isArray(data) ? data : []).filter(
                goal => goal.status === "approved"
            )

            setGoals(approvedGoals)

        } catch (error) {

            console.log(error)
        }
    }

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {

        e.preventDefault()

        try {

            await createCheckIn({

                quarter: formData.quarter,
                planned_value: Number(formData.planned_value),
                actual_value: Number(formData.actual_value),
                employee_comment: formData.employee_comment,
                goal_id: Number(formData.goal_id)
            })

            alert("Check-in submitted")

            setFormData({

                quarter: "",
                planned_value: "",
                actual_value: "",
                employee_comment: "",
                goal_id: ""
            })

            fetchCheckIns()

        } catch (error) {

            console.log(error)

            alert(
                error.response?.data?.detail ||
                "Check-in submission failed"
            )
        }
    }

    const getGoalTitle = (goalId) => {

        return goals.find(goal => goal.id === goalId)?.title || "N/A"
    }

    return (

        <MainLayout>

            <h1 className="text-4xl font-bold mb-8">
                Check-ins
            </h1>

            {role === "employee" && (

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow mb-10"
                >

                    <h2 className="text-2xl font-bold mb-6">
                        Submit Check-in
                    </h2>

                    <div className="grid grid-cols-2 gap-4">

                        <input
                            type="text"
                            name="quarter"
                            placeholder="Quarter (e.g. Q1 2026)"
                            className="border p-3 rounded"
                            value={formData.quarter}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="goal_id"
                            className="border p-3 rounded"
                            value={formData.goal_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Goal</option>

                            {goals.map(goal => (

                                <option key={goal.id} value={goal.id}>
                                    {goal.title}
                                </option>

                            ))}

                        </select>

                        <input
                            type="number"
                            name="planned_value"
                            placeholder="Planned Value"
                            className="border p-3 rounded"
                            value={formData.planned_value}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            name="actual_value"
                            placeholder="Actual Value"
                            className="border p-3 rounded"
                            value={formData.actual_value}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="employee_comment"
                            placeholder="Comment"
                            className="border p-3 rounded col-span-2"
                            value={formData.employee_comment}
                            onChange={handleChange}
                        />

                    </div>

                    <button
                        type="submit"
                        className="bg-black text-white px-6 py-3 rounded mt-6"
                    >
                        Submit Check-in
                    </button>

                </form>

            )}

            <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">

                <h2 className="text-2xl font-bold mb-6">
                    Check-in History
                </h2>

                {loading ? (

                    <p className="text-gray-500">
                        Loading check-ins...
                    </p>

                ) : checkins.length === 0 ? (

                    <p className="text-gray-500">
                        No check-ins found.
                    </p>

                ) : (

                    <table className="w-full text-sm">

                        <thead>

                            <tr className="border-b">

                                <th className="text-left py-3 px-3">
                                    Quarter
                                </th>

                                <th className="text-left py-3 px-3">
                                    Goal
                                </th>

                                <th className="text-left py-3 px-3">
                                    Planned
                                </th>

                                <th className="text-left py-3 px-3">
                                    Actual
                                </th>

                                <th className="text-left py-3 px-3">
                                    Progress
                                </th>

                                <th className="text-left py-3 px-3">
                                    Status
                                </th>

                                <th className="text-left py-3 px-3">
                                    Comment
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {checkins.map((checkin) => (

                                <tr
                                    key={checkin.id}
                                    className="border-b hover:bg-gray-50"
                                >

                                    <td className="py-4 px-3">
                                        {checkin.quarter}
                                    </td>

                                    <td className="py-4 px-3 font-medium">
                                        {getGoalTitle(checkin.goal_id)}
                                    </td>

                                    <td className="py-4 px-3">
                                        {checkin.planned_value}
                                    </td>

                                    <td className="py-4 px-3">
                                        {checkin.actual_value}
                                    </td>

                                    <td className="py-4 px-3">

                                        <div className="w-full bg-gray-200 rounded-full h-4">

                                            <div
                                                className="bg-black h-4 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(checkin.progress_score ?? 0, 100)}%`
                                                }}
                                            ></div>

                                        </div>

                                        <span className="text-sm font-medium">
        {checkin.progress_score ?? 0}%
    </span>

                                    </td>

                                    <td className={`py-4 px-3 font-semibold capitalize ${getStatusColor(checkin.status)}`}>
                                        {checkin.status ?? "—"}
                                    </td>

                                    <td className="py-4 px-3 max-w-xs">
                                        {checkin.employee_comment ?? "—"}
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

export default Checkins
