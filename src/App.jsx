import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

import ProtectedRoute from "./routes/ProtectedRoute"
import Goals from "./pages/Goals"
import Checkins from "./pages/Checkins"
import AuditLogs from "./pages/AuditLogs"

function App() {

    return (

        <BrowserRouter>

            <Routes>
                <Route path="/" element={<Login />}/>
                <Route path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/goals"
                    element={
                        <ProtectedRoute>
                            <Goals />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkins"
                    element={
                        <ProtectedRoute>
                            <Checkins />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/audit-logs"
                    element={
                        <ProtectedRoute>
                            <AuditLogs />
                        </ProtectedRoute>
                    }
                />
            </Routes>

        </BrowserRouter>
    )
}

export default App