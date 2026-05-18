import axios from "axios"

import { getApiBaseUrl } from "./config"

const BASE_URL = getApiBaseUrl()

export const getAuditLogs = async () => {

    const token = localStorage.getItem("token")

    const response = await axios.get(
        `${BASE_URL}/audit-logs`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    return response.data
}