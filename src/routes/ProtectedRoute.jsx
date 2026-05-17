// src/routes/ProtectedRoute.jsx - UPDATED WITH ROLE CHECKING
import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, allowedRoles = [] }) {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />
    }

    // If roles are specified and user's role is not allowed, redirect to dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute
