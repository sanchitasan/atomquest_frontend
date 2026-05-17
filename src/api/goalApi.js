import axios from "axios"

const BASE_URL = "http://127.0.0.1:8000"

const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
})

export const createGoal = async (goalData) => {

    const response = await axios.post(
        `${BASE_URL}/goals`,
        goalData,
        getAuthHeaders()
    )

    return response.data
}

export const getEmployeeGoals = async () => {

    const response = await axios.get(
        `${BASE_URL}/goals/my`,
        getAuthHeaders()
    )

    return response.data
}

export const getPendingGoals = async () => {

    const response = await axios.get(
        `${BASE_URL}/goals/pending`,
        getAuthHeaders()
    )

    return response.data
}

export const getGoals = async () => {

    const response = await axios.get(
        `${BASE_URL}/goals`,
        getAuthHeaders()
    )

    return response.data
}

export const approveGoal = async (goalId) => {

    const response = await axios.put(
        `${BASE_URL}/goals/${goalId}/approve`,
        {},
        getAuthHeaders()
    )

    return response.data
}

export const rejectGoal = async (goalId) => {

    const response = await axios.put(
        `${BASE_URL}/goals/${goalId}/reject`,
        {},
        getAuthHeaders()
    )

    return response.data
}