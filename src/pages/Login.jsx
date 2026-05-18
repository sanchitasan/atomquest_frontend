import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { loginUser } from "../api/authApi"
import { getApiErrorMessage } from "../api/config"
import {  Mail, Lock, AlertCircle } from "lucide-react"

function Login() {

    const navigate = useNavigate()
    const location = useLocation()
    const successMessage = location.state?.message

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {

            const response = await loginUser({
                email,
                password
            })

            localStorage.setItem("token", response.access_token)
            localStorage.setItem("user_id", response.user_id)
            localStorage.setItem("role", response.role)
            localStorage.setItem("email", email)

            navigate("/dashboard")

        } catch (error) {
            setError(getApiErrorMessage(error, "Invalid credentials. Please try again."))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_28%),linear-gradient(180deg,#020617_0%,#020817_48%,#020617_100%)]" />
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">


                {/* Login Card */}
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-2xl">

                    <h1 className="text-3xl font-bold mb-2 text-white text-center">
                        Welcome Back
                    </h1>
                    <p className="text-gray-300 text-center mb-8">Sign in to continue to your dashboard</p>

                    {successMessage && (
                        <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4" data-testid="login-success-message">
                            <p className="text-green-200 text-sm">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4" data-testid="login-error-message">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin}>

                        {/* Email Input */}
                        <div className="mb-6">
                            <label className="block text-gray-200 text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    data-testid="login-email-input"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label className="block text-gray-200 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    data-testid="login-password-input"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/12 py-3 font-semibold text-cyan-100 transition-all hover:bg-cyan-400/16 disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="login-submit-button"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing In...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-gray-400 text-sm">
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="font-medium text-cyan-300 transition-colors hover:text-white"
                                data-testid="go-to-signup-button"
                            >
                                Sign Up
                            </button>
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="text-gray-300 hover:text-white text-sm transition-colors block w-full"
                            data-testid="back-to-home-button"
                        >
                            ← Back to Home
                        </button>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Login
