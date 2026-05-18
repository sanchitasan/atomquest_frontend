import EmployeeDashboard from "./dashboard/EmployeeDashboard"
import ManagerDashboard from "./dashboard/ManagerDashboard"
import AdminDashboard from "./dashboard/AdminDashboard"
import MainLayout from "../layouts/MainLayout"

export default function Dashboard() {

    const role = localStorage.getItem("role")

    if (role === "employee") {

        return <EmployeeDashboard />
    }

    if (role === "manager") {

        return <ManagerDashboard />
    }
    if (role === "admin") {

        return <AdminDashboard />
    }


    return (
        <MainLayout>
            <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">

                Dashboard not available

            </div>
        </MainLayout>
    )
}