import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api/authApi"
import { getApiErrorMessage } from "../api/config"
import { Target, Mail, Lock, AlertCircle, User, Briefcase, CheckCircle } from "lucide-react"

function Signup() {

    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("employee")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleSignup = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)

        try {

            const response = await registerUser({
                name,
                email,
                password,
                role,
            })

            const message =
                response?.message ||
                "Account created successfully. Please sign in."

            setSuccess(message)

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: { message },
                })
            }, 1200)

        } catch (err) {
            console.error("Signup error:", err?.response?.data || err)
            setError(getApiErrorMessage(err, "Registration failed. Please try again."))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>

            <div className="relative w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Target className="text-purple-400" size={48} />
                        <span className="text-4xl font-bold text-white">AlignIQ</span>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

                    <h1 className="text-3xl font-bold mb-2 text-white text-center">
                        Create Account
                    </h1>
                    <p className="text-gray-300 text-center mb-8">
                        Sign up to start managing your goals
                    </p>

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-start gap-3" data-testid="signup-success-message">
                            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-green-200 text-sm">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3" data-testid="signup-error-message">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignup}>

                        <div className="mb-5">
                            <label className="block text-gray-200 text-sm font-medium mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    data-testid="signup-name-input"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-200 text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    data-testid="signup-email-input"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
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
                                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    data-testid="signup-password-input"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-200 text-sm font-medium mb-2">
                                Role
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Briefcase className="text-gray-400" size={20} />
                                </div>
                                <select
                                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    data-testid="signup-role-select"
                                >
                                    <option value="employee" className="bg-slate-900 text-white">Employee</option>
                                    <option value="manager" className="bg-slate-900 text-white">Manager</option>
                                    <option value="admin" className="bg-slate-900 text-white">Admin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
                            data-testid="signup-submit-button"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating Account...
                                </span>
                            ) : (
                                "Sign Up"
                            )}
                        </button>

                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-purple-300 hover:text-white font-medium transition-colors"
                                data-testid="go-to-login-button"
                            >
                                Sign In
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

export default Signup
