import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import {
    createCheckIn,
    getCheckIns
} from "../api/checkinApi"

import {
    getEmployeeGoals
} from "../api/goalApi"

function Checkins() {

    const [checkins, setCheckins] = useState([])

    const [goals, setGoals] = useState([])

    const role = localStorage.getItem("role")

    const [formData, setFormData] = useState({

        quarter: "",

        progress: "",

        goal_id: ""
    })

    useEffect(() => {

        fetchCheckIns()

        fetchGoals()

    }, [])

    const fetchCheckIns = async () => {

        try {

            const data = await getCheckIns()

            setCheckins(data)

        } catch (error) {

            console.log(error)
        }
    }

    const fetchGoals = async () => {

        try {

            const data = await getEmployeeGoals()

            const approvedGoals = data.filter(
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

                ...formData,

                progress: Number(formData.progress),

                goal_id: Number(formData.goal_id)
            })

            alert("Check-In Submitted")

            setFormData({

                quarter: "",

                progress: "",

                goal_id: ""
            })

            fetchCheckIns()

        } catch (error) {

            console.log(error)

            alert("Check-In Failed")
        }
    }

    return (

        <MainLayout>

            <h1 className="text-4xl font-bold mb-8">
                Check-Ins
            </h1>

            {role === "employee" && (

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow mb-10"
                >

                    <div className="grid grid-cols-2 gap-4">

                        <select
                            name="goal_id"
                            className="border p-3 rounded"
                            value={formData.goal_id}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Goal
                            </option>

                            {goals.map((goal) => (

                                <option
                                    key={goal.id}
                                    value={goal.id}
                                >
                                    {goal.title}
                                </option>

                            ))}

                        </select>

                        <select
                            name="quarter"
                            className="border p-3 rounded"
                            value={formData.quarter}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Quarter
                            </option>

                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                            <option value="Q3">Q3</option>
                            <option value="Q4">Q4</option>

                        </select>

                        <input
                            type="number"
                            name="progress"
                            placeholder="Progress %"
                            className="border p-3 rounded"
                            value={formData.progress}
                            onChange={handleChange}
                        />

                    </div>

                    <button
                        type="submit"
                        className="bg-black text-white px-6 py-3 rounded mt-6"
                    >
                        Submit Check-In
                    </button>

                </form>

            )}

            <div className="bg-white p-6 rounded-xl shadow">

                <h2 className="text-2xl font-bold mb-6">
                    Check-In History
                </h2>

                <table className="w-full">

                    <thead>

                    <tr className="border-b">

                        <th className="text-left py-3">
                            Quarter
                        </th>

                        <th className="text-left py-3">
                            Progress
                        </th>

                        <th className="text-left py-3">
                            Goal Title
                        </th>

                    </tr>

                    </thead>

                    <tbody>

                    {checkins.map((checkin) => (

                        <tr
                            key={checkin.id}
                            className="border-b"
                        >
                            <td className="py-3">
                                {checkin.quarter}
                            </td>

                            <td className="py-3">
                                {checkin.progress}%
                            </td>
                            <td className="py-3">

                                {
                                    goals.find(
                                        goal => goal.id === checkin.goal_id
                                    )?.title || "N/A"
                                }

                            </td>


                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        </MainLayout>
    )
}

export default Checkins