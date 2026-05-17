import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { loginUser } from "../api/authApi"

function Login() {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {

        try {

            const response = await loginUser({
                email,
                password
            })

            localStorage.setItem(
                "token",
                response.access_token
            )
            localStorage.setItem("role", response.role)

            navigate("/dashboard")

            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert("Invalid Credentials")
        }
    }

    return (

        <div className="h-screen flex items-center justify-center">

            <div className="w-96 p-8 shadow-lg rounded-xl">

                <h1 className="text-3xl font-bold mb-6 text-center">
                    Goal Tracker Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-black text-white p-3 rounded"
                >
                    Login
                </button>

            </div>

        </div>
    )
}

export default Login