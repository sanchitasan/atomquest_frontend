import axios from "axios"

const BASE_URL = "http://127.0.0.1:8000"

export const getDashboardStats = async () => {

    const token = localStorage.getItem("token")

    const response = await axios.get(
        `${BASE_URL}/dashboard-stats`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    return response.data
}