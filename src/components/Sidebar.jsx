import {
    LayoutDashboard,
    Target,
    ClipboardList,
    FileText,
    LogOut
} from "lucide-react"

import { Link } from "react-router-dom"

function Sidebar() {

    return (

        <div className="w-64 h-screen bg-black text-white p-5">

            <h1 className="text-2xl font-bold mb-10">
                Goal Tracker
            </h1>

            <div className="flex flex-col gap-6">

                <Link
                    to="/dashboard"
                    className="flex items-center gap-3"
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                <Link
                    to="/goals"
                    className="flex items-center gap-3"
                >
                    <Target size={20} />
                    Goals
                </Link>

                <Link
                    to="/checkins"
                    className="flex items-center gap-3"
                >
                    <ClipboardList size={20} />
                    Check-ins
                </Link>

                <Link
                    to="/audit-logs"
                    className="flex items-center gap-3"
                >
                    <FileText size={20} />
                    Audit Logs
                </Link>

                <button
                    className="flex items-center gap-3 text-red-400 mt-10"
                >
                    <LogOut size={20} />
                    Logout
                </button>

            </div>

        </div>
    )
}

export default Sidebar