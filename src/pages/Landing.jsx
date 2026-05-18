import { useNavigate } from "react-router-dom"
import { Target, TrendingUp, Shield, CheckCircle, ArrowRight, Zap, Award } from "lucide-react"

function Landing() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_28%),linear-gradient(180deg,#020617_0%,#020817_48%,#020617_100%)]" />

            <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
                <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                            <Target className="text-cyan-300" size={24} />
                        </div>
                        <span className="text-2xl font-semibold text-white">AlignIQ</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/signup")}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
                            data-testid="nav-signup-button"
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/16"
                            data-testid="nav-login-button"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            <section className="">
                <div className=" bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] text-center shadow-[0_40px_120px_rgba(2,6,23,0.7)] sm:px-8 lg:px-10 lg:py-16">
                    <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-tight text-white md:text-6xl lg:text-7xl">
                        Transform Your
                        <span className="block bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa)] bg-clip-text text-transparent">
                            Goal Management
                        </span>
                    </h1>

                    <p className="mx-auto mb-10 mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
                        Streamline goal setting, approval workflows, and performance tracking with our powerful RBAC-enabled platform. Built for modern teams.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-8 py-4 text-lg font-semibold text-cyan-100 transition hover:bg-cyan-400/16"
                            data-testid="hero-get-started-button"
                        >
                            Get Started
                            <ArrowRight size={20} />
                        </button>
                        <button
                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/[0.06]"
                            data-testid="hero-learn-more-button"
                        >
                            Learn More
                        </button>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-5xl gap-5 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
                            <div className="mb-2 text-4xl font-semibold text-cyan-300">100%</div>
                            <div className="text-slate-300">Goal Alignment</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
                            <div className="mb-2 text-4xl font-semibold text-violet-300">3x</div>
                            <div className="text-slate-300">Faster Approvals</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
                            <div className="mb-2 text-4xl font-semibold text-emerald-300">Real-time</div>
                            <div className="text-slate-300">Progress Tracking</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1680px]">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-semibold text-white md:text-5xl">Powerful Features</h2>
                        <p className="mt-4 text-xl text-slate-300">Everything you need to manage organizational goals effectively</p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                <Shield className="text-cyan-300" size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Role-Based Access</h3>
                            <p className="mt-3 text-slate-300">
                                Secure RBAC system with Employee, Manager, and Admin roles. Perfect access control for every team member.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
                                <Target className="text-violet-300" size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Smart Goal Setting</h3>
                            <p className="mt-3 text-slate-300">
                                Create goals with thrust areas, UoM tracking, and automatic weightage validation.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
                                <CheckCircle className="text-blue-300" size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Approval Workflow</h3>
                            <p className="mt-3 text-slate-300">
                                Streamlined manager approval process. Edit, approve, or reject goals with full audit trail.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                                <TrendingUp className="text-emerald-300" size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Quarterly Check-ins</h3>
                            <p className="mt-3 text-slate-300">
                                Track progress quarterly with automated scoring. Compare planned vs actual achievements.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
                                <Zap className="text-amber-300" size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Real-time Analytics</h3>
                            <p className="mt-3 text-slate-300">
                                Comprehensive dashboards with goal statistics, progress tracking, and performance insights.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10">
                                <Award className="text-rose-300" size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Complete Audit Trail</h3>
                            <p className="mt-3 text-slate-300">
                                Every action is logged. Track who changed what and when for complete accountability.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1680px] rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-semibold text-white md:text-5xl">How It Works</h2>
                        <p className="mt-4 text-xl text-slate-300">Simple, streamlined workflow in 3 steps</p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-3xl font-semibold text-cyan-200 shadow-[0_20px_60px_rgba(34,211,238,0.18)]">
                                1
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Create Goals</h3>
                            <p className="mt-3 text-slate-300">
                                Employees create goals with thrust areas, targets, and weightage. System validates automatically.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-3xl font-semibold text-violet-200 shadow-[0_20px_60px_rgba(168,85,247,0.18)]">
                                2
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Manager Approval</h3>
                            <p className="mt-3 text-slate-300">
                                Managers review, edit if needed, and approve goals. Goals are locked after approval.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-3xl font-semibold text-emerald-200 shadow-[0_20px_60px_rgba(52,211,153,0.18)]">
                                3
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Track Progress</h3>
                            <p className="mt-3 text-slate-300">
                                Quarterly check-ins capture achievements. Automated progress scoring and status tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-10 sm:px-6 lg:px-8 lg:pb-14">
                <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.55),rgba(15,23,42,0.92))] p-12 text-center shadow-[0_32px_120px_rgba(2,6,23,0.55)]">
                    <h2 className="text-4xl font-semibold text-white md:text-5xl">Ready to Get Started?</h2>
                    <p className="mx-auto mb-8 mt-6 max-w-2xl text-xl text-slate-300">
                        Join modern teams using AlignIQ for goal management and performance tracking.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/12 px-10 py-5 text-xl font-semibold text-cyan-100 transition hover:bg-cyan-400/16"
                        data-testid="cta-login-button"
                    >
                        Launch Dashboard
                        <ArrowRight size={24} />
                    </button>
                </div>
            </section>

            <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl text-center text-slate-500">
                    <p>© 2026 Sanchita Priyadarshinee. Built for AtomQuest Hackathon 1.0</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
