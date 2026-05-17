import axios from "axios"

const BASE_URL = "http://127.0.0.1:8000"

export const loginUser = async (loginData) => {

    const response = await axios.post(
        `${BASE_URL}/login`,
        loginData
    )

    return response.data
}