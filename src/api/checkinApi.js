import axios from "axios"

import { getApiBaseUrl } from "./config"

const BASE_URL = getApiBaseUrl()

export const createCheckIn = async (checkinData) => {

    const token = localStorage.getItem("token")

    const response = await axios.post(
        `${BASE_URL}/checkins`,
        checkinData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    return response.data
}

export const getCheckIns = async () => {

    const token = localStorage.getItem("token")

    const response = await axios.get(
        `${BASE_URL}/checkins`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    return response.data
}