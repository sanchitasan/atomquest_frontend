import {
    LayoutDashboard,
    Target,
    ClipboardList,
    FileText,
    LogOut,
    User
} from "lucide-react"

import { Link, useLocation, useNavigate } from "react-router-dom"

function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const role = localStorage.getItem("role")
    const email = localStorage.getItem("email")

    const handleLogout = () => {
        localStorage.clear()
        navigate("/login")
    }

    const isActive = (path) => location.pathname === path

    const navItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/goals", icon: Target, label: "Goals" },
        { path: "/checkins", icon: ClipboardList, label: "Check-ins" },
        { path: "/audit-logs", icon: FileText, label: "Audit Logs" },
    ]

    return (
        <div className="w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white border-r border-white/10 flex flex-col">

            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AtomQuest
                </h1>
                <p className="text-xs text-gray-400 mt-1">Goal Tracking Portal</p>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{email || "User"}</p>
                        <p className="text-xs text-gray-400 capitalize">{role || "Role"}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                <div className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.path)

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    active
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                }`}
                                data-testid={`sidebar-${item.label.toLowerCase().replace(/\s/g, '-')}-link`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
                    data-testid="sidebar-logout-button"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>

        </div>
    )
}

export default Sidebar