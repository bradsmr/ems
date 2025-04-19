import React, {PropsWithChildren, useState, useEffect} from "react"
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom"
import axios from "axios"
import { API_URL } from '../utils/api';
import {Button} from "@/components/ui/button"
import {LogOut, Settings, Users, Layers, BarChart, Building2} from "lucide-react"
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
    const [entityName, setEntityName] = useState<string | null>(null)
    const token = localStorage.getItem("token")

    useEffect(() => {
        const fetchEntityName = async () => {
            if (!token) return
            
            if (paths.length === 2 && (paths[0] === "employees" || paths[0] === "departments")) {
                const id = paths[1]
                if (id === "new") {
                    setEntityName("New")
                    return
                }
                
                try {
                    if (paths[0] === "employees") {
                        const response = await axios.get(`${API_URL}/api/employees/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        setEntityName(`${response.data.firstName} ${response.data.lastName}`)
                    } else if (paths[0] === "departments") {
                        const response = await axios.get(`${API_URL}/api/departments/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        setEntityName(response.data.name)
                    }
                } catch (error) {
                    console.error(`Error fetching ${paths[0]} details:`, error)
                    setEntityName(null)
                }
            } else {
                setEntityName(null)
            }
        }
        
        fetchEntityName()
    }, [location.pathname, token])

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
                    
                    let label
                    if (index === paths.length - 1 && entityName && (paths[0] === "employees" || paths[0] === "departments")) {
                        label = entityName
                    } else {
                        label = segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                    }

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
    const [entityName, setEntityName] = useState<string | null>(null)
    const token = localStorage.getItem("token")
    
    useEffect(() => {
        const fetchEntityName = async () => {
            if (!token) return
            
            if (paths.length === 2 && (paths[0] === "employees" || paths[0] === "departments")) {
                const id = paths[1]
                if (id === "new") {
                    setEntityName("New " + (paths[0] === "employees" ? "Employee" : "Department"))
                    return
                }
                
                try {
                    if (paths[0] === "employees") {
                        const response = await axios.get(`${API_URL}/api/employees/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        setEntityName(`${response.data.firstName} ${response.data.lastName}`)
                    } else if (paths[0] === "departments") {
                        const response = await axios.get(`${API_URL}/api/departments/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        setEntityName(response.data.name)
                    }
                } catch (error) {
                    console.error(`Error fetching ${paths[0]} details:`, error)
                    setEntityName(null)
                }
            } else {
                setEntityName(null)
            }
        }
        
        fetchEntityName()
    }, [location.pathname, token, paths])
    
    const pageTitle = entityName || (paths.length > 0
        ? paths[paths.length - 1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
        : "Dashboard")
    
    return <h1 className="text-lg font-medium mb-4">{pageTitle}</h1>
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
        <div className="flex h-screen bg-muted text-foreground">
            {/* Sidebar */}
            <aside className="w-56 bg-white border-r border-border flex flex-col p-4">
                <div className="flex items-center justify-center mb-8">
                    <Building2 className="h-8 w-8 mr-2 text-[#3CB371]" />
                    <div className="text-xl font-bold tracking-tight text-foreground">Initech EMS</div>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                    <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:bg-muted"
                        onClick={() => navigate("/employees")}
                    >
                        <Users className="mr-2 h-5 w-5 text-primary"/>
                        Employees
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:bg-muted"
                        onClick={() => navigate("/departments")}
                    >
                        <Layers className="mr-2 h-5 w-5 text-primary"/>
                        Departments
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:bg-muted"
                        onClick={() => navigate("/reports")}
                    >
                        <BarChart className="mr-2 h-5 w-5 text-primary"/>
                        Reports
                    </Button>
                </nav>

                <Button
                    variant="ghost"
                    className="justify-start mt-auto text-foreground hover:bg-muted"
                    onClick={onLogout}
                >
                    <LogOut className="mr-2 h-5 w-5 text-primary"/>
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
                                    {user.role === "ADMIN" && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium text-[#3CB371]">
                                            Admin
                                        </span>
                                    )}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className={`cursor-pointer ${user.role === "ADMIN" ? "border-2 border-[#3CB371]" : ""}`}>
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

                <main className="flex-1 overflow-auto p-6 bg-muted">
                    <PageTitle />
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
