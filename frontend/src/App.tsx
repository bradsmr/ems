import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Login from "@/features/auth/Login"
import EmployeeList from "@/features/employees/EmployeeList"
import EmployeeDetails from "@/features/employees/EmployeeDetails"
import Shell from "@/components/Shell"

export default function App() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
    const navigate = useNavigate()

    useEffect(() => {
        console.log("Token at App level:", token)
    }, [token])

    const handleLogin = (t: string) => {
        setToken(t)
        localStorage.setItem("token", t)
        navigate("/employees")
    }

    return (
        <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            {token ? (
                <Route element={<Shell />}>
                    <Route path="/employees" element={<EmployeeList token={token} />} />
                    <Route path="/employees/:id" element={<EmployeeDetails token={token} />} />
                </Route>
            ) : (
                <Route path="*" element={<Navigate to="/login" />} />
            )}
            <Route path="*" element={<Navigate to={token ? "/employees" : "/login"} />} />
        </Routes>
    )
}
