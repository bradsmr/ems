import React, {PropsWithChildren} from "react"
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {LogOut, Users} from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function AppBreadcrumbs() {
    const location = useLocation()
    const paths = location.pathname.split("/").filter(Boolean)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {paths.map((segment, index) => {
                    const to = "/" + paths.slice(0, index + 1).join("/")
                    const isLast = index === paths.length - 1
                    const label = segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())

                    return (
                        <React.Fragment key={to}>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={to}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}


interface ShellProps extends PropsWithChildren {
    onLogout: () => void
}

export default function Shell({onLogout}: ShellProps) {
    const navigate = useNavigate()

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 bg-primary text-primary-foreground flex flex-col p-6">
                <div className="text-2xl font-bold tracking-tight mb-6">Initech EMS</div>

                <nav className="flex flex-col gap-2 flex-grow">
                    <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => navigate("/employees")}
                    >
                        <Users className="mr-2 h-4 w-4"/>
                        Employees
                    </Button>
                </nav>

                <Button
                    variant="ghost"
                    className="justify-start mt-auto"
                    onClick={onLogout}
                >
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout
                </Button>
            </aside>

            {/* Main layout with topbar and content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 px-6 bg-white border-b flex items-center justify-between shadow-sm">
                    <div className="text-lg font-medium">Dashboard</div>
                    <span className="text-sm text-muted-foreground">admin@initech.com</span>
                </header>

                <main className="flex-1 overflow-auto p-6 bg-muted space-y-4">
                    <AppBreadcrumbs/>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
