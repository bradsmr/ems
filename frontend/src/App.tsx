import { useState } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { Toaster } from "sonner"
import Login from "@/features/auth/Login"
import EmployeeList from "@/features/employees/EmployeeList"
import EmployeeDetails from "@/features/employees/EmployeeDetails"
import DepartmentList from "@/features/departments/DepartmentList"
import DepartmentDetails from "@/features/departments/DepartmentDetails"
import ReportsDashboard from "@/features/reports/ReportsDashboard"
import OrgChartReport from "@/features/reports/OrgChartReport"
import Shell from "@/components/Shell"

export default function App() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
    const navigate = useNavigate()

    const handleLogin = (newToken: string) => {
        setToken(newToken)
        localStorage.setItem("token", newToken)
        navigate("/employees")
    }

    const handleLogout = () => {
        setToken(null)
        localStorage.removeItem("token")
        navigate("/login")
    }

    return (
        <>
            <Routes>
                {/* Public Login Route */}
                <Route path="/login" element={<Login onLogin={handleLogin} />} />

                {/* Protected Routes wrapped in Shell */}
                {token ? (
                    <Route element={<Shell onLogout={handleLogout} />}>
                        <Route path="/employees" element={<EmployeeList token={token} />} />
                        <Route path="/employees/:id" element={<EmployeeDetails token={token} />} />
                        <Route path="/departments" element={<DepartmentList token={token} />} />
                        <Route path="/departments/:id" element={<DepartmentDetails token={token} />} />
                        <Route path="/reports" element={<ReportsDashboard token={token} />} />
                        <Route path="/reports/orgchart" element={<OrgChartReport token={token} />} />
                    </Route>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to={token ? "/employees" : "/login"} />} />
            </Routes>
            <Toaster 
                position="top-center" 
                richColors 
                closeButton
                duration={5000}
            />
        </>
    )
}
