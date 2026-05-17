import axios from "axios"

const BASE_URL = "http://127.0.0.1:8000"

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
