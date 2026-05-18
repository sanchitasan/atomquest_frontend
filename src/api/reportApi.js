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

export const downloadCSVReport = async () => {

    const response = await axios.get(
        `${BASE_URL}/reports/export/csv`,
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
        "governance_report.csv"
    )

    document.body.appendChild(link)

    link.click()

    link.remove()
}


export const downloadExcelReport = async () => {

    const response = await axios.get(
        `${BASE_URL}/reports/export/excel`,
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
        "governance_report.xlsx"
    )

    document.body.appendChild(link)

    link.click()

    link.remove()
}