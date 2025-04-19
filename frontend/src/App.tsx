import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { Toaster } from "sonner"
import axios from "axios"
import { API_URL } from './utils/api';
import Login from "@/features/auth/Login"
import Setup from "@/features/auth/Setup"
import EmployeeList from "@/features/employees/EmployeeList"
import EmployeeDetails from "@/features/employees/EmployeeDetails"
import DepartmentList from "@/features/departments/DepartmentList"
import DepartmentDetails from "@/features/departments/DepartmentDetails"
import ReportsDashboard from "@/features/reports/ReportsDashboard"
import OrgChartReport from "@/features/reports/OrgChartReport"
import Shell from "@/components/Shell"

export default function App() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
    const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const checkSetupStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/setup/status`)
                setNeedsSetup(response.data.needsSetup)
            } catch (error) {
                console.error("Failed to check setup status:", error)
                // If we can't connect, assume we need setup (will be corrected on next load)
                setNeedsSetup(true)
            } finally {
                setLoading(false)
            }
        }
        
        checkSetupStatus()
    }, [])

    const handleLogin = (newToken: string) => {
        setToken(newToken)
        localStorage.setItem("token", newToken)
        navigate("/employees")
    }

    const handleSetupComplete = (newToken: string) => {
        setNeedsSetup(false)
        setToken(newToken)
        localStorage.setItem("token", newToken)
        navigate("/employees")
    }

    const handleLogout = () => {
        setToken(null)
        localStorage.removeItem("token")
        navigate("/login")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Routes>
                {/* Setup Route */}
                {needsSetup && (
                    <Route path="/setup" element={<Setup onSetupComplete={handleSetupComplete} />} />
                )}

                {/* Public Login Route */}
                <Route path="/login" element={
                    needsSetup 
                        ? <Navigate to="/setup" /> 
                        : <Login onLogin={handleLogin} />
                } />

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
                    <Route path="*" element={<Navigate to={needsSetup ? "/setup" : "/login"} />} />
                )}

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to={
                    needsSetup 
                        ? "/setup" 
                        : (token ? "/employees" : "/login")
                } />} />
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
