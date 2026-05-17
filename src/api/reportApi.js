import axios from "axios"

import { getApiBaseUrl } from "./config"

const BASE_URL = getApiBaseUrl()

const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
})

export const getDashboardStats = async () => {

    const response = await axios.get(
        `${BASE_URL}/dashboard-stats`,
        getAuthHeaders()
    )

    return response.data
}

export const getCompletionDashboard = async () => {

    const response = await axios.get(
        `${BASE_URL}/completion-dashboard`,
        getAuthHeaders()
    )

    return response.data
}

export const getGovernanceAudit = async () => {

    const response = await axios.get(
        `${BASE_URL}/governance-audit`,
        getAuthHeaders()
    )

    return response.data
}

export const downloadAchievementReport = async () => {

    const response = await axios.get(
        `${BASE_URL}/achievement-report`,
        {
            ...getAuthHeaders(),
            responseType: "blob"
        }
    )

    const url = window.URL.createObjectURL(
        new Blob([response.data])
    )

    const link = document.createElement("a")

    link.href = url

    link.setAttribute(
        "download",
        "achievement_report.csv"
    )

    document.body.appendChild(link)

    link.click()

    link.remove()
}