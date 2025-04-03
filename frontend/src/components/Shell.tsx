import React, {PropsWithChildren} from "react"
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {LogOut, Settings, Users} from "lucide-react"
import {useCurrentUser} from "@/hooks/useCurrentUser"
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
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
                    const label = segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())

                    return (
                        <React.Fragment key={to}>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to={to}>{label}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

function PageTitle() {
    const location = useLocation()
    const paths = location.pathname.split("/").filter(Boolean)
    const currentPage = paths.length > 0
        ? paths[paths.length - 1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
        : "Dashboard"
    
    return <h1 className="text-lg font-medium mb-4">{currentPage}</h1>
}

interface ShellProps extends PropsWithChildren {
    onLogout: () => void
}

export default function Shell({onLogout}: ShellProps) {
    const navigate = useNavigate()
    const { user } = useCurrentUser()
    
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }

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
                <header className="h-12 px-6 bg-white border-b flex items-center justify-between shadow-sm">
                    <AppBreadcrumbs />
                    <div className="flex items-center gap-3">
                        {user && (
                            <>
                                <span className="text-sm text-muted-foreground">
                                    {user.firstName} {user.lastName} ({user.email})
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="cursor-pointer">
                                            <AvatarFallback>
                                                {getInitials(user.firstName, user.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/employees/${user.id}`)}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Edit Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={onLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 bg-muted space-y-4">
                    <PageTitle />
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
