import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import {
    createGoal,
    getPendingGoals,
    getEmployeeGoals,
    getGoals,
    approveGoal,
    rejectGoal
} from "../api/goalApi"

function Goals() {

    const [goals, setGoals] = useState([])
    const role = localStorage.getItem("role")


    const [formData, setFormData] = useState({

        title: "",
        description: "",
        thrust_area: "",
        uom: "",
        target_value: "",
        weightage: "",
        manager_email: "",



    })



    const fetchGoals = async () => {

        try {

            const role = localStorage.getItem("role")

            let data = []

            if (role === "employee") {

                data = await getEmployeeGoals()

            } else if (role === "manager") {

                data = await getPendingGoals()

            } else if (role === "admin") {

                data = await getGoals()
            }

            setGoals(data)

        } catch (error) {

            console.log(error)
        }
    }
    useEffect(() => {

        fetchGoals()

    }, [])
    const handleApprove = async (goalId) => {

        try {

            await approveGoal(goalId)

            alert("Goal Approved")

            fetchGoals()

        } catch (error) {

            console.log(error)

            alert("Approval Failed")
        }
    }
    const handleReject = async (goalId) => {

        try {

            await rejectGoal(goalId)

            alert("Goal Rejected")

            fetchGoals()

        } catch (error) {

            console.log(error)

            alert("Rejection Failed")
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

            await createGoal({

                ...formData,

                target_value: Number(formData.target_value),

                weightage: Number(formData.weightage),
            })

            alert("Goal Created Successfully")

            setFormData({

                title: "",
                description: "",
                thrust_area: "",
                uom: "",
                target_value: "",
                weightage: "",
                manager_email: "",

            })

            fetchGoals()

        } catch (error) {

            console.log(error)

            alert("Goal Creation Failed")
        }
    }

    return (

        <MainLayout>

            <h1 className="text-4xl font-bold mb-8">
                Goals Management
            </h1>

            {role === "employee" && (

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow mb-10"
                >

                <div className="grid grid-cols-2 gap-4">

                    <input
                        type="text"
                        name="title"
                        placeholder="Goal Title"
                        className="border p-3 rounded"
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        className="border p-3 rounded"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="thrust_area"
                        placeholder="Thrust Area"
                        className="border p-3 rounded"
                        value={formData.thrust_area}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="uom"
                        placeholder="UOM"
                        className="border p-3 rounded"
                        value={formData.uom}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="target_value"
                        placeholder="Target Value"
                        className="border p-3 rounded"
                        value={formData.target_value}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="weightage"
                        placeholder="Weightage"
                        className="border p-3 rounded"
                        value={formData.weightage}
                        onChange={handleChange}
                    />

                    <input
                        type="email"
                        name="manager_email"
                        placeholder="Manager Email"
                        className="border p-3 rounded"
                        value={formData.manager_email}
                        onChange={handleChange}
                    />

                </div>

                <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded mt-6"
                >
                    Create Goal
                </button>

            </form>

            )}

            <div className="bg-white p-6 rounded-xl shadow">

                <h2 className="text-2xl font-bold mb-6">
                    Goals List
                </h2>

                <table className="w-full">

                    <thead>

                    <tr className="border-b">

                        <th className="text-left py-3">
                            Title
                        </th>

                        <th className="text-left py-3">Description</th>

                        <th className="text-left py-3">
                            Thrust Area
                        </th>

                        <th className="text-left py-3">
                            Status
                        </th>

                        <th className="text-left py-3">
                            Weightage
                        </th>

                        <th className="text-left py-3">
                            Manager
                        </th>

                        {role === "admin" && (
                            <th className="text-left py-3">
                                Employee
                            </th>
                        )}
                        {role === "manager" && (
                            <th className="text-left py-3">
                                Actions
                            </th>
                        )}




                    </tr>

                    </thead>

                    <tbody>

                    {goals.map((goal) => (

                        <tr
                            key={goal.id}
                            className="border-b"
                        >

                            <td className="py-3">
                                {goal.title}
                            </td>

                            <td className="py-3">
                                {goal.description}
                            </td>

                            <td className="py-3">
                                {goal.thrust_area}
                            </td>

                            <td className="py-3">
                                {goal.status}
                            </td>

                            <td className="py-3">
                                {goal.weightage}
                            </td>
                            <td className="py-3">
                                {goal.manager_email}
                            </td>

                            {role === "admin" && (
                                <td className="py-3">
                                    {goal.employee_email}
                                </td>
                            )}
                            {role === "manager" && (

                                <td className="py-3 flex gap-2">

                                    <button
                                        onClick={() => handleApprove(goal.id)}
                                        className="bg-green-600 text-white px-4 py-1 rounded"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => handleReject(goal.id)}
                                        className="bg-red-600 text-white px-4 py-1 rounded"
                                    >
                                        Reject
                                    </button>

                                </td>
                            )}

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        </MainLayout>
    )
}

export default Goals