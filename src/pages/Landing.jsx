
import { useNavigate } from "react-router-dom"
import { Target, TrendingUp, Shield, CheckCircle, ArrowRight, Zap, Award } from "lucide-react"

function Landing() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed w-full top-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
                <div className="mx-auto px-10 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Target className="text-purple-400" size={32} />
                        <span className="text-2xl font-bold text-white">AlignIQ</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/signup")}
                            className="px-6 py-2 border border-white/30 hover:border-white/50 text-white rounded-lg font-medium transition-all"
                            data-testid="nav-signup-button"
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                            data-testid="nav-login-button"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">

                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Transform Your
                        <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Goal Management
                        </span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                        Streamline goal setting, approval workflows, and performance tracking with our powerful RBAC-enabled platform. Built for modern teams.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate("/login")}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold text-lg flex items-center gap-2 transition-all hover:scale-105 shadow-2xl shadow-purple-500/50"
                            data-testid="hero-get-started-button"
                        >
                            Get Started
                            <ArrowRight size={20} />
                        </button>
                        <button
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-lg backdrop-blur-lg border border-white/20 transition-all"
                            data-testid="hero-learn-more-button"
                        >
                            Learn More
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <div className="text-4xl font-bold text-purple-400 mb-2">100%</div>
                            <div className="text-gray-300">Goal Alignment</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <div className="text-4xl font-bold text-pink-400 mb-2">3x</div>
                            <div className="text-gray-300">Faster Approvals</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <div className="text-4xl font-bold text-blue-400 mb-2">Real-time</div>
                            <div className="text-gray-300">Progress Tracking</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-white mb-4">Powerful Features</h2>
                        <p className="text-xl text-gray-300">Everything you need to manage organizational goals effectively</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-8 hover:scale-105 transition-all">
                            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="text-purple-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Role-Based Access</h3>
                            <p className="text-gray-300">
                                Secure RBAC system with Employee, Manager, and Admin roles. Perfect access control for every team member.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur-lg border border-pink-500/20 rounded-2xl p-8 hover:scale-105 transition-all">
                            <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Target className="text-pink-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Smart Goal Setting</h3>
                            <p className="text-gray-300">
                                Create goals with thrust areas, UoM tracking, and automatic weightage validation.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-lg border border-blue-500/20 rounded-2xl p-8 hover:scale-105 transition-all">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                                <CheckCircle className="text-blue-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Approval Workflow</h3>
                            <p className="text-gray-300">
                                Streamlined manager approval process. Edit, approve, or reject goals with full audit trail.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-lg border border-green-500/20 rounded-2xl p-8 hover:scale-105 transition-all">
                            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                                <TrendingUp className="text-green-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Quarterly Check-ins</h3>
                            <p className="text-gray-300">
                                Track progress quarterly with automated scoring. Compare planned vs actual achievements.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-lg border border-yellow-500/20 rounded-2xl p-8 hover:scale-105 transition-all">
                            <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Zap className="text-yellow-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Real-time Analytics</h3>
                            <p className="text-gray-300">
                                Comprehensive dashboards with goal statistics, progress tracking, and performance insights.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-lg border border-red-500/20 rounded-2xl p-8 hover:scale-105 transition-all">
                            <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Award className="text-red-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Complete Audit Trail</h3>
                            <p className="text-gray-300">
                                Every action is logged. Track who changed what and when for complete accountability.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-xl text-gray-300">Simple, streamlined workflow in 3 steps</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-2xl shadow-purple-500/50">
                                1
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Create Goals</h3>
                            <p className="text-gray-300">
                                Employees create goals with thrust areas, targets, and weightage. System validates automatically.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-2xl shadow-pink-500/50">
                                2
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Manager Approval</h3>
                            <p className="text-gray-300">
                                Managers review, edit if needed, and approve goals. Goals are locked after approval.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-2xl shadow-blue-500/50">
                                3
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Track Progress</h3>
                            <p className="text-gray-300">
                                Quarterly check-ins capture achievements. Automated progress scoring and status tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg border border-white/10 rounded-3xl p-12 text-center">
                    <h2 className="text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Join modern teams using AlignIQ for goal management and performance tracking.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-xl flex items-center gap-3 mx-auto transition-all hover:scale-105 shadow-2xl shadow-purple-500/50"
                        data-testid="cta-login-button"
                    >
                        Launch Dashboard
                        <ArrowRight size={24} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center text-gray-400">
                    <p>© 2026 Sanchita Priyadarshinee. Built for AtomQuest Hackathon 1.0</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing