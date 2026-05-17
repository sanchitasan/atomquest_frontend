import axios from "axios"

import { getApiBaseUrl } from "./config"

const BASE_URL = getApiBaseUrl()

export const loginUser = async (loginData) => {
    const response = await axios.post(`${BASE_URL}/login`, loginData)
    return response.data
}

export const registerUser = async (userData) => {
    const response = await axios.post(`${BASE_URL}/users`, {
        name: userData.name?.trim(),
        email: userData.email?.trim(),
        password: userData.password,
        role: userData.role,
    })
    return response.data
}
