import { useLocation, useNavigate } from "react-router-dom"
import {
    Award,
    BarChart3,
    CheckSquare,
    FileText,
    Home,
    LogOut,
    Shield,
    Target,
    Users,
} from "lucide-react"

function MainLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const role = localStorage.getItem("role")
    const userEmail = localStorage.getItem("email") || "User"

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("email")
        navigate("/")
    }

    const getNavTabs = () => {
        switch (role) {
            case "employee":
                return [
                    { label: "Dashboard", path: "/dashboard", icon: Home },
                    { label: "Goals", path: "/goals", icon: Target },
                    { label: "Check-ins", path: "/checkins", icon: CheckSquare },
                    { label: "Assigned KPIs", path: "/assigned-kpi", icon: Award },
                ]
            case "manager":
                return [
                    { label: "Dashboard", path: "/dashboard", icon: Home },
                    { label: "Goals", path: "/goals", icon: Target },
                    { label: "Team View", path: "/team-view", icon: BarChart3 },
                    { label: "Assign KPI", path: "/assign-kpi", icon: Users },
                ]
            case "admin":
                return [
                    { label: "Dashboard", path: "/dashboard", icon: Home },
                    { label: "Audit Logs", path: "/audit-logs", icon: Shield },
                    { label: "Reports", path: "/reports", icon: BarChart3 },
                ]
            default:
                return []
        }
    }

    const navTabs = getNavTabs()
    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_28%),linear-gradient(180deg,#020617_0%,#020817_48%,#020617_100%)]" />

            <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
                <div className="mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                                AQ
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">AlignIQ</h1>
                                <p className="text-sm text-slate-400 capitalize">{role} workspace</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                                <p className="text-sm font-medium text-white">{userEmail}</p>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 capitalize">{role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-400/15"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>

                    <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {navTabs.map((tab) => {
                            const Icon = tab.icon
                            const active = isActive(tab.path)

                            return (
                                <button
                                    key={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                                        active
                                            ? "border-cyan-400/30 bg-cyan-400/12 text-white shadow-[0_10px_40px_rgba(34,211,238,0.12)]"
                                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                                    }`}
                                >
                                    <Icon size={16} className={active ? "text-cyan-300" : "text-slate-400"} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {children}
            </main>
        </div>
    )
}

export default MainLayout
