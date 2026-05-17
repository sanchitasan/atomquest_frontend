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

export const editGoal = async (goalId, goalData) => {

    const response = await axios.put(
        `${BASE_URL}/goals/${goalId}`,
        goalData,
        getAuthHeaders()
    )

    return response.data
}

export const managerBulkUpdateGoals = async (payload) => {

    const response = await axios.put(
        `${BASE_URL}/manager/goals/bulk-update`,
        payload,
        getAuthHeaders()
    )

    return response.data
}

export const submitGoals = async () => {

    const response = await axios.post(
        `${BASE_URL}/goals/submit`,
        {},
        getAuthHeaders()
    )

    return response.data
}

export const resubmitGoal = async (goalId) => {

    const response = await axios.put(
        `${BASE_URL}/goals/${goalId}/resubmit`,
        {},
        getAuthHeaders()
    )

    return response.data
}

export const unlockGoal = async (goalId) => {

    const response = await axios.put(
        `${BASE_URL}/goals/${goalId}/unlock`,
        {},
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