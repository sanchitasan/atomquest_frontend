import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api/authApi"
import { getApiErrorMessage } from "../api/config"
import { Mail, Lock, AlertCircle, User, Briefcase, CheckCircle } from "lucide-react"

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
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_28%),linear-gradient(180deg,#020617_0%,#020817_48%,#020617_100%)]" />
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">


                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-2xl">

                    <h1 className="text-3xl font-bold mb-2 text-white text-center">
                        Create Account
                    </h1>
                    <p className="text-gray-300 text-center mb-8">
                        Sign up to start managing your goals
                    </p>

                    {success && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4" data-testid="signup-success-message">
                            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-green-200 text-sm">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4" data-testid="signup-error-message">
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
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
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
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
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
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
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
                                    className="w-full appearance-none cursor-pointer rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 py-3 text-white outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
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
                            className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/12 py-3 font-semibold text-cyan-100 transition-all hover:bg-cyan-400/16 disabled:cursor-not-allowed disabled:opacity-50"
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
                                className="font-medium text-cyan-300 transition-colors hover:text-white"
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
