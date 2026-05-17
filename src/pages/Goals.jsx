import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import {
    createGoal,
    getPendingGoals,
    getEmployeeGoals,
    getGoals,
    approveGoal,
    rejectGoal,
    submitGoals,
    editGoal,
    resubmitGoal,
    managerBulkUpdateGoals,
} from "../api/goalApi"

function Goals() {

    const [goals, setGoals] = useState([])
    const role = localStorage.getItem("role")
    const [editingGoalId, setEditingGoalId] = useState(null)
    const [managerEditMode, setManagerEditMode] = useState(false)


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
    const handleEdit = (goal) => {

        setEditingGoalId(goal.id)

        setFormData({

            title: goal.title,
            description: goal.description,
            thrust_area: goal.thrust_area,
            uom: goal.uom,
            target_value: goal.target_value,
            weightage: goal.weightage,
            manager_email: goal.manager_email,
        })
    }
    const handleManagerEdit = (goal) => {

        setManagerEditMode(true)

        setEditingGoalId(goal.id)

        setFormData({

            target_value: goal.target_value,
            weightage: goal.weightage,
        })
    }
    const handleManagerUpdate = async (e) => {

        e.preventDefault()

        try {

            await managerBulkUpdateGoals({

                employee_id: goals.find(
                    g => g.id === editingGoalId
                )?.employee_id,

                goals: goals.map(g => {

                    if (g.id === editingGoalId) {

                        return {
                            goal_id: g.id,
                            target_value: Number(formData.target_value),
                            weightage: Number(formData.weightage)
                        }
                    }

                    return {
                        goal_id: g.id,
                        target_value: g.target_value,
                        weightage: g.weightage
                    }
                })
            })

            alert("Goal Updated Successfully")

            setManagerEditMode(false)

            setEditingGoalId(null)

            fetchGoals()

        } catch (error) {

            console.log(error)

            alert(
                error.response?.data?.detail ||
                "Manager Update Failed"
            )
        }
    }
    const handleGoalSubmission = async () => {

        try {

            await submitGoals()

            alert("Goals Submitted Successfully")

            fetchGoals()

        } catch (error) {

            console.log(error)

            alert(
                error.response?.data?.detail ||
                "Goal Submission Failed"
            )
        }
    }
    const handleResubmit = async (goalId) => {

        try {

            await resubmitGoal(goalId)

            alert("Goal Resubmitted Successfully")

            fetchGoals()

        } catch (error) {

            console.log(error)

            alert(
                error.response?.data?.detail ||
                "Resubmission Failed"
            )
        }
    }
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

            if (editingGoalId) {

                await editGoal(editingGoalId, {

                    ...formData,

                    target_value: Number(formData.target_value),

                    weightage: Number(formData.weightage),
                })

                alert("Goal Updated Successfully")

                setEditingGoalId(null)

            } else {

                await createGoal({

                    ...formData,

                    target_value: Number(formData.target_value),

                    weightage: Number(formData.weightage),
                })

                alert("Goal Created Successfully")
            }

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

            alert(
                error.response?.data?.detail ||
                "Goal Creation Failed"
            )
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
                    {role === "manager" && managerEditMode && (

                        <form
                            onSubmit={handleManagerUpdate}
                            className="bg-white p-6 rounded-xl shadow mb-10"
                        >

                            <div className="grid grid-cols-2 gap-4">

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

                            </div>

                            <button
                                type="submit"
                                className="bg-black text-white px-6 py-3 rounded mt-6"
                            >
                                Update Goal
                            </button>

                        </form>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded mt-6"
                >
                    Create Goal
                </button>

                    <button
                        type="button"
                        onClick={handleGoalSubmission}
                        className="bg-blue-600 text-white px-6 py-3 rounded mt-4 ml-4"
                    >
                        Submit Goals
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

                        {role !== "manager" && (

                            <th className="text-left py-3">
                                Manager
                            </th>

                        )}
                        {role === "employee" && (
                            <th className="text-left py-3">
                                Actions
                            </th>
                        )}
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

                            <div className="flex items-center gap-2">

                                <span>{goal.status}</span>

                                {goal.is_locked && (

                                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Locked
        </span>
                                )}
                            </div>

                            <td className="py-3">
                                {goal.weightage}
                            </td>

                            {role === "employee" && (

                                <td className="py-3">

                                    {(goal.status === "draft" ||
                                        goal.status === "rejected") ? (

                                        <div className="flex gap-2">

                                            <button
                                                onClick={() => handleEdit(goal)}
                                                className="bg-yellow-500 text-white px-4 py-1 rounded"
                                            >
                                                Edit
                                            </button>

                                            {goal.status === "rejected" && (

                                                <button
                                                    onClick={() => handleResubmit(goal.id)}
                                                    className="bg-blue-600 text-white px-4 py-1 rounded"
                                                >
                                                    Resubmit
                                                </button>

                                            )}

                                        </div>

                                    ) : goal.status === "submitted" ? (

                                        <span className="text-blue-600 font-medium">
                Submitted
            </span>

                                    ) : (

                                        <span className="text-gray-500 font-medium">
                Locked
            </span>

                                    )}

                                </td>
                            )}





                            {role === "manager" && (

                                <td className="py-3 flex gap-2">

                                    <button
                                        onClick={() => handleManagerEdit(goal)}
                                        className="bg-yellow-500 text-white px-4 py-1 rounded"
                                    >
                                        Edit
                                    </button>

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