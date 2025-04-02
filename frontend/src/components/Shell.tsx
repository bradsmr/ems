import { Button } from "@/components/ui/button"
import { useNavigate, Outlet } from "react-router-dom"

export default function Shell() {
    const navigate = useNavigate()

    const logout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar text-sidebar-foreground p-6 border-r">
                <h1 className="text-xl font-bold mb-4">EMS Admin</h1>
                <nav className="space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate("/employees")}
                    >
                        Employees
                    </Button>
                </nav>
                <div className="mt-10">
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={logout}
                    >
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-background text-foreground">
                <Outlet />
            </main>
        </div>
    )
}
