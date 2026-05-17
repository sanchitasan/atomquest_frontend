// src/App.jsx - UPDATED WITH ROLE-BASED ROUTING
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./routes/ProtectedRoute"
import Goals from "./pages/Goals"
import Checkins from "./pages/Checkins"
import AuditLogs from "./pages/AuditLogs"
import Landing from "./pages/Landing"
import TeamView from "./pages/TeamView.jsx";
import AssignedKPI from "./pages/AssignedKPI.jsx";
import AssignKPI from "./pages/AssignKPI.jsx";
import Reports from "./pages/Reports.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Employee Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["employee", "manager", "admin"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/goals"
                    element={
                        <ProtectedRoute allowedRoles={["employee", "manager"]}>
                            <Goals />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/checkins"
                    element={
                        <ProtectedRoute allowedRoles={["employee"]}>
                            <Checkins />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/team-view"
                    element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                            <TeamView/>
                        </ProtectedRoute>
                    }
                />
                {/* Assigned KPI - employee */}
                <Route
                    path="/assigned-kpi"
                    element={
                        <ProtectedRoute allowedRoles={["employee"]}>
                            <AssignedKPI/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={ <ProtectedRoute allowedRoles={["manager", "admin"]}>
                        <Reports/>
                    </ProtectedRoute>
                }
                    />



                {/* Assign KPI - manager */}
                <Route
                    path="/assign-kpi"
                    element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                            <AssignKPI/>
                        </ProtectedRoute>
                    }
                />



                {/* Admin Routes */}
                <Route
                    path="/audit-logs"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AuditLogs />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
